export interface Coupon {
  id?: string;
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: string;
  minimumOrderValue?: string;
  maximumDiscountAmount?: string;
  usageLimit?: number;
  usedCount?: number;
  startDate?: Date;
  endDate?: Date;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Additional fields for display
  categoryNames?: string[];
  productNames?: string[];
  isValid?: boolean;
  canBeUsed?: boolean;
  remainingUsage?: number;
}

export interface CouponCreateRequest {
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: string;
  minimumOrderValue?: string;
  maximumDiscountAmount?: string;
  usageLimit?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  active?: boolean;
}

export interface CouponUpdateRequest {
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: string;
  minimumOrderValue?: string;
  maximumDiscountAmount?: string;
  usageLimit?: number;
  startDate?: Date;
  endDate?: Date;
  active?: boolean;
}

export interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  usableCoupons: number;
  totalUsage: number;
}

export interface CouponValidationRequest {
  code: string;
  orderAmount: number;
  productIds: string[];
  categoryIds: string[];
}

export interface CouponValidationResponse {
  valid: boolean;
  message: string;
  error?: string;
}

export const COUPON_TYPES = [
  { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
  { value: 'FIXED_AMOUNT', label: 'Giảm cố định (VND)' },
  { value: 'FREE_SHIPPING', label: 'Miễn phí vận chuyển' }
] as const; 