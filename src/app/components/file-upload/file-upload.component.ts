import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @Input() currentImageUrl?: string; // URL hiện tại (nếu có)
  @Input() currentImageId?: string | null; // ID của ảnh hiện tại - accept null
  @Input() placeholder = 'Chọn ảnh...';
  @Input() allowMultiple = false;
  @Input() disabled = false;
  
  @Output() fileUploaded = new EventEmitter<{fileId: string, url: string}>();
  @Output() fileRemoved = new EventEmitter<void>();
  @Output() uploadError = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  isUploading = false;
  previewUrl?: string;
  uploadProgress = 0;

  constructor(private fileUploadService: FileUploadService) {}

  ngOnInit() {
    // If we have current image ID, construct the URL
    if (this.currentImageId) {
      this.currentImageUrl = this.fileUploadService.getFileUrl(this.currentImageId);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = this.fileUploadService.validateFile(file);
    if (!validation.valid) {
      this.uploadError.emit(validation.message);
      return;
    }

    // Show preview
    this.previewUrl = this.fileUploadService.generatePreviewUrl(file);

    // Upload file
    this.uploadFile(file);
  }

  private uploadFile(file: File) {
    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate progress (since we don't have real progress tracking)
    const progressInterval = setInterval(() => {
      this.uploadProgress += 10;
      if (this.uploadProgress >= 90) {
        clearInterval(progressInterval);
      }
    }, 100);

    this.fileUploadService.uploadFile(file).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        
        if (response.success) {
          // Clean up old preview
          if (this.previewUrl) {
            this.fileUploadService.cleanupPreviewUrl(this.previewUrl);
            this.previewUrl = undefined;
          }

          // Emit successful upload
          this.fileUploaded.emit({
            fileId: response.fileId,
            url: response.url
          });

          // Update current image
          this.currentImageId = response.fileId;
          this.currentImageUrl = this.fileUploadService.getFileUrl(response.fileId);
        } else {
          this.uploadError.emit(response.message || 'Upload failed');
        }
        
        this.isUploading = false;
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;
        
        // Clean up preview on error
        if (this.previewUrl) {
          this.fileUploadService.cleanupPreviewUrl(this.previewUrl);
          this.previewUrl = undefined;
        }

        const errorMessage = error.error?.message || 'Lỗi khi upload file';
        this.uploadError.emit(errorMessage);
      }
    });
  }

  removeImage() {
    // Clean up preview if exists
    if (this.previewUrl) {
      this.fileUploadService.cleanupPreviewUrl(this.previewUrl);
      this.previewUrl = undefined;
    }

    // Reset current image
    this.currentImageUrl = undefined;
    this.currentImageId = undefined;

    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.fileRemoved.emit();
  }

  triggerFileInput() {
    if (!this.disabled && this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  get displayImageUrl(): string | undefined {
    return this.previewUrl || this.currentImageUrl;
  }

  get hasImage(): boolean {
    return !!(this.displayImageUrl);
  }
} 