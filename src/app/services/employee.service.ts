import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = 'https://localhost:7203/api/Employee';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getEmployees(
    pageNumber: number,
    pageSize: number,
    sortBy?: string,
    sortDirection?: string,
    filter?: string
  ): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let params = new HttpParams();
    params = params.append('PageNumber', pageNumber.toString());
    params = params.append('PageSize', pageSize.toString());

    if (sortBy) {
      params = params.append('SortBy', sortBy);
    }

    if (sortDirection) {
      params = params.append('SortDirection', sortDirection);
    }

    if (filter) {
      params = params.append('Filter', filter);
    }

    return this.http
      .get(`${this.apiUrl}/list`, { headers: headers, params: params })
      .pipe(catchError(this.handleError));
  }

  addEmployee(employeeData: any): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http
      .post(this.apiUrl, employeeData, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  getEmployeeById(id: string): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http
      .get(`${this.apiUrl}/${id}`, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  updateEmployee(id: string, employeeData: any): Observable<any> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http
      .put(`${this.apiUrl}/${id}`, employeeData, { headers: headers })
      .pipe(catchError(this.handleError));
  }

  deleteEmployee(id: string) {
    const token = localStorage.getItem('jwt_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    // Propagate the error for component-specific handling
    return throwError(() => error);
  }
}
