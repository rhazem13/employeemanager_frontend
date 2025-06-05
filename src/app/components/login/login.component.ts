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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = ''; // Clear previous errors
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // Handle successful login, e.g., navigate to dashboard
          console.log('Login successful', response);
          this.router.navigate(['/dashboard']); // Assuming a dashboard route
        },
        error: (error) => {
          // Handle login error, e.g., display error message
          console.error('Login failed', error);
          this.errorMessage = error.message || 'An unexpected error occurred.';
        },
      });
    }
  }
}
