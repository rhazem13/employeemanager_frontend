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

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss',
})
export class AddEmployeeComponent implements OnInit {
  addEmployeeForm!: FormGroup;
  errorMessage: string | null = null;
  validationErrors: any = {};
  objectKeys = Object.keys;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.addEmployeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      nationalId: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(18)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['Employee', Validators.required], // Default to Employee role
    });
  }

  onSubmit(): void {
    this.errorMessage = null; // Clear previous errors
    this.validationErrors = {}; // Clear previous validation errors

    if (this.addEmployeeForm.valid) {
      const newEmployee = this.addEmployeeForm.value;
      this.employeeService.addEmployee(newEmployee).subscribe({
        next: (response) => {
          console.log('Employee added successfully', response);
          // Navigate to employee list or show success message
          this.router.navigate(['/admin/employees']);
        },
        error: (error) => {
          console.error('Error adding employee', error);
          if (error.status === 400 && error.error && error.error.errors) {
            this.validationErrors = error.error.errors;
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
