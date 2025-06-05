import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-employee-signature',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  templateUrl: './employee-signature.component.html',
  styleUrls: ['./employee-signature.component.scss'],
})
export class EmployeeSignatureComponent implements OnInit {
  @ViewChild('signaturePad') signaturePadElement!: ElementRef;
  signaturePad: SignaturePad | null = null;
  isLoading = false;
  hasSignature = false;
  signatureMode: 'draw' | 'upload' = 'draw';
  uploadedSignature: string | null = null;

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkExistingSignature();
  }

  ngAfterViewInit() {
    if (!this.hasSignature) {
      this.initializeSignaturePad();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.signatureMode === 'draw' && !this.hasSignature) {
      this.resizeCanvas();
    }
  }

  private resizeCanvas() {
    const canvas = this.signaturePadElement.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const containerWidth = canvas.parentElement.offsetWidth;

    // Set canvas width based on container width, with a max width of 600
    const width = Math.min(containerWidth - 20, 600); // 20px for padding
    const height = width * 0.4; // Maintain a 5:2 aspect ratio

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale the context to handle high DPI displays
    const context = canvas.getContext('2d');
    context.scale(ratio, ratio);

    if (this.signaturePad) {
      this.signaturePad.clear(); // Clear and reinitialize
    }
  }

  private initializeSignaturePad() {
    const canvas = this.signaturePadElement.nativeElement;
    this.resizeCanvas();

    this.signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255, 255, 255)',
      penColor: 'rgb(0, 0, 0)',
      velocityFilterWeight: 0.7,
      minWidth: 0.5,
      maxWidth: 2.5,
      throttle: 16, // Increase smoothness on mobile
    });
  }

  private checkExistingSignature(): void {
    this.isLoading = true;
    this.employeeService.getPersonalData().subscribe({
      next: (response) => {
        this.hasSignature = !!response.signature;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error checking signature:', error);
        this.isLoading = false;
        this.showErrorMessage(error);
      },
    });
  }

  clearSignature(): void {
    if (this.signatureMode === 'draw' && this.signaturePad) {
      this.signaturePad.clear();
    } else {
      this.uploadedSignature = null;
    }
  }

  saveSignature(): void {
    if (this.signatureMode === 'draw' && this.signaturePad) {
      if (this.signaturePad.isEmpty()) {
        this.showErrorSnackbar('Please provide a signature before saving.');
        return;
      }
      const signatureData = this.signaturePad.toDataURL('image/png');
      this.saveSignatureToServer(signatureData);
    } else if (this.signatureMode === 'upload' && this.uploadedSignature) {
      this.saveSignatureToServer(this.uploadedSignature);
    } else {
      this.showErrorSnackbar('No signature data available.');
    }
  }

  private saveSignatureToServer(signatureData: string): void {
    this.isLoading = true;
    const base64Data = signatureData.split(',')[1] || signatureData;

    this.employeeService.updateSignature({ signature: base64Data }).subscribe({
      next: () => {
        this.isLoading = false;
        this.hasSignature = true;
        this.showSuccessMessage('Signature saved successfully');
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error saving signature:', error);
        this.isLoading = false;
        this.showErrorMessage(error);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.showErrorSnackbar('Please select an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedSignature = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleMode(): void {
    this.signatureMode = this.signatureMode === 'draw' ? 'upload' : 'draw';
    if (this.signatureMode === 'draw') {
      this.uploadedSignature = null;
      setTimeout(() => {
        this.initializeSignaturePad();
      });
    } else if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  private showErrorMessage(error: HttpErrorResponse): void {
    const message =
      error.error?.message || 'An error occurred. Please try again later.';
    this.showErrorSnackbar(message);
  }
}
