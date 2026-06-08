import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { CreateUserBody, UpdateUserBody, UserResponse } from '../models/users.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/admin/users';

  list() {
    return this.http.get<UserResponse[]>(this.base);
  }

  create(body: CreateUserBody) {
    return this.http.post<UserResponse>(this.base, body);
  }

  update(id: number, body: UpdateUserBody) {
    const payload: {
      email: string;
      firstName: string;
      lastName: string;
      role: CreateUserBody['role'];
      password?: string | null;
    } = {
      email: body.email.trim(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      role: body.role,
    };
    const pwd = body.password?.trim();
    payload.password = pwd ? pwd : null;
    return this.http.put<UserResponse>(`${this.base}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
