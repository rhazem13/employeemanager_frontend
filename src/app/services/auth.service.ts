import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<string>('');
  private employeeIdSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = localStorage.getItem('jwt_token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
      // Decode token to get user role and employeeId
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role) {
          this.userRoleSubject.next(payload.role);
          localStorage.setItem('user_role', payload.role); // Backup role in localStorage
        }
        if (payload.employeeId) {
          this.employeeIdSubject.next(payload.employeeId.toString());
          localStorage.setItem('employee_id', payload.employeeId.toString()); // Backup employeeId in localStorage
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        this.logout();
      }
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
          this.isAuthenticatedSubject.next(true);
          // Decode token to get user role and employeeId
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          if (payload.role) {
            this.userRoleSubject.next(payload.role);
            localStorage.setItem('user_role', payload.role);
          }
          if (payload.employeeId) {
            this.employeeIdSubject.next(payload.employeeId.toString());
            localStorage.setItem('employee_id', payload.employeeId.toString());
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/auth/register`, userData)
      .pipe(catchError(this.handleError));
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUserRole(): string {
    // First try to get from BehaviorSubject
    const role = this.userRoleSubject.value;
    if (role) {
      return role;
    }
    // If not in BehaviorSubject, try to get from token
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role) {
          this.userRoleSubject.next(payload.role);
          return payload.role;
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    // If all else fails, try localStorage backup
    return localStorage.getItem('user_role') || '';
  }

  getUserRoleObservable(): Observable<string> {
    return this.userRoleSubject.asObservable();
  }

  getEmployeeIdObservable(): Observable<string | null> {
    return this.employeeIdSubject.asObservable();
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('employee_id');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next('');
    this.employeeIdSubject.next(null);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    console.log('Error:', error);
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `${error.error.message}`;
      console.log('Error message:', errorMessage);
    }
    return throwError(() => error);
  }
}
