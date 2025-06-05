import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="signature-container">
      <div class="signature-options">
        <button
          type="button"
          (click)="toggleMode('draw')"
          [class.active]="mode === 'draw'"
        >
          Draw Signature
        </button>
        <button
          type="button"
          (click)="toggleMode('upload')"
          [class.active]="mode === 'upload'"
        >
          Upload Image
        </button>
      </div>

      <div class="signature-input" [ngClass]="mode">
        <!-- Drawing Canvas -->
        <div *ngIf="mode === 'draw'" class="canvas-container">
          <canvas #signatureCanvas></canvas>
          <div class="canvas-actions">
            <button type="button" (click)="clearCanvas()">Clear</button>
            <button type="button" (click)="saveSignature()">Save</button>
          </div>
        </div>

        <!-- Image Upload -->
        <div *ngIf="mode === 'upload'" class="upload-container">
          <input
            type="file"
            accept="image/*"
            (change)="onImageSelected($event)"
            #fileInput
          />
          <img
            *ngIf="previewUrl"
            [src]="previewUrl"
            alt="Signature Preview"
            class="signature-preview"
          />
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class SignatureInputComponent implements OnInit {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef;
  @Output() signatureChange = new EventEmitter<string>();

  mode: 'draw' | 'upload' = 'draw';
  signaturePad!: SignaturePad;
  previewUrl: string | null = null;

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.mode === 'draw') {
      this.initializeSignaturePad();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.mode === 'draw') {
      this.resizeCanvas();
    }
  }

  private resizeCanvas() {
    const canvas = this.signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const containerWidth = canvas.parentElement.offsetWidth;

    // Set canvas width based on container width, with a max width of 500
    const width = Math.min(containerWidth - 20, 500); // 20px for padding
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
    const canvas = this.signatureCanvas.nativeElement;
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

  toggleMode(newMode: 'draw' | 'upload') {
    this.mode = newMode;
    if (newMode === 'draw') {
      setTimeout(() => this.initializeSignaturePad(), 0);
    }
    this.previewUrl = null;
    this.signatureChange.emit('');
  }

  clearCanvas() {
    if (this.signaturePad) {
      this.signaturePad.clear();
      this.signatureChange.emit('');
    }
  }

  saveSignature() {
    if (this.signaturePad && !this.signaturePad.isEmpty()) {
      const signatureData = this.signaturePad.toDataURL();
      this.signatureChange.emit(signatureData);
    }
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
        this.signatureChange.emit(this.previewUrl);
      };
      reader.readAsDataURL(file);
    }
  }
}
