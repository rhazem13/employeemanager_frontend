import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';
import {
  AttendanceService,
  WeeklyAttendanceResponse,
} from '../../services/attendance.service';

interface PersonalData {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  age: number;
}

interface CheckIn {
  date: string;
  time: string;
  dayOfWeek: string;
}

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent implements OnInit {
  isLoading = false;
  personalData: PersonalData | null = null;
  weeklyAttendance: CheckIn[] = [];
  displayedColumns: string[] = ['dayOfWeek', 'date', 'time'];

  currentWeekStart: Date;
  currentWeekEnd: Date;

  constructor(
    private employeeService: EmployeeService,
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {
    // Initialize to current week
    this.currentWeekStart = this.getWeekStart(new Date());
    this.currentWeekEnd = this.getWeekEnd(this.currentWeekStart);
  }

  ngOnInit(): void {
    this.loadPersonalData();
    this.loadWeeklyAttendance();
  }

  loadPersonalData(): void {
    this.isLoading = true;
    this.employeeService.getPersonalData().subscribe({
      next: (data) => {
        this.personalData = data;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading personal data:', error);
        this.isLoading = false;
        this.showErrorMessage(error);
      },
    });
  }

  loadWeeklyAttendance(): void {
    this.isLoading = true;
    this.attendanceService
      .getWeeklyAttendanceHistory(this.currentWeekStart, this.currentWeekEnd)
      .subscribe({
        next: (data: WeeklyAttendanceResponse) => {
          this.weeklyAttendance = this.processAttendanceData(data);
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading attendance data:', error);
          this.isLoading = false;
          this.showErrorMessage(error);
        },
      });
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.currentWeekEnd = this.getWeekEnd(this.currentWeekStart);
    this.loadWeeklyAttendance();
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.currentWeekEnd = this.getWeekEnd(this.currentWeekStart);
    this.loadWeeklyAttendance();
  }

  getCurrentWeekDisplay(): string {
    const start = this.formatDate(this.currentWeekStart);
    const end = this.formatDate(this.currentWeekEnd);
    return `${start} - ${end}`;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getWeekEnd(startDate: Date): Date {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  }

  private processAttendanceData(data: WeeklyAttendanceResponse): CheckIn[] {
    return data.checkIns
      .map((checkIn) => {
        const date = new Date(checkIn.checkInTime);
        return {
          date: this.formatDate(date),
          time: this.formatTime(date),
          dayOfWeek: this.formatDayOfWeek(date),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private formatDayOfWeek(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private showErrorMessage(error: HttpErrorResponse): void {
    let message = 'An unexpected error occurred';
    if (error.error?.message) {
      message = error.error.message;
    }
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
