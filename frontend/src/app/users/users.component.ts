import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import type { Role, UserResponse } from '../models/auth.model';
import { AuthSessionService } from '../services/auth-session.service';
import { UsersService } from '../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly usersApi = inject(UsersService);
  protected readonly auth = inject(AuthSessionService);

  private listSub?: Subscription;

  readonly roles: { value: Role; label: string }[] = [
    { value: 'PATIENT', label: 'Patient' },
    { value: 'DOCTOR', label: 'Doctor' },
    { value: 'RECEPTIONIST', label: 'Receptionist' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  readonly users = signal<UserResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', []],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    role: this.fb.nonNullable.control<Role>('PATIENT', [Validators.required]),
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
    this.listSub = this.usersApi.list().subscribe({
      next: (rows) => {
        this.errorMessage.set(null);
        this.users.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err?.status === 403) {
          this.errorMessage.set(
            'Access denied (403). Sign in as an administrator (e.g. seeded admin@hospital.test) to manage users.',
          );
        } else if (err?.status === 0) {
          /* request cancelled — keep prior list */
        } else {
          this.errorMessage.set(err?.error?.error ?? 'Could not load users.');
        }
      },
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.form.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'PATIENT',
    });
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.errorMessage.set(null);
  }

  startEdit(user: UserResponse): void {
    this.editingId.set(user.id);
    this.form.patchValue({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
    this.errorMessage.set(null);
  }

  cancelForm(): void {
    this.editingId.set(null);
    this.form.reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'PATIENT',
    });
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.saving.set(true);
    const v = this.form.getRawValue();
    const id = this.editingId();
    if (id === null) {
      this.usersApi
        .create({
          email: v.email.trim(),
          password: v.password,
          firstName: v.firstName.trim(),
          lastName: v.lastName.trim(),
          role: v.role,
        })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => {
            this.cancelForm();
            this.reload();
          },
          error: (err) => {
            if (err?.status === 403) {
              this.errorMessage.set(
                'Could not create user (403). Restart the API so the latest security fix is running, then sign in again as admin.',
              );
            } else {
              this.errorMessage.set(err?.error?.error ?? 'Could not create user.');
            }
          },
        });
    } else {
      const prevEmail = this.auth.user()?.email;
      const selfId = this.auth.user()?.id;
      this.usersApi
        .update(id, {
          email: v.email.trim(),
          firstName: v.firstName.trim(),
          lastName: v.lastName.trim(),
          role: v.role,
          password: v.password.trim() || null,
        })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: (updated) => {
            this.cancelForm();
            this.reload();
            const changedOwnEmail =
              selfId != null &&
              selfId === id &&
              prevEmail != null &&
              updated.email.trim().toLowerCase() !== prevEmail.trim().toLowerCase();
            if (changedOwnEmail) {
              this.auth.logout();
              return;
            }
            this.auth.refreshMe().subscribe({
              next: (u) => this.auth.syncStoredProfile(u),
              error: () => {
                /* network noise — profile already saved server-side */
              },
            });
          },
          error: (err) => {
            if (err?.status === 403) {
              this.errorMessage.set(
                'Could not save changes (403). Restart the API with the latest code, then try again.',
              );
            } else {
              this.errorMessage.set(err?.error?.error ?? 'Could not update user.');
            }
          },
        });
    }
  }

  deleteUser(user: UserResponse): void {
    const ok = window.confirm(`Delete user ${user.email}? This cannot be undone.`);
    if (!ok) {
      return;
    }
    this.errorMessage.set(null);
    this.usersApi.delete(user.id).subscribe({
      next: () => {
        if (this.editingId() === user.id) {
          this.cancelForm();
        }
        this.reload();
        this.auth.refreshMe().subscribe({
          next: (u) => this.auth.syncStoredProfile(u),
          error: () => {},
        });
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.error ?? 'Could not delete user.');
      },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
