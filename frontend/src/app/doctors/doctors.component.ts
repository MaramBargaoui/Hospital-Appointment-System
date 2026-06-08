import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { Doctor } from '../models/doctor.model';
import { AuthSessionService } from '../services/auth-session.service';
import { DoctorsService } from '../services/doctors.service';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.scss',
})
export class DoctorsComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly doctorsApi = inject(DoctorsService);
  protected readonly auth = inject(AuthSessionService);

  private listSub?: Subscription;

  readonly doctors = signal<Doctor[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);

  protected get isAdmin(): boolean {
    return this.auth.user()?.role === 'ADMIN';
  }

  protected get isPatient(): boolean {
    return this.auth.user()?.role === 'PATIENT';
  }

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    specialty: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.email]],
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
    this.listSub = this.doctorsApi.list().subscribe({
      next: (rows) => {
        this.doctors.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.error ?? 'Could not load doctors.');
      },
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.form.reset({ firstName: '', lastName: '', specialty: '', email: '' });
    this.errorMessage.set(null);
  }

  startEdit(d: Doctor): void {
    this.editingId.set(d.id);
    this.form.patchValue({
      firstName: d.firstName,
      lastName: d.lastName,
      specialty: d.specialty,
      email: d.email ?? '',
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
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      specialty: v.specialty.trim(),
      email: v.email.trim() || null,
    };
    this.errorMessage.set(null);
    this.saving.set(true);
    const id = this.editingId();
    const req =
      id === null ? this.doctorsApi.create(body) : this.doctorsApi.update(id, body);
    req.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.cancelForm();
        this.reload();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error ?? 'Could not save doctor.');
      },
    });
  }

  deleteDoctor(d: Doctor): void {
    if (!window.confirm(`Delete Dr. ${d.firstName} ${d.lastName}?`)) {
      return;
    }
    this.doctorsApi.delete(d.id).subscribe({
      next: () => {
        if (this.editingId() === d.id) {
          this.cancelForm();
        }
        this.reload();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error ?? 'Could not delete doctor.');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
