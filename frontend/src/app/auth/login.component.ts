import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    const { email, password } = this.form.getRawValue();
    this.loginService.login({ email: email.trim(), password }).subscribe({
      next: () => void this.router.navigateByUrl('/dashboard'),
      error: (err) => {
        this.submitting.set(false);
        const msg =
          err?.error?.error ??
          (typeof err?.error === 'string' ? err.error : null) ??
          'Unable to sign in. Check your details.';
        this.errorMessage.set(msg);
      },
      complete: () => this.submitting.set(false),
    });
  }
}
