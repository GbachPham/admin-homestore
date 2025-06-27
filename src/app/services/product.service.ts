import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Product, 
  ProductVariant, 
  ProductCreateRequest, 
  ProductUpdateRequest,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest 
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) {}

  // ==================== PRODUCT METHODS ====================

  // Lấy tất cả products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Lấy products đang active
  getActiveProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/active`);
  }

  // Lấy featured products (sản phẩm nổi bật)
  getFeaturedProducts(): Observable<Product[]> {
    // Filter products with "featured" tag
    return this.getAllProducts();
  }

  // Lấy product theo ID
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Tìm kiếm products với nhiều filter
  searchProducts(searchTerm?: string, categoryId?: string, active?: boolean): Observable<Product[]> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    if (active !== undefined) {
      params = params.set('active', active.toString());
    }
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  // Lấy products theo category
  getProductsByCategory(categoryId: string, limit?: number): Observable<Product[]> {
    let params = new HttpParams().set('categoryId', categoryId);
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  // Lấy products theo category và active status
  getProductsByCategoryAndActive(categoryId: string, active: boolean = true, limit?: number): Observable<Product[]> {
    let params = new HttpParams()
      .set('categoryId', categoryId)
      .set('active', active.toString());
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  // Tạo product mới
  createProduct(product: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  // Cập nhật product
  updateProduct(id: string, product: ProductUpdateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  // Xóa product
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Tìm kiếm products (legacy method - deprecated)
  searchProductsByKeyword(keyword: string): Observable<Product[]> {
    const params = new HttpParams().set('search', keyword);
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  // Tìm products theo khoảng giá
  findProductsByPriceRange(minPrice: number, maxPrice: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('minPrice', minPrice.toString())
      .set('maxPrice', maxPrice.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/price-range`, { params });
  }

  // Toggle active status
  toggleActiveStatus(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Kiểm tra SKU có tồn tại
  checkProductExists(sku: string): Observable<boolean> {
    const params = new HttpParams().set('sku', sku);
    return this.http.get<boolean>(`${this.apiUrl}/exists`, { params });
  }

  // Debug endpoint để xem raw product data
  debugProduct(productId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/debug/${productId}`);
  }

  // ==================== VARIANT METHODS ====================

  // Lấy variants của product
  getProductVariants(productId: string): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.apiUrl}/${productId}/variants`);
  }

  // Tạo variant mới cho product
  createProductVariant(productId: string, variant: ProductVariantCreateRequest): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/${productId}/variants`, variant);
  }

  // Cập nhật variant
  updateProductVariant(productId: string, variantId: string, variant: ProductVariantUpdateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${productId}/variants/${variantId}`, variant);
  }

  // Xóa variant
  deleteProductVariant(productId: string, variantId: string): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/${productId}/variants/${variantId}`);
  }

  // ==================== UTILITY METHODS ====================

  // Format currency cho hiển thị
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + 'đ';
  }

  // Validate SKU format
  validateSKU(sku: string): boolean {
    // SKU should be alphanumeric and uppercase
    const skuPattern = /^[A-Z0-9]+$/;
    return skuPattern.test(sku) && sku.length >= 3 && sku.length <= 20;
  }

  // Get image URL from file ID
  getImageUrl(fileId: string): string {
    return `http://localhost:8081/api/files/${fileId}`;
  }
} 