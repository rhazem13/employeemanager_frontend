import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Array<string>;

  const token = authService.getToken();
  const userRole = authService.getUserRole();

  if (token) {
    // User is authenticated, now check roles if required
    if (requiredRoles && requiredRoles.length > 0) {
      if (userRole && requiredRoles.includes(userRole)) {
        // Role is allowed
        return true;
      } else {
        // Authenticated but role not allowed
        console.warn(
          'User role',
          userRole,
          'not allowed for route',
          state.url,
          '. Required roles:',
          requiredRoles
        );
        // Redirect to a forbidden page or login
        // For now, redirect to login, can change later
        router.navigate(['/login']);
        return false;
      }
    } else {
      // No specific roles required, just authentication is enough
      return true;
    }
  } else {
    // Not authenticated
    router.navigate(['/login']);
    return false;
  }
};
