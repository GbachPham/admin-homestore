import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import { Category } from '../../models/category.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  // Statistics
  totalCategories = 0;
  totalProducts = 0;
  totalVariants = 0;
  totalStock = 0;
  
  // Recent data
  recentCategories: Category[] = [];
  recentProducts: Product[] = [];
  
  // Loading states
  isLoading = true;
  hasError = false;
  errorMessage = '';

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.isLoading = true;
    this.hasError = false;

    // Load categories
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.totalCategories = categories.length;
        this.recentCategories = categories
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 5);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.hasError = true;
        this.errorMessage = 'Không thể tải danh mục';
      }
    });

    // Load products
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.totalProducts = products.length;
        this.totalVariants = products.reduce((sum, product) => sum + (product.variantCount || 0), 0);
        
        // Calculate total stock from variants
        let stockSum = 0;
        products.forEach(product => {
          if (product.variants && product.variants.length > 0) {
            stockSum += product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
          }
        });
        this.totalStock = stockSum;

        this.recentProducts = products
          .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
          .slice(0, 5);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.hasError = true;
        this.errorMessage = 'Không thể tải sản phẩm';
        this.isLoading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  refreshData() {
    this.loadDashboardData();
  }
}
