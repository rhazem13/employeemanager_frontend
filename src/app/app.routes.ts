import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

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
        path: 'admin/employees', // Relative path to the parent ('')
        component: EmployeeListComponent,
        data: { roles: ['Admin'] },
      },
      // Add other protected routes as children here
      // For example: { path: 'employee/profile', component: EmployeeProfileComponent, data: { roles: ['Employee'] } }

      // Redirect to dashboard by default when accessing the protected area base path ('/')
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Redirect any unknown paths to login (or a 404 page)
  { path: '**', redirectTo: 'login' },
];
