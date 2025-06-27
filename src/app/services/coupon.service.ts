import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon, CouponStats } from '../models/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private apiUrl = 'http://localhost:8080/api/coupons';

  constructor(private http: HttpClient) { }

  // Lấy tất cả coupons với tìm kiếm và lọc
  getAllCoupons(search?: string, active?: boolean, type?: string): Observable<Coupon[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (active !== undefined) params = params.set('active', active.toString());
    if (type) params = params.set('type', type);
    
    return this.http.get<Coupon[]>(this.apiUrl, { params });
  }

  // Lấy coupons active
  getActiveCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/active`);
  }

  // Lấy coupons có thể sử dụng
  getUsableCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${this.apiUrl}/usable`);
  }

  // Lấy coupon theo ID
  getCouponById(id: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/${id}`);
  }

  // Lấy coupon theo code
  getCouponByCode(code: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/code/${code}`);
  }

  // Tạo coupon mới
  createCoupon(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, coupon);
  }

  // Cập nhật coupon
  updateCoupon(id: string, coupon: Coupon): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${id}`, coupon);
  }

  // Xóa coupon
  deleteCoupon(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Toggle trạng thái active
  toggleCouponStatus(id: string): Observable<Coupon> {
    return this.http.patch<Coupon>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Sử dụng coupon
  useCoupon(code: string): Observable<Coupon> {
    return this.http.post<Coupon>(`${this.apiUrl}/${code}/use`, {});
  }

  // Validate coupon
  validateCoupon(code: string, orderAmount: number, productIds?: string[], categoryIds?: string[]): Observable<any> {
    const request = {
      code,
      orderAmount,
      productIds: productIds || [],
      categoryIds: categoryIds || []
    };
    return this.http.post<any>(`${this.apiUrl}/validate`, request);
  }

  // Lấy thống kê coupons
  getCouponStats(): Observable<CouponStats> {
    return this.http.get<CouponStats>(`${this.apiUrl}/stats`);
  }

  // Helper methods cho frontend
  searchCoupons(searchTerm: string): Observable<Coupon[]> {
    return this.getAllCoupons(searchTerm);
  }

  filterByStatus(active: boolean): Observable<Coupon[]> {
    return this.getAllCoupons(undefined, active);
  }

  filterByType(type: string): Observable<Coupon[]> {
    return this.getAllCoupons(undefined, undefined, type);
  }
} 