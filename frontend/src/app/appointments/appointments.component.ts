import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { Appointment, AppointmentStatus, Priority } from '../models/appointment.model';
import type { Doctor } from '../models/doctor.model';
import type { UserResponse } from '../models/auth.model';
import { AppointmentsService } from '../services/appointments.service';
import { AuthSessionService } from '../services/auth-session.service';
import { DoctorsService } from '../services/doctors.service';
import { UserDirectoryService } from '../services/user-directory.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.scss',
})
export class AppointmentsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentsApi = inject(AppointmentsService);
  private readonly doctorsApi = inject(DoctorsService);
  private readonly directoryApi = inject(UserDirectoryService);
  protected readonly auth = inject(AuthSessionService);

  private listSub?: Subscription;

  readonly statuses: { value: AppointmentStatus; label: string }[] = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  readonly priorities: { value: Priority; label: string }[] = [
    { value: 'NORMAL', label: 'Normal' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  readonly appointments = signal<Appointment[]>([]);
  readonly patients = signal<UserResponse[]>([]);
  readonly doctors = signal<Doctor[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);
  readonly priorityFilter = signal<Priority | 'ALL'>('ALL');

  protected get isAdmin(): boolean {
    return this.auth.user()?.role === 'ADMIN';
  }

  protected get isPatient(): boolean {
    return this.auth.user()?.role === 'PATIENT';
  }

  protected get isDoctor(): boolean {
    return this.auth.user()?.role === 'DOCTOR';
  }

  protected readonly filteredAppointments = computed(() => {
    const user = this.auth.user();
    const all = this.appointments();
    if (!user) return all;

    let scoped = all;
    if (user.role === 'PATIENT') {
      scoped = all.filter((a) => a.patientId === user.id);
    } else if (user.role === 'DOCTOR') {
      const doctor = this.doctors().find(
        (d) => d.email?.toLowerCase() === user.email.toLowerCase(),
      );
      if (doctor) {
        scoped = all.filter((a) => a.doctorId === doctor.id);
      }
    }

    const pf = this.priorityFilter();
    if (pf !== 'ALL') {
      scoped = scoped.filter((a) => a.priority === pf);
    }

    return scoped;
  });

  readonly form = this.fb.nonNullable.group({
    patientId: [0, [Validators.required, Validators.min(1)]],
    doctorId: [0, [Validators.required, Validators.min(1)]],
    scheduledAt: ['', [Validators.required]],
    status: this.fb.nonNullable.control<AppointmentStatus>('SCHEDULED', [Validators.required]),
    notes: [''],
    priority: this.fb.nonNullable.control<Priority>('NORMAL', [Validators.required]),
    description: [''],
  });

  ngOnInit(): void {
    this.startCreate();
    this.reload();
  }

  ngOnDestroy(): void {
    this.listSub?.unsubscribe();
  }

  reload(): void {
    this.listSub?.unsubscribe();
    this.loading.set(true);
    this.errorMessage.set(null);
    this.listSub = forkJoin({
      appointments: this.appointmentsApi.list(),
      patients: this.directoryApi.listPatients(),
      doctors: this.doctorsApi.list(),
    }).subscribe({
      next: ({ appointments, patients, doctors }) => {
        this.appointments.set(appointments);
        this.patients.set(patients);
        this.doctors.set(doctors);
        this.loading.set(false);
        const me = this.auth.user();
        if (me && this.editingId() === null) {
          this.form.patchValue({ patientId: me.id });
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.error ?? 'Could not load appointments.');
      },
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    const me = this.auth.user();
    this.form.reset({
      patientId: me?.id ?? 0,
      doctorId: 0,
      scheduledAt: '',
      status: 'SCHEDULED',
      notes: '',
      priority: 'NORMAL',
      description: '',
    });
    this.errorMessage.set(null);
  }

  startEdit(a: Appointment): void {
    this.editingId.set(a.id);
    const local = a.scheduledAt.length >= 16 ? a.scheduledAt.slice(0, 16) : a.scheduledAt;
    this.form.patchValue({
      patientId: a.patientId,
      doctorId: a.doctorId,
      scheduledAt: local,
      status: a.status,
      notes: a.notes ?? '',
      priority: a.priority,
      description: a.description ?? '',
    });
    this.errorMessage.set(null);
  }

  cancelForm(): void {
    this.startCreate();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const body = {
      patientId: Number(v.patientId),
      doctorId: Number(v.doctorId),
      scheduledAt: v.scheduledAt,
      status: v.status,
      notes: v.notes.trim() || null,
      priority: v.priority,
      description: v.description.trim() || null,
    };
    this.errorMessage.set(null);
    this.saving.set(true);
    const id = this.editingId();
    const req =
      id === null
        ? this.appointmentsApi.create(body)
        : this.appointmentsApi.update(id, body);
    req.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.cancelForm();
        this.reload();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error ?? 'Could not save appointment.');
      },
    });
  }

  deleteAppointment(a: Appointment): void {
    if (!window.confirm(`Delete appointment #${a.id}?`)) {
      return;
    }
    this.appointmentsApi.delete(a.id).subscribe({
      next: () => {
        if (this.editingId() === a.id) {
          this.cancelForm();
        }
        this.reload();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error ?? 'Could not delete appointment.');
      },
    });
  }

  patientLabel(id: number): string {
    const p = this.patients().find((x) => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : `#${id}`;
  }

  doctorLabel(id: number): string {
    const d = this.doctors().find((x) => x.id === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `#${id}`;
  }

  logout(): void {
    this.auth.logout();
  }
}
