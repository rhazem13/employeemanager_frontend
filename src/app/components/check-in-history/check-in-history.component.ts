import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AttendanceService,
  WeeklyAttendanceResponse,
} from '../../services/attendance.service';

interface CheckIn {
  date: string;
  time: string;
  dayOfWeek: string;
}

interface WeeklySummary {
  weekStart: string;
  formattedWeekRange: string;
  checkInCount: number;
}

@Component({
  selector: 'app-check-in-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './check-in-history.component.html',
  styleUrls: ['./check-in-history.component.scss'],
})
export class CheckInHistoryComponent implements OnInit {
  isLoading = false;
  checkIns: CheckIn[] = [];
  weeklySummaries: WeeklySummary[] = [];

  checkInColumns: string[] = ['dayOfWeek', 'date', 'time'];
  summaryColumns: string[] = ['weekRange', 'checkInCount'];

  constructor(
    private attendanceService: AttendanceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.isLoading = true;
    // Get history for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    this.attendanceService
      .getWeeklyAttendanceHistory(startDate, endDate)
      .subscribe({
        next: (data: WeeklyAttendanceResponse) => {
          this.processHistoryData(data);
          this.isLoading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading history:', error);
          this.isLoading = false;
          this.showErrorMessage(error);
        },
      });
  }

  private processHistoryData(data: WeeklyAttendanceResponse): void {
    // Process check-ins
    this.checkIns = data.checkIns
      .map((checkIn) => {
        const date = new Date(checkIn.checkInTime);
        return {
          date: this.formatDate(date),
          time: this.formatTime(date),
          dayOfWeek: this.formatDayOfWeek(date),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

    // Process weekly summaries
    this.weeklySummaries = data.weeklySummaries
      .map((summary) => {
        const weekStart = new Date(summary.weekStart);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return {
          weekStart: summary.weekStart,
          formattedWeekRange: `${this.formatDate(
            weekStart
          )} - ${this.formatDate(weekEnd)}`,
          checkInCount: summary.checkInCount,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
      ); // Sort newest first
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
