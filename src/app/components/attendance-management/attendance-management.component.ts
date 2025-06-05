import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  AttendanceService,
  DailyRecord,
  WeeklySummary,
} from '../../services/attendance.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './attendance-management.component.html',
  styleUrls: ['./attendance-management.component.scss'],
})
export class AttendanceManagementComponent implements OnInit {
  dailyRecords: DailyRecord[] = [];
  weeklySummaries: WeeklySummary[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  selectedEmployeeId?: number;
  employees: any[] = [];
  isLoading = false;

  displayedColumns: string[] = ['employeeId', 'name', 'checkInTime'];
  weeklyColumns: string[] = [
    'employeeId',
    'name',
    'weekStart',
    'checkInCount',
    'hoursWorked',
  ];

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService
  ) {
    // Set default date range to current week
    this.startDate.setDate(this.startDate.getDate() - this.startDate.getDay());
    this.endDate.setDate(this.startDate.getDate() + 6);
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAttendanceData();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees(1, 100).subscribe({
      next: (data) => {
        this.employees = data.items || [];
      },
      error: (error) => {
        console.error('Error loading employees:', error);
      },
    });
  }

  loadAttendanceData(): void {
    this.isLoading = true;
    this.attendanceService
      .getAttendanceTracking(
        this.startDate,
        this.endDate,
        this.selectedEmployeeId
      )
      .subscribe({
        next: (data) => {
          this.dailyRecords = data.dailyRecords || [];
          this.weeklySummaries = data.weeklySummaries || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading attendance data:', error);
          this.isLoading = false;
        },
      });
  }

  onDateRangeChange(): void {
    this.loadAttendanceData();
  }

  onEmployeeChange(): void {
    this.loadAttendanceData();
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(
      (emp) => emp.employeeId === employeeId
    );
    return employee ? `${employee.firstName} ${employee.lastName}` : '';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
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
}
