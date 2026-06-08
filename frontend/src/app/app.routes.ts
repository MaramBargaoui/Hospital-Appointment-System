import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'users',
    canActivate: [adminGuard],
    loadComponent: () => import('./users/users.component').then((m) => m.UsersComponent),
  },
  {
    path: 'doctors',
    canActivate: [authGuard],
    loadComponent: () => import('./doctors/doctors.component').then((m) => m.DoctorsComponent),
  },
  {
    path: 'appointments',
    canActivate: [authGuard],
    loadComponent: () => import('./appointments/appointments.component').then((m) => m.AppointmentsComponent),
  },
  {
    path: 'doctors/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./doctor-detail/doctor-detail.component').then((m) => m.DoctorDetailComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
