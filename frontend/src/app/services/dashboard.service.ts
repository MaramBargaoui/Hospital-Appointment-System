import { inject, Injectable } from '@angular/core';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly session = inject(AuthSessionService);

  loadProfile() {
    return this.session.refreshMe();
  }
}
