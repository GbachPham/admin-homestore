import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface OrderItem {
  productId: string;
  productName: string;
  basePrice: number;
  variantName: string;
  variantSpecs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    display?: string;
    gpu?: string;
    battery?: string;
    os?: string;
    ports?: string[];
  };
  variantPrice: number;
  variantDiscountPercent: number;
  colorName: string;
  colorCode: string;
  colorPriceAdjustment: number;
  colorDiscountAdjustment: number;
  quantity: number;
  unitPrice: number;
  discountedPrice: number;
  subtotal: number;
  thumbnailUrl: string;
}

export interface Customer {
  fullName: string;
  phone: string;
  email: string;
}

export interface ShippingAddress {
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
}

export interface Payment {
  method: string;
  status: string;
}

export interface ProductInfo {
  title: string;
  content: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  payment: Payment;
  productInfo: ProductInfo[];
  subtotal: number;
  discountTotal: number;
  shippingFee: number;
  total: number;
  status: string;
  orderDate: string;
  updatedAt: string;
}

export interface OrderStats {
  totalCount: number;
  pendingCount: number;
  confirmedCount: number;
  processingCount: number;
  shippingCount: number;
  deliveredCount: number;
  cancelledCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) { }

  getAllOrders(status?: string, customerName?: string): Observable<Order[]> {
    let url = this.apiUrl;
    const params: any = {};
    
    if (status) {
      params.status = status.toLowerCase();
    }
    if (customerName) {
      params.customerName = customerName;
    }

    return this.http.get<Order[]>(url, { params });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${id}/status?status=${status.toLowerCase()}`, {});
  }

  getOrderStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.apiUrl}/stats`);
  }
} 