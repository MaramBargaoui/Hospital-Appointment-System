import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import type { AuthResponse } from '../models/auth.model';
import type { RegisterRequest } from '../models/register.model';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(AuthSessionService);
  private readonly baseUrl = '/api/auth';

  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, body).pipe(
      tap((res) => this.session.persistAuth(res)),
      catchError((err) => throwError(() => err)),
    );
  }
}
