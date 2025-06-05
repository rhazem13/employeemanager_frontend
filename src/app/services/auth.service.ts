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

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    const token = localStorage.getItem('jwt_token');
    if (token) {
      this.isAuthenticatedSubject.next(true);
      // Decode token to get user role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        if (payload.role) {
          this.userRoleSubject.next(payload.role);
          localStorage.setItem('user_role', payload.role); // Backup role in localStorage
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
          // Decode token to get user role
          const payload = JSON.parse(atob(response.token.split('.')[1]));
          console.log('Token payload:', payload);
          if (payload.role) {
            this.userRoleSubject.next(payload.role);
            localStorage.setItem('user_role', payload.role); // Backup role in localStorage
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

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next('');
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
