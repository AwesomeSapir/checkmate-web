import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage, ImageTransform, base64ToFile } from 'ngx-image-cropper';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  imageChangedEvent: Event | null = null;
  croppedImage: string = '';
  transform: ImageTransform = { rotate: 0, scale: 1 };

  constructor(private http: HttpClient) {}

  fileChangeEvent(event: any): void {
    console.log('📁 fileChangeEvent:', event);
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    console.log('✂️ imageCropped:', event);
    this.croppedImage = event.base64!;
  }

  onRotateSlider(value: string) {
    const angle = parseInt(value, 10);
    console.log(`🔄 onRotateSlider: ${angle}°`);
    this.transform = { ...this.transform, rotate: angle };
  }

  onSubmit(): void {
    console.log('▶️ onSubmit fired; croppedImage exists?', !!this.croppedImage);
    if (!this.croppedImage) {
      console.warn('⚠️ submit aborted: no croppedImage');
      return;
    }
  
    // Convert the Base64 string to a Blob/File
    const blob = base64ToFile(this.croppedImage);
    const file = new File([blob], 'receipt.png', { type: blob.type });
    console.log('🗂️ Converted to File:', file);
  
    // Delegate to your existing method
    this.uploadImage(file);
  }

  uploadImage(file: File): void {
    console.log('🚀 uploadImage called with file:', file);
    const formData = new FormData();
    formData.append('bill', file);
    formData.append('languages', JSON.stringify(['he', 'en']))
  
    this.http.post('http://localhost:3000/api/analyze', formData).subscribe({
      next: (response) => {
        console.log('✅ Upload success:', response);
      },
      error: (err) => {
        console.error('❌ Upload failed:', err);
      },
      complete: () => {
        console.log('🏁 Upload request completed');
      }
    });
  }
}
