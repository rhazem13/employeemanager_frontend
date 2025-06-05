import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

export interface DailyRecord {
  attendanceId: number;
  employeeId: number;
  firstName: string;
  lastName: string;
  checkInTime: string;
  checkOutTime?: string;
  hoursWorked?: number;
}

export interface WeeklySummary {
  employeeId: number;
  firstName: string;
  lastName: string;
  weekStart: string;
  checkInCount: number;
  hoursWorked: number;
  daysPresent: number;
  totalHours: number;
  averageHoursPerDay: number;
}

export interface AttendanceResponse {
  dailyRecords: DailyRecord[];
  weeklySummaries: WeeklySummary[];
}

export interface CheckInResponse {
  message: string;
}

export interface CheckOutResponse {
  message: string;
}

export interface CheckInRecord {
  id: number;
  checkInTime: string;
}

export interface WeeklySummary {
  weekStart: string;
  checkInCount: number;
}

export interface AttendanceHistoryResponse {
  checkIns: CheckInRecord[];
  weeklySummaries: WeeklySummary[];
}

export interface WeeklyAttendanceResponse {
  checkIns: {
    id: number;
    checkInTime: string;
  }[];
  weeklySummaries: {
    weekStart: string;
    checkInCount: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // For admin view - gets attendance for all or specific employee
  getAttendanceTracking(
    startDate: Date,
    endDate: Date,
    employeeId?: number
  ): Observable<AttendanceResponse> {
    let params = new HttpParams()
      .set('StartDate', startDate.toISOString())
      .set('EndDate', endDate.toISOString());

    if (employeeId) {
      params = params.set('EmployeeId', employeeId.toString());
    }

    return this.http.get<AttendanceResponse>(
      `${this.apiUrl}/Attendance/tracking`,
      { headers: this.getHeaders(), params }
    );
  }

  // For employee view - gets attendance history for the authenticated employee
  getAttendanceHistory(
    startDate: Date,
    endDate: Date
  ): Observable<AttendanceResponse> {
    const params = new HttpParams()
      .set('StartDate', startDate.toISOString())
      .set('EndDate', endDate.toISOString());

    return this.http.get<AttendanceResponse>(
      `${this.apiUrl}/Attendance/history`,
      { headers: this.getHeaders(), params }
    );
  }

  recordCheckIn(): Observable<CheckInResponse> {
    const checkInTime = new Date().toISOString();
    return this.http.post<CheckInResponse>(
      `${this.apiUrl}/Attendance/check-in`,
      { checkInTime },
      { headers: this.getHeaders() }
    );
  }

  recordCheckOut(): Observable<CheckOutResponse> {
    const checkOutTime = new Date().toISOString();
    return this.http.post<CheckOutResponse>(
      `${this.apiUrl}/Attendance/check-out`,
      { checkOutTime },
      { headers: this.getHeaders() }
    );
  }

  isTodayGreen(): Observable<boolean> {
    const today = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const params = new HttpParams()
      .set('StartDate', startDate.toISOString())
      .set('EndDate', today.toISOString());

    return this.http
      .get<AttendanceHistoryResponse>(`${this.apiUrl}/Attendance/history`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        map((response) => {
          if (!response.checkIns || response.checkIns.length === 0) {
            return false;
          }

          // Check if any check-in is from today
          const todayString = today.toDateString();
          return response.checkIns.some(
            (checkIn) =>
              new Date(checkIn.checkInTime).toDateString() === todayString
          );
        })
      );
  }

  getWeeklyAttendanceHistory(
    startDate: Date,
    endDate: Date
  ): Observable<WeeklyAttendanceResponse> {
    const params = new HttpParams()
      .set('StartDate', startDate.toISOString())
      .set('EndDate', endDate.toISOString());

    return this.http.get<WeeklyAttendanceResponse>(
      `${this.apiUrl}/Attendance/history`,
      {
        headers: this.getHeaders(),
        params,
      }
    );
  }
}
