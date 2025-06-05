import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss'],
})
export class EmployeeDashboardComponent implements OnInit {
  isLoading = false;
  todayAttendance: any = null;
  hasCheckedInToday = false;
  recentAttendance: any[] = [];
  weeklySummary: any = null;

  displayedColumns: string[] = ['date', 'checkIn', 'checkOut', 'hoursWorked'];

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkTodayStatus();
    this.loadTodayAttendance();
  }

  checkTodayStatus(): void {
    this.isLoading = true;
    this.attendanceService.isTodayGreen().subscribe({
      next: (isGreen) => {
        this.hasCheckedInToday = isGreen;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error("Error checking today's status:", error);
        this.isLoading = false;
        this.showErrorMessage(error);
      },
    });
  }

  loadTodayAttendance(): void {
    this.isLoading = true;
    const today = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    this.attendanceService.getAttendanceHistory(startDate, today).subscribe({
      next: (data) => {
        console.log(data);
        if (data.dailyRecords.length > 0) {
          this.todayAttendance = data.dailyRecords[0];
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading attendance data:', error);
        this.isLoading = false;
        this.showErrorMessage(error);
      },
    });
  }

  checkIn(): void {
    this.isLoading = true;
    this.attendanceService.recordCheckIn().subscribe({
      next: (response) => {
        this.showSuccessMessage('Check-in recorded successfully');
        this.checkTodayStatus();
        this.loadTodayAttendance();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.showErrorMessage(error);
      },
    });
  }

  checkOut(): void {
    this.isLoading = true;
    this.attendanceService.recordCheckOut().subscribe({
      next: (response) => {
        this.showSuccessMessage('Check-out recorded successfully');
        this.loadTodayAttendance();
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.showErrorMessage(error);
      },
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private showErrorMessage(error: HttpErrorResponse): void {
    let message = 'An unexpected error occurred';
    let panelClass = ['error-snackbar'];

    if (error.status === 400) {
      message = error.error?.message || 'Invalid request';
      panelClass = ['info-snackbar']; // Use info style for 400 errors
    } else if (error.status === 401) {
      message = 'Session expired. Please log in again.';
    } else if (error.error?.message) {
      message = error.error.message;
    }

    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: panelClass,
    });
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }
}
