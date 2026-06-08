import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import type { AuthResponse, UserResponse } from '../models/auth.model';

const STORAGE_KEY = 'hospital.auth';

interface StoredSession {
  token: string;
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = '/api/auth';

  readonly user = signal<UserResponse | null>(null);
  readonly isLoggedIn = computed(() => this.user() !== null);

  constructor() {
    this.restoreSession();
  }

  getToken(): string | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return (JSON.parse(raw) as StoredSession).token;
    } catch {
      return null;
    }
  }

  persistAuth(res: AuthResponse): void {
    const session: StoredSession = {
      token: res.accessToken,
      userId: res.userId,
      email: res.email,
      role: res.role,
      firstName: res.firstName,
      lastName: res.lastName,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.user.set({
      id: res.userId,
      email: res.email,
      role: res.role,
      firstName: res.firstName,
      lastName: res.lastName,
    });
  }

  refreshMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`).pipe(
      tap((u) => this.user.set(u)),
    );
  }

  bootstrapSession(): Observable<UserResponse | null> {
    if (!this.getToken()) {
      this.user.set(null);
      return of(null);
    }
    return this.refreshMe().pipe(
      catchError(() => {
        this.logout();
        return of(null);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.user.set(null);
    void this.router.navigateByUrl('/login');
  }

  syncStoredProfile(u: UserResponse): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const s = JSON.parse(raw) as StoredSession;
      s.email = u.email;
      s.firstName = u.firstName;
      s.lastName = u.lastName;
      s.role = u.role;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const s = JSON.parse(raw) as StoredSession;
      this.user.set({
        id: s.userId,
        email: s.email,
        role: s.role as UserResponse['role'],
        firstName: s.firstName,
        lastName: s.lastName,
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
