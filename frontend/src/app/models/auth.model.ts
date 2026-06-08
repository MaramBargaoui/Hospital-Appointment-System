export type Role = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  id: number;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}
