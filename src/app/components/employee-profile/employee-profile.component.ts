import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';

interface PersonalData {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  age: number;
  role: string;
  weeklyAttendance: WeeklyAttendance[];
}

interface WeeklyAttendance {
  weekStart: string;
  daysPresent: number;
  totalHours: number;
  averageHoursPerDay: number;
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
  ],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent implements OnInit {
  isLoading = false;
  personalData: PersonalData | null = null;
  displayedColumns: string[] = [
    'weekStart',
    'daysPresent',
    'totalHours',
    'averageHours',
  ];

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPersonalData();
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

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
