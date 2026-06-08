export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
export type Priority = 'NORMAL' | 'CRITICAL';

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  scheduledAt: string;
  status: AppointmentStatus;
  notes: string | null;
  priority: Priority;
  description: string | null;
}

export interface AppointmentRequest {
  patientId: number;
  doctorId: number;
  scheduledAt: string;
  status: AppointmentStatus;
  notes?: string | null;
  priority: Priority;
  description?: string | null;
}
