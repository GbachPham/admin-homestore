import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = 'http://localhost:8080/api/categories';

  constructor(private http: HttpClient) {}

  // Lấy tất cả categories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  // Lấy categories đang active
  getActiveCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/active`);
  }

  // Lấy categories với product count (deprecated - already included in normal response)
  getCategoriesWithProductCount(): Observable<Category[]> {
    return this.getAllCategories();
  }

  // Lấy category theo ID
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // Tạo category mới
  createCategory(category: CategoryCreateRequest): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  // Cập nhật category
  updateCategory(id: string, category: CategoryUpdateRequest): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  // Xóa category
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Tìm kiếm categories
  searchCategories(searchTerm?: string, active?: boolean): Observable<Category[]> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (active !== undefined) {
      params = params.set('active', active.toString());
    }
    return this.http.get<Category[]>(this.apiUrl, { params });
  }

  // Toggle active status
  toggleActiveStatus(id: string): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Kiểm tra tên category có tồn tại (simplified - let backend handle validation)
  checkCategoryExists(name: string): Observable<boolean> {
    // For now, return false to let backend handle duplicate validation
    return new Observable(observer => {
      observer.next(false);
      observer.complete();
    });
  }

  // ==================== UTILITY METHODS ====================

  // Validate category name
  validateCategoryName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
  }

  // Sort categories by name
  sortCategoriesByName(categories: Category[]): Category[] {
    return categories.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }

  // Sort categories by product count (descending)
  sortCategoriesByProductCount(categories: Category[]): Category[] {
    return categories.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
  }

  // Filter categories by active status
  filterCategoriesByActive(categories: Category[], active: boolean): Category[] {
    return categories.filter(category => category.active === active);
  }

  // Get categories that have products
  getCategoriesWithProducts(categories: Category[]): Category[] {
    return categories.filter(category => (category.productCount || 0) > 0);
  }

  // Format date for display
  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }
} 