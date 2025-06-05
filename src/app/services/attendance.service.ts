import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface DailyRecord {
  attendanceId: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  checkInTime: string;
}

export interface WeeklySummary {
  employeeId: number;
  firstName: string;
  lastName: string;
  weekStart: string;
  checkInCount: number;
  hoursWorked: number;
}

export interface AttendanceResponse {
  dailyRecords: DailyRecord[];
  weeklySummaries: WeeklySummary[];
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAttendanceTracking(
    startDate: Date,
    endDate: Date,
    employeeId?: number
  ): Observable<AttendanceResponse> {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let params = new HttpParams()
      .set('StartDate', startDate.toISOString())
      .set('EndDate', endDate.toISOString());

    if (employeeId) {
      params = params.set('EmployeeId', employeeId.toString());
    }

    return this.http.get<AttendanceResponse>(
      `${this.apiUrl}/Attendance/tracking`,
      { headers, params }
    );
  }
}
