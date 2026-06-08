import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Appointment, AppointmentRequest } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/appointments';

  list() {
    return this.http.get<Appointment[]>(this.base);
  }

  listByDoctor(doctorId: number) {
    return this.http.get<Appointment[]>(this.base, { params: { doctorId: doctorId.toString() } });
  }

  create(body: AppointmentRequest) {
    return this.http.post<Appointment>(this.base, body);
  }

  update(id: number, body: AppointmentRequest) {
    return this.http.put<Appointment>(`${this.base}/${id}`, body);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
