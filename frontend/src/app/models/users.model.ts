import type { Role, UserResponse } from './auth.model';

export type { UserResponse };

export interface CreateUserBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UpdateUserBody {
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  password?: string | null;
}
