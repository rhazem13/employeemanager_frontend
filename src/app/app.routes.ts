import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
// // import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { AddEmployeeComponent } from './components/add-employee/add-employee.component';
import { EditEmployeeComponent } from './components/edit-employee/edit-employee.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';

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
    path: '', // This will be the base path for the layout
    component: MainLayoutComponent,
    canActivate: [authGuard], // Protect the entire layout
    children: [
      {
        path: 'dashboard', // Relative path to the parent ('')
        component: DashboardComponent,
        // Roles can be defined here or inherited from parent if all children have same roles
        data: { roles: ['Admin', 'Employee'] },
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
        ],
      },
      // Redirect to appropriate dashboard based on role
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // Redirect any unknown paths to login
  { path: '**', redirectTo: 'login' },
];
