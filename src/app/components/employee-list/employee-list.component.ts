import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from '../../services/employee.service';
import { MatTableDataSource } from '@angular/material/table';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  errorMessage: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;
  sortColumn: string = '';
  sortDirection: string = 'asc';
  filterValue: string = '';
  displayedColumns: string[] = [
    'firstName',
    'lastName',
    'email',
    'phoneNumber',
    'nationalId',
    'age',
    'actions',
  ];

  // Define allowed sortable columns (using camelCase in frontend for property access)
  allowedSortColumns = ['firstName', 'lastName', 'age'];

  pageNumber: number = 1;
  totalCount: number = 0;

  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.employeeService
      .getEmployees(
        this.pageNumber,
        this.pageSize,
        this.sortColumn,
        this.sortDirection,
        this.filterValue
      )
      .subscribe({
        next: (response: any) => {
          console.log('Response:', response);
          if (response && response.employees) {
            this.dataSource.data = response.employees;
            this.totalCount = response.totalCount;
            this.pageNumber = response.pageNumber;
            this.pageSize = response.pageSize;
          }
        },
        error: (error) => {
          console.error('Error fetching employees', error);
          this.errorMessage =
            'Failed to load employees. Please try again later.';
        },
      });
  }

  onPageChange(event: any): void {
    if (typeof event === 'number') {
      this.pageNumber = event;
    } else {
      this.pageNumber = event.pageIndex + 1;
      this.pageSize = event.pageSize;
    }
    this.loadEmployees();
  }

  onSort(column: string): void {
    // Only sort if the column is in the allowed list
    if (this.allowedSortColumns.includes(column)) {
      if (this.sortColumn === column) {
        // If clicking the same column, toggle direction
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        // If clicking a new column, set it as the sort column and reset direction to asc
        this.sortColumn = column;
        this.sortDirection = 'asc';
      }
      // Reset to the first page when sorting changes
      this.pageNumber = 1;
      this.loadEmployees();
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue.trim().toLowerCase();
    this.currentPage = 1; // Reset to first page when filter changes
    this.loadEmployees(); // Fetch data with the new filter
  }

  deleteEmployee(id: string): void {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      this.snackBar.open('Please log in to perform this action', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      this.router.navigate(['/login']);
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '300px',
      data: { id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.employeeService.deleteEmployee(id).subscribe({
          next: () => {
            this.snackBar.open('Employee deleted successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.loadEmployees(); // Refresh the list
          },
          error: (error: any) => {
            console.error('Error deleting employee', error);
            if (error.status === 401) {
              this.snackBar.open(
                'Session expired. Please log in again.',
                'Close',
                {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                }
              );
              localStorage.removeItem('jwt_token');
              this.router.navigate(['/login']);
            } else if (error.status === 403) {
              this.snackBar.open(
                'You do not have permission to delete employees',
                'Close',
                {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                }
              );
            } else {
              this.snackBar.open('Failed to delete employee', 'Close', {
                duration: 3000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
              });
            }
          },
        });
      }
    });
  }

  editEmployee(id: number): void {
    this.router.navigate(['/admin/employees/edit', id]);
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageNumber = 1; // Reset to first page when page size changes
    this.loadEmployees();
  }
}

@Component({
  selector: 'confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Confirm Delete</h2>
    <mat-dialog-content>
      Are you sure you want to delete this employee?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDeleteDialog {
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialog>) {}
}
