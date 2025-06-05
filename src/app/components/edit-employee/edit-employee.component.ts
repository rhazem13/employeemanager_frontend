import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatSnackBarModule],
  templateUrl: './edit-employee.component.html',
  styleUrl: './edit-employee.component.scss',
})
export class EditEmployeeComponent implements OnInit {
  editEmployeeForm!: FormGroup;
  employeeId!: string;
  errorMessage: string | null = null;
  validationErrors: any = {};
  backendErrors: string[] = [];
  objectKeys = Object.keys;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.editEmployeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(\+?\d{1,3})?[-. ]?\d{6,14}$/), // International phone format
        ],
      ],
      nationalId: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{14}$/), // 14-digit national ID
        ],
      ],
      age: [null, [Validators.required, Validators.min(18)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['Employee'], // Hidden field, always set to 'Employee'
    });

    this.route.params.subscribe((params) => {
      this.employeeId = params['id'];
      this.loadEmployee();
    });
  }

  // Helper method for phone number validation messages
  getPhoneErrorMessage(): string {
    const control = this.editEmployeeForm.get('phoneNumber');
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Phone number is required.';
      }
      if (control.errors['pattern']) {
        return 'Please enter a valid phone number (10-15 digits, optional leading +).';
      }
    }
    return '';
  }

  // Helper method for national ID validation messages
  getNationalIdErrorMessage(): string {
    const control = this.editEmployeeForm.get('nationalId');
    if (control?.errors) {
      if (control.errors['required']) {
        return 'National ID is required.';
      }
      if (control.errors['pattern']) {
        return 'National ID must be exactly 14 digits.';
      }
    }
    return '';
  }

  loadEmployee(): void {
    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (employee) => {
        this.editEmployeeForm.patchValue({
          firstName: employee.firstName,
          lastName: employee.lastName,
          phoneNumber: employee.phoneNumber,
          nationalId: employee.nationalId,
          age: employee.age,
          email: employee.email,
          role: 'Employee', // Always set to 'Employee'
        });
      },
      error: (error) => {
        console.error('Error loading employee', error);
        this.snackBar.open('Error loading employee details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.validationErrors = {};
    this.backendErrors = [];
    this.isLoading = true;

    if (this.editEmployeeForm.valid) {
      const formData = this.editEmployeeForm.value;

      // Always set role to 'Employee'
      formData.role = 'Employee';

      this.employeeService.updateEmployee(this.employeeId, formData).subscribe({
        next: (response) => {
          console.log('Employee updated successfully', response);
          this.snackBar.open('Employee updated successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.router.navigate(['/admin/employees']);
        },
        error: (error) => {
          console.error('Error updating employee', error);
          this.handleError(error);
        },
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }

  private handleError(error: any): void {
    if (error.error && error.error.errors) {
      // Extract all error messages from the nested structure into a flat array
      this.backendErrors = Object.values(error.error.errors).flat() as string[];
    } else if (error.error && error.error.message) {
      this.backendErrors = [error.error.message];
      console.log(this.backendErrors);
    } else {
      this.backendErrors = [
        'An unexpected error occurred. Please try again later.',
      ];
    }
    this.isLoading = false;
  }
}
