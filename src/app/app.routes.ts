import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmployeeListComponent } from './components/employee-list/employee-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin', 'Employee'] },
  },
  {
    path: 'admin/employees',
    component: EmployeeListComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // Add a wildcard route for any other path (optional, but good practice)
  // { path: '**', redirectTo: '/login' }
];
