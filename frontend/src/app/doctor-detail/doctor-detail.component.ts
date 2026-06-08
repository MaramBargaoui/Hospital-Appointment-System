import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { Appointment, AppointmentStatus, Priority } from '../models/appointment.model';
import type { Doctor } from '../models/doctor.model';
import type { UserResponse } from '../models/auth.model';
import { AppointmentsService } from '../services/appointments.service';
import { AuthSessionService } from '../services/auth-session.service';
import { DoctorsService } from '../services/doctors.service';
import { UserDirectoryService } from '../services/user-directory.service';

@Component({
  selector: 'app-doctor-detail',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './doctor-detail.component.html',
  styleUrl: './doctor-detail.component.scss',
})
export class DoctorDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly doctorsApi = inject(DoctorsService);
  private readonly appointmentsApi = inject(AppointmentsService);
  private readonly directoryApi = inject(UserDirectoryService);
  protected readonly auth = inject(AuthSessionService);

  readonly doctor = signal<Doctor | null>(null);
  readonly appointments = signal<Appointment[]>([]);
  readonly patients = signal<UserResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly statuses: { value: AppointmentStatus; label: string }[] = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  readonly priorities: { value: Priority; label: string }[] = [
    { value: 'NORMAL', label: 'Normal' },
    { value: 'CRITICAL', label: 'Critical' },
  ];

  protected get isAdmin(): boolean {
    return this.auth.user()?.role === 'ADMIN';
  }

  protected get isPatient(): boolean {
    return this.auth.user()?.role === 'PATIENT';
  }

  protected get isDoctor(): boolean {
    return this.auth.user()?.role === 'DOCTOR';
  }

  readonly bookingForm = this.fb.nonNullable.group({
    patientId: [0, [Validators.required, Validators.min(1)]],
    scheduledAt: ['', [Validators.required]],
    priority: this.fb.nonNullable.control<Priority>('NORMAL', [Validators.required]),
    description: [''],
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    forkJoin({
      doctor: this.doctorsApi.get(id),
      appointments: this.appointmentsApi.listByDoctor(id),
      patients: this.directoryApi.listPatients(),
    }).subscribe({
      next: ({ doctor, appointments, patients }) => {
        this.doctor.set(doctor);
        this.appointments.set(appointments);
        this.patients.set(patients);
        this.loading.set(false);
        if (this.isPatient) {
          const me = this.auth.user();
          if (me) {
            this.bookingForm.patchValue({ patientId: me.id });
          }
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Could not load doctor details.');
      },
    });
  }

  protected get scopedAppointments(): Appointment[] {
    const user = this.auth.user();
    if (!user || user.role === 'ADMIN') return this.appointments();
    if (user.role === 'PATIENT') return this.appointments().filter((a) => a.patientId === user.id);
    return this.appointments();
  }

  get upcoming(): Appointment[] {
    const now = new Date();
    return this.scopedAppointments
      .filter((a) => new Date(a.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  get past(): Appointment[] {
    const now = new Date();
    return this.scopedAppointments
      .filter((a) => new Date(a.scheduledAt) <= now)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }

  getPatientName(appt: Appointment): string {
    const p = this.patients().find((x) => x.id === appt.patientId);
    return p ? `${p.firstName} ${p.lastName}` : `#${appt.patientId}`;
  }

  bookAppointment(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }
    const v = this.bookingForm.getRawValue();
    const doc = this.doctor();
    if (!doc) return;

    this.saving.set(true);
    this.errorMessage.set(null);
    this.appointmentsApi
      .create({
        patientId: Number(v.patientId),
        doctorId: doc.id,
        scheduledAt: v.scheduledAt,
        status: 'SCHEDULED',
        priority: v.priority,
        description: v.description.trim() || null,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.bookingForm.reset({ patientId: 0, scheduledAt: '', priority: 'NORMAL', description: '' });
          if (this.isPatient) {
            const me = this.auth.user();
            if (me) {
              this.bookingForm.patchValue({ patientId: me.id });
            }
          }
          const id = Number(this.route.snapshot.paramMap.get('id'));
          this.appointmentsApi.listByDoctor(id).subscribe((appts) => {
            this.appointments.set(appts);
          });
        },
        error: (err) => {
          this.errorMessage.set(err?.error?.error ?? 'Could not book appointment.');
        },
      });
  }

  logout(): void {
    this.auth.logout();
  }
}
