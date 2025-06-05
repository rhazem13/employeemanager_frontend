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
  styleUrls: ['./employee-dashboard.component.css'],
})
export class EmployeeDashboardComponent implements OnInit {
  isLoading = false;
  todayAttendance: any = null;
  recentAttendance: any[] = [];
  weeklySummary: any = null;

  displayedColumns: string[] = ['date', 'checkIn', 'checkOut', 'hoursWorked'];

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 7); // Last 7 days

    // Load attendance data
    this.attendanceService.getAttendanceHistory(startDate, today).subscribe({
      next: (data) => {
        this.recentAttendance = data.dailyRecords;
        if (data.weeklySummaries.length > 0) {
          this.weeklySummary = data.weeklySummaries[0];
        }
        // Find today's attendance
        this.todayAttendance = data.dailyRecords.find(
          (record) =>
            new Date(record.checkInTime).toDateString() === today.toDateString()
        );
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading attendance data:', error);
        this.isLoading = false;
        this.showErrorMessage(
          error.error?.message || 'Failed to load attendance data'
        );
      },
    });
  }

  checkIn(): void {
    this.isLoading = true;
    this.attendanceService.recordCheckIn().subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message);
        this.loadDashboardData();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error recording check-in:', error);
        this.isLoading = false;
        this.showErrorMessage(
          error.error?.message || 'Failed to record check-in'
        );
      },
    });
  }

  checkOut(): void {
    this.isLoading = true;
    this.attendanceService.recordCheckOut().subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message);
        this.loadDashboardData();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error recording check-out:', error);
        this.isLoading = false;
        this.showErrorMessage(
          error.error?.message || 'Failed to record check-out'
        );
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

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
