import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CropArea } from 'cropro';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  @ViewChild('imagePreview', { static: false })
  imagePreview!: ElementRef<HTMLImageElement>;
  previewImage = '';
  croppedData = '';
  cropArea!: CropArea;

  constructor(private http: HttpClient) {}

  fileChangeEvent(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  startCrop(): void {
    if(this.previewImage == '') return;
    console.log('✂️ Starting crop');
    this.cropArea = new CropArea(this.imagePreview.nativeElement);
    this.cropArea.zoomToCropEnabled = true;
    this.cropArea.isGridVisible = false;
    this.cropArea.styles.settings.hideTopToolbar = true;
    this.cropArea.addRenderEventListener((dataUrl: string) => {
      this.croppedData = dataUrl;
      this.submitCroppedImage();
      console.log('✂️ CROPRO returned:', dataUrl);
    })

    this.cropArea.show();
  }

  renderAndClose(): void {
    if (this.cropArea && this.cropArea.isOpen) {
      this.cropArea.startRenderAndClose();
    }
  }

  async submitCroppedImage(): Promise<void> {
    console.log('▶️ submitCroppedImage fired; hasData?', !!this.croppedData);
    if (!this.croppedData) {
      console.warn('⚠️ No croppedData to upload');
      return;
    }

    const blob = await (await fetch(this.croppedData)).blob();
    const file = new File([blob], 'receipt.png', { type: blob.type });
    console.log('🗂️ Converted DataURL to File:', file);

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
