import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss',
})
export class EditEmployeeComponent implements OnInit {
  employeeId: string | null = null;
  employee: any;
  editEmployeeForm!: FormGroup;
  errorMessage: string | null = null;
  validationErrors: any = {};
  objectKeys = Object.keys;

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    if (this.employeeId) {
      this.loadEmployee(this.employeeId);
    } else {
      // Handle case where ID is not provided (e.g., redirect to employee list)
      console.error('Employee ID not provided in route.');
      this.router.navigate(['/admin/employees']);
    }

    this.editEmployeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      nationalId: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(18)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      // Password field might not be included in edit, or handled separately
    });
  }

  loadEmployee(id: string): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.editEmployeeForm.patchValue(this.employee);
      },
      error: (error) => {
        console.error('Error loading employee', error);
        this.errorMessage = 'Failed to load employee data.';
        // Optionally redirect or show a more specific error
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = null; // Clear previous errors
    this.validationErrors = {}; // Clear previous validation errors

    if (this.editEmployeeForm.valid && this.employeeId) {
      const updatedEmployee = {
        ...this.editEmployeeForm.value,
        id: this.employeeId,
      }; // Include ID for update
      this.employeeService
        .updateEmployee(this.employeeId, updatedEmployee)
        .subscribe({
          next: (response) => {
            console.log('Employee updated successfully', response);
            // Navigate back to employee list or show success message
            this.router.navigate(['/admin/employees']);
          },
          error: (error) => {
            console.error('Error updating employee', error);
            if (error.status === 400 && error.error && error.error.errors) {
              this.validationErrors = error.error.errors;
            } else if (error.error && error.error.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'An unexpected error occurred.';
            }
          },
        });
    } else if (!this.employeeId) {
      this.errorMessage = 'Employee ID is missing, cannot update.';
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
