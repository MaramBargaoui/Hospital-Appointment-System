import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import type { Appointment } from '../models/appointment.model';
import type { Doctor } from '../models/doctor.model';
import { AppointmentsService } from '../services/appointments.service';
import { AuthSessionService } from '../services/auth-session.service';
import { DoctorsService } from '../services/doctors.service';
import { UserDirectoryService } from '../services/user-directory.service';
import type { UserResponse } from '../models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthSessionService);
  private readonly doctorsApi = inject(DoctorsService);
  private readonly appointmentsApi = inject(AppointmentsService);
  private readonly directoryApi = inject(UserDirectoryService);

  readonly doctors = signal<Doctor[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly patients = signal<UserResponse[]>([]);
  readonly filter = signal<'all' | 'available' | 'busy' | 'appointments'>('all');
  readonly loadingDoctors = signal(true);
  readonly loadingAppointments = signal(true);
  readonly loadingPatients = signal(true);

  protected get isAdmin(): boolean {
    return this.auth.user()?.role === 'ADMIN';
  }

  protected get isPatient(): boolean {
    return this.auth.user()?.role === 'PATIENT';
  }

  protected get isDoctor(): boolean {
    return this.auth.user()?.role === 'DOCTOR';
  }

  protected readonly myDoctorId = computed(() => {
    const user = this.auth.user();
    if (user?.role !== 'DOCTOR') return null;
    const doctor = this.doctors().find(
      (d) => d.email?.toLowerCase() === user.email.toLowerCase(),
    );
    return doctor?.id ?? null;
  });

  protected readonly roleScopedAppointments = computed(() => {
    const user = this.auth.user();
    const all = this.appointments();
    if (!user) return all;
    if (user.role === 'PATIENT') return all.filter((a) => a.patientId === user.id);
    if (user.role === 'DOCTOR') {
      const docId = this.myDoctorId();
      return docId ? all.filter((a) => a.doctorId === docId) : [];
    }
    return all;
  });

  get loaded(): boolean {
    return !this.loadingDoctors() && !this.loadingAppointments() && !this.loadingPatients();
  }

  ngOnInit(): void {
    this.doctorsApi.list().pipe(catchError(() => of([]))).subscribe({
      next: (d) => this.doctors.set(d),
      complete: () => this.loadingDoctors.set(false),
    });
    this.appointmentsApi.list().pipe(catchError(() => of([]))).subscribe({
      next: (a) => this.appointments.set(a),
      complete: () => this.loadingAppointments.set(false),
    });
    this.directoryApi.listPatients().pipe(catchError(() => of([]))).subscribe({
      next: (p) => this.patients.set(p),
      complete: () => this.loadingPatients.set(false),
    });
  }

  get availableDoctors(): Doctor[] {
    const now = new Date();
    const busyIds = new Set(
      this.appointments()
        .filter((a) => a.status === 'SCHEDULED' && new Date(a.scheduledAt) > now)
        .map((a) => a.doctorId),
    );
    return this.doctors().filter((d) => !busyIds.has(d.id));
  }

  get busyDoctors(): Doctor[] {
    const now = new Date();
    const busyIds = new Set(
      this.appointments()
        .filter((a) => a.status === 'SCHEDULED' && new Date(a.scheduledAt) > now)
        .map((a) => a.doctorId),
    );
    return this.doctors().filter((d) => busyIds.has(d.id));
  }

  get todayAppointments(): Appointment[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.roleScopedAppointments().filter((a) => {
      const d = new Date(a.scheduledAt);
      return d >= today && d < tomorrow;
    });
  }

  protected readonly upcomingAppointments = computed(() => {
    const now = new Date();
    return this.roleScopedAppointments()
      .filter((a) => a.status === 'SCHEDULED' && new Date(a.scheduledAt) > now)
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  });

  protected readonly pastAppointments = computed(() => {
    const now = new Date();
    return this.roleScopedAppointments()
      .filter((a) => new Date(a.scheduledAt) <= now || a.status !== 'SCHEDULED')
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  });

  get filteredDoctors(): Doctor[] {
    const f = this.filter();
    if (f === 'available') return this.availableDoctors;
    if (f === 'busy') return this.busyDoctors;
    return this.doctors();
  }

  get filteredAppointments(): Appointment[] {
    const f = this.filter();
    if (f === 'appointments') return this.todayAppointments;
    return this.roleScopedAppointments();
  }

  setFilter(f: 'all' | 'available' | 'busy' | 'appointments'): void {
    this.filter.set(this.filter() === f ? 'all' : f);
  }

  getPatientName(appt: Appointment): string {
    const p = this.patients().find((x) => x.id === appt.patientId);
    return p ? `${p.firstName} ${p.lastName}` : `#${appt.patientId}`;
  }

  getDoctorName(appt: Appointment): string {
    const d = this.doctors().find((x) => x.id === appt.doctorId);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : `#${appt.doctorId}`;
  }

  logout(): void {
    this.auth.logout();
  }
}
