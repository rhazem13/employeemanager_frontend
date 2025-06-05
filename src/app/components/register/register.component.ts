import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  validationErrors: any = null;
  generalErrorMessage: string = '';
  objectKeys = Object.keys;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      nationalId: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      role: ['Employee'], // Default role, can be changed if needed
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.validationErrors = null; // Clear previous validation errors
      this.generalErrorMessage = ''; // Clear previous general errors

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          // Optionally navigate to login page after successful registration
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Registration failed', error);
          if (error.validationErrors) {
            this.validationErrors = error.validationErrors;
          } else {
            this.generalErrorMessage =
              error.message || 'An unexpected error occurred.';
          }
        },
      });
    }
  }
}
