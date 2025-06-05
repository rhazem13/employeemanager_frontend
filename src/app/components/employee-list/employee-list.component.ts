import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  errorMessage: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    this.employeeService
      .getEmployees(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.employees = response.employees;
          this.totalItems = response.totalCount;
          this.currentPage = response.pageNumber;
          this.pageSize = response.pageSize;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          console.log('Employees fetched successfully', this.employees);
          console.log('Pagination Data:', {
            totalItems: this.totalItems,
            currentPage: this.currentPage,
            pageSize: this.pageSize,
            totalPages: this.totalPages,
          });
        },
        error: (error) => {
          console.error('Error fetching employees', error);
          this.errorMessage = 'Failed to load employees.';
        },
      });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getEmployees();
    }
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1; // Reset to first page when page size changes
    this.getEmployees();
  }
}
