import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { UserResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserDirectoryService {
  private readonly http = inject(HttpClient);

  listPatients() {
    return this.http.get<UserResponse[]>('/api/users/directory');
  }
}
