export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
  email: string | null;
}

export interface DoctorRequest {
  firstName: string;
  lastName: string;
  specialty: string;
  email?: string | null;
}
