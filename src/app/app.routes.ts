import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
// // import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { AddEmployeeComponent } from './components/add-employee/add-employee.component';
import { EditEmployeeComponent } from './components/edit-employee/edit-employee.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  // {
  //   path: 'register',
  //   loadComponent: () =>
  //     import('./components/register/register.component').then(
  //       (m) => m.RegisterComponent
  //     ),
  // },

  // Protected routes using the main layout
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { roles: ['Admin'] },
      },
      {
        path: 'admin',
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        children: [
          {
            path: 'employees',
            loadComponent: () =>
              import('./components/employee-list/employee-list.component').then(
                (m) => m.EmployeeListComponent
              ),
          },
          {
            path: 'add-employee',
            loadComponent: () =>
              import('./components/add-employee/add-employee.component').then(
                (m) => m.AddEmployeeComponent
              ),
          },
          {
            path: 'employees/edit/:id',
            loadComponent: () =>
              import('./components/edit-employee/edit-employee.component').then(
                (m) => m.EditEmployeeComponent
              ),
          },
          {
            path: 'attendance',
            loadComponent: () =>
              import(
                './components/attendance-management/attendance-management.component'
              ).then((m) => m.AttendanceManagementComponent),
          },
        ],
      },
      // Employee routes
      {
        path: 'employee',
        canActivate: [authGuard],
        data: { roles: ['Employee'] },
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import(
                './components/employee-dashboard/employee-dashboard.component'
              ).then((m) => m.EmployeeDashboardComponent),
          },
          {
            path: 'profile',
            loadComponent: () =>
              import(
                './components/employee-profile/employee-profile.component'
              ).then((m) => m.EmployeeProfileComponent),
          },
          {
            path: 'check-in-history',
            loadComponent: () =>
              import(
                './components/check-in-history/check-in-history.component'
              ).then((m) => m.CheckInHistoryComponent),
          },
        ],
      },
      // Root path redirect based on role
      {
        path: '',
        resolve: {
          redirect: () => {
            const authService = inject(AuthService);
            const userRole = authService.getUserRole();
            return userRole === 'Admin' ? '/dashboard' : '/employee/dashboard';
          },
        },
        redirectTo: '',
        pathMatch: 'full',
      },
    ],
  },

  // Redirect any unknown paths to login
  { path: '**', redirectTo: 'login' },
];
