import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  if (!auth.getToken()) {
    return router.parseUrl('/login');
  }
  return auth.bootstrapSession().pipe(
    map((user) => (user ? true : router.parseUrl('/login'))),
  );
};

/** Redirect to dashboard when already signed in (login/register pages). */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  if (!auth.getToken()) {
    return true;
  }
  return auth.bootstrapSession().pipe(
    map((user) => (user ? router.parseUrl('/dashboard') : true)),
  );
};

/**
 * Admin-only routes: re-checks the session with `/api/auth/me` so the decision
 * matches the server (avoids stale `localStorage` role vs JWT/backend role).
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthSessionService);
  const router = inject(Router);
  if (!auth.getToken()) {
    return router.parseUrl('/login');
  }
  return auth.bootstrapSession().pipe(
    map((user) => {
      if (!user) {
        return router.parseUrl('/login');
      }
      if (user.role !== 'ADMIN') {
        return router.parseUrl('/dashboard');
      }
      return true;
    }),
  );
};
