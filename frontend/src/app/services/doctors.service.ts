import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Doctor, DoctorRequest } from '../models/doctor.model';

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/doctors';

  list() {
    return this.http.get<Doctor[]>(this.base);
  }

  get(id: number) {
    return this.http.get<Doctor>(`${this.base}/${id}`);
  }

  create(body: DoctorRequest) {
    return this.http.post<Doctor>(this.base, body);
  }

  update(id: number, body: DoctorRequest) {
    return this.http.put<Doctor>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
