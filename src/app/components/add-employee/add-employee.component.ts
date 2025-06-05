import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SignatureInputComponent } from '../signature-input/signature-input.component';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    SignatureInputComponent,
  ],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent implements OnInit {
  addEmployeeForm!: FormGroup;
  errorMessage: string | null = null;
  validationErrors: any = {};
  backendErrors: string[] = [];
  objectKeys = Object.keys;
  signatureData: string | null = null;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.addEmployeeForm = this.fb.group({
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
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Employee'], // Hidden field, always set to 'Employee'
    });
  }

  // Helper method for phone number validation messages
  getPhoneErrorMessage(): string {
    const control = this.addEmployeeForm.get('phoneNumber');
    if (control?.errors) {
      if (control.errors['required']) {
        return 'Phone number is required.';
      }
      if (control.errors['pattern']) {
        return 'Please enter a valid phone number.';
      }
    }
    return '';
  }

  // Helper method for national ID validation messages
  getNationalIdErrorMessage(): string {
    const control = this.addEmployeeForm.get('nationalId');
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

  onSignatureChange(signatureData: string) {
    this.signatureData = signatureData;
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.validationErrors = {};
    this.backendErrors = [];

    if (this.addEmployeeForm.valid) {
      const formData = {
        ...this.addEmployeeForm.value,
        signature: this.signatureData,
      };

      this.employeeService.addEmployee(formData).subscribe({
        next: (response) => {
          console.log('Employee added successfully', response);
          this.snackBar.open('Employee added successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.router.navigate(['/admin/employees']);
        },
        error: (error) => {
          console.error('Error adding employee', error);
          if (error.status === 400 && error.error && error.error.errors) {
            this.backendErrors = error.error.errors;
            // Extract all error messages into a flat array
            this.backendErrors = Object.values(error.error.errors)
              .flat()
              .filter((error): error is string => typeof error === 'string');
            console.log('Backend Errors:', this.backendErrors);
          } else if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'An unexpected error occurred.';
          }
        },
      });
    } else {
      this.errorMessage = 'Please fill in all required fields correctly.';
    }
  }
}
