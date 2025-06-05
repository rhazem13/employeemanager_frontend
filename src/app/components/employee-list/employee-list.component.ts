import { Component, OnInit } from '@angular/core';
import { EmployeeService } from '../../services/employee.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  sortColumn: string = '';
  sortDirection: string = 'asc';
  filterValue: string = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.getEmployees();
  }

  getEmployees(): void {
    let sortBy = this.sortColumn
      ? `${this.sortColumn}_${this.sortDirection}`
      : undefined;
    this.employeeService
      .getEmployees(this.currentPage, this.pageSize, sortBy, this.filterValue)
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
          console.log('Sorting Data:', {
            sortColumn: this.sortColumn,
            sortDirection: this.sortDirection,
            sortBy: sortBy,
          });
          console.log('Filter Data:', { filterValue: this.filterValue });
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

  onSort(column: string): void {
    if (this.sortColumn === column) {
      // If clicking the same column, toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If clicking a new column, set it as the sort column and reset direction to asc
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    // Reset to the first page when sorting changes
    this.currentPage = 1;
    this.getEmployees();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filterValue = filterValue.trim().toLowerCase();
    this.currentPage = 1;
    this.getEmployees();
  }
}
