import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CouponService } from '../../services/coupon.service';
import { Coupon, CouponStats } from '../../models/coupon.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-coupons',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './coupons.html',
  styleUrls: ['./coupons.scss']
})
export class CouponsComponent implements OnInit {
  coupons: Coupon[] = [];
  filteredCoupons: Coupon[] = [];
  loading = false;
  stats: CouponStats | null = null;
  
  // Loading and error states
  hasError = false;
  errorMessage = '';
  
  // Search and filter
  searchTerm = '';
  filterActive: boolean | null = null;
  filterType = '';
  
  // Modal states
  showForm = false;
  editingCoupon: Coupon | null = null;
  
  // Form data
  couponForm: FormGroup;

  // Constants
  couponTypes = [
    { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
    { value: 'FIXED_AMOUNT', label: 'Số tiền cố định (VNĐ)' }
  ];
  statusOptions = [
    { value: null, label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'expired', label: 'Hết hạn' },
    { value: 'inactive', label: 'Tạm dừng' },
    { value: 'pending', label: 'Chưa bắt đầu' }
  ];

  constructor(
    private couponService: CouponService,
    private formBuilder: FormBuilder
  ) {
    this.couponForm = this.createCouponForm();
  }

  ngOnInit(): void {
    this.loadCoupons();
    this.loadStats();
  }

  createCouponForm(): FormGroup {
    return this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      type: ['PERCENTAGE', Validators.required],
      value: ['', [Validators.required, Validators.min(0)]],
      minimumOrderValue: [''],
      maximumDiscountAmount: [''],
      usageLimit: ['', Validators.min(1)],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      active: [true]
    });
  }

  loadCoupons(): void {
    this.loading = true;
    this.couponService.getAllCoupons(this.searchTerm, this.filterActive || undefined, this.filterType)
      .subscribe({
        next: (coupons) => {
          this.coupons = coupons;
          this.filteredCoupons = coupons;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading coupons:', error);
          this.loading = false;
        }
      });
  }

  loadStats(): void {
    this.couponService.getCouponStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  applyFilters(): void {
    this.loadCoupons();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterActive = null;
    this.filterType = '';
    this.loadCoupons();
  }

  openCreateForm(): void {
    this.editingCoupon = null;
    this.couponForm.reset();
    this.couponForm.patchValue({
      type: 'PERCENTAGE',
      active: true
    });
    this.showForm = true;
  }

  openEditForm(coupon: Coupon): void {
    this.editingCoupon = coupon;
    this.couponForm.patchValue({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      minimumOrderValue: coupon.minimumOrderValue,
      maximumDiscountAmount: coupon.maximumDiscountAmount,
      usageLimit: coupon.usageLimit,
      startDate: this.formatDateForInput(coupon.startDate),
      endDate: this.formatDateForInput(coupon.endDate),
      active: coupon.active
    });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCoupon = null;
    this.couponForm.reset();
  }

  onSubmit(): void {
    if (this.couponForm.valid) {
      this.loading = true;
      const formData = this.couponForm.value;
      
      // Convert dates
      if (formData.startDate) {
        formData.startDate = new Date(formData.startDate);
      }
      if (formData.endDate) {
        formData.endDate = new Date(formData.endDate);
      }

      if (this.editingCoupon) {
        // Update
        this.couponService.updateCoupon(this.editingCoupon.id!, formData).subscribe({
          next: () => {
            this.loading = false;
            this.closeForm();
            this.loadCoupons();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error updating coupon:', error);
            this.loading = false;
          }
        });
      } else {
        // Create
        this.couponService.createCoupon(formData).subscribe({
          next: () => {
            this.loading = false;
            this.closeForm();
            this.loadCoupons();
            this.loadStats();
          },
          error: (error) => {
            console.error('Error creating coupon:', error);
            this.loading = false;
          }
        });
      }
    }
  }

  toggleStatus(coupon: Coupon): void {
    this.couponService.toggleCouponStatus(coupon.id!).subscribe({
      next: () => {
        this.loadCoupons();
        this.loadStats();
      },
      error: (error) => {
        console.error('Error toggling status:', error);
      }
    });
  }

  deleteCoupon(coupon: Coupon): void {
    if (confirm(`Bạn có chắc muốn xóa coupon "${coupon.name}"?`)) {
      this.couponService.deleteCoupon(coupon.id!).subscribe({
        next: () => {
          this.loadCoupons();
          this.loadStats();
        },
        error: (error) => {
          console.error('Error deleting coupon:', error);
        }
      });
    }
  }

  formatDateForInput(date: Date | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getStatusClass(coupon: Coupon): string {
    if (!coupon.active) return 'inactive';
    
    const now = new Date();
    const startDate = coupon.startDate ? new Date(coupon.startDate) : null;
    const endDate = coupon.endDate ? new Date(coupon.endDate) : null;
    
    if (startDate && startDate > now) return 'upcoming';
    if (endDate && endDate < now) return 'expired';
    if (coupon.usageLimit && coupon.usedCount && coupon.usedCount >= coupon.usageLimit) return 'used-up';
    
    return 'active';
  }

  getStatusText(coupon: Coupon): string {
    const statusClass = this.getStatusClass(coupon);
    
    switch (statusClass) {
      case 'inactive': return 'Không hoạt động';
      case 'upcoming': return 'Sắp diễn ra';
      case 'expired': return 'Đã hết hạn';
      case 'used-up': return 'Đã hết lượt';
      case 'active': return 'Đang hoạt động';
      default: return '';
    }
  }
}
