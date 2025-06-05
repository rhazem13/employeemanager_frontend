import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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

  ngOnInit(): void {
    this.checkExistingSignature();
  }

  ngAfterViewInit() {
    if (!this.hasSignature) {
      this.initializeSignaturePad();
    }
  }

  private initializeSignaturePad() {
    const canvas = this.signaturePadElement.nativeElement;
    this.signaturePad = new SignaturePad(canvas);
  }

  private checkExistingSignature(): void {
    this.isLoading = true;
    this.employeeService.getPersonalData().subscribe({
      next: (data) => {
        this.hasSignature = !!data.signature;
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
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.showErrorSnackbar('Please upload an image file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.uploadedSignature = e.target?.result as string;
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
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showErrorMessage(error: HttpErrorResponse): void {
    let message = 'An unexpected error occurred';
    if (error.error?.message) {
      message = error.error.message;
    }
    this.showErrorSnackbar(message);
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
