import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Upload single file
   */
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/files/upload`, formData);
  }

  /**
   * Upload multiple files
   */
  uploadMultipleFiles(files: FileList): Observable<any> {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    return this.http.post(`${this.baseUrl}/files/upload/multiple`, formData);
  }

  /**
   * Get file URL
   */
  getFileUrl(filename: string): string {
    return `${this.baseUrl}/files/${filename}`;
  }

  /**
   * Get file info
   */
  getFileInfo(filename: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/files/${filename}/info`);
  }

  /**
   * Delete file
   */
  deleteFile(filename: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/files/${filename}`);
  }

  /**
   * Check if file exists
   */
  fileExists(filename: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/files/${filename}/exists`);
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; message?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return {
        valid: false,
        message: 'Chỉ được phép upload file ảnh'
      };
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        valid: false,
        message: 'File quá lớn. Kích thước tối đa là 5MB'
      };
    }

    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        message: 'Định dạng file không được hỗ trợ. Chỉ chấp nhận: ' + allowedExtensions.join(', ')
      };
    }

    return { valid: true };
  }

  /**
   * Generate preview URL for file
   */
  generatePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Cleanup preview URL
   */
  cleanupPreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 