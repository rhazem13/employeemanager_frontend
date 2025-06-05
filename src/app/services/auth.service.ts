import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7203/api/Auth';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('jwt_token', response.token);
          localStorage.setItem('user_role', response.role);
          localStorage.setItem('employee_id', response.employeeId);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register`, userData)
      .pipe(catchError(this.handleError));
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getEmployeeId(): string | null {
    return localStorage.getItem('employee_id');
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('employee_id');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    let validationErrors = null;

    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      if (error.status === 400 && error.error && error.error.errors) {
        // Backend validation errors
        validationErrors = error.error.errors;
        errorMessage = error.error.title || 'Validation failed';
        console.error('Validation errors:', validationErrors);
      } else if (error.status === 400 && error.error && error.error.message) {
        // Specific backend message for 400 (like login)
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error(errorMessage);
    // Throw an object that includes both the general message and specific validation errors
    return throwError(() => ({
      message: errorMessage,
      validationErrors: validationErrors,
    }));
  }
}
