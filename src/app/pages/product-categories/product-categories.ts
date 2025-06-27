import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category, CategoryCreateRequest, CategoryUpdateRequest } from '../../models/category.model';

@Component({
  selector: 'app-product-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-categories.html',
  styleUrl: './product-categories.scss'
})
export class ProductCategories implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  
  // Loading and error states
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  // Search and filter
  searchTerm = '';
  filterActive: boolean | null = null;
  sortBy: 'name' | 'productCount' | 'createdAt' = 'name';
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedCategory: Category | null = null;
  
  // Form data
  categoryForm: CategoryCreateRequest = {
    name: '',
    description: '',
    active: true
  };

  // Validation state
  nameError = '';
  isSubmitting = false;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadCategories();
  }

  // Load categories from API with product count
  loadCategories() {
    this.isLoading = true;
    this.hasError = false;
    
    // Use search method instead of getAllCategories for consistency
    this.categoryService.searchCategories(this.searchTerm || undefined, this.filterActive || undefined).subscribe({
      next: (categories) => {
        this.categories = categories;
        this.applySortAndFilter();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.hasError = true;
        this.errorMessage = 'Không thể tải danh sách danh mục';
        this.isLoading = false;
      }
    });
  }

  // Apply search, filter and sort
  applySortAndFilter() {
    let result = [...this.categories];

    // Apply search filter
    if (this.searchTerm) {
      result = result.filter(category => 
        category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }

    // Apply active filter
    if (this.filterActive !== null) {
      result = this.categoryService.filterCategoriesByActive(result, this.filterActive);
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'name':
        result = this.categoryService.sortCategoriesByName(result);
        break;
      case 'productCount':
        result = this.categoryService.sortCategoriesByProductCount(result);
        break;
      case 'createdAt':
        result = result.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
    }

    this.filteredCategories = result;
  }

  // Search handler - reload data from server
  onSearchChange() {
    this.loadCategories();
  }

  // Filter handler - reload data from server
  onFilterChange() {
    this.loadCategories();
  }

  // Sort handler
  onSortChange() {
    this.applySortAndFilter();
  }

  // Validate form
  validateForm(): boolean {
    this.nameError = '';
    
    if (!this.categoryForm.name.trim()) {
      this.nameError = 'Tên danh mục không được để trống';
      return false;
    }

    if (!this.categoryService.validateCategoryName(this.categoryForm.name)) {
      this.nameError = 'Tên danh mục phải có từ 2-100 ký tự';
      return false;
    }

    return true;
  }

  // Create category
  openCreateModal() {
    this.resetForm();
    this.showCreateModal = true;
  }

  async createCategory() {
    if (!this.validateForm() || this.isSubmitting) return;

    // Check if category name exists
    this.isSubmitting = true;
    
    try {
      const exists = await this.categoryService.checkCategoryExists(this.categoryForm.name).toPromise();
      if (exists) {
        this.nameError = 'Tên danh mục đã tồn tại';
        this.isSubmitting = false;
        return;
      }

      this.categoryService.createCategory(this.categoryForm).subscribe({
        next: (category) => {
          this.categories.push(category);
          this.applySortAndFilter();
          this.showCreateModal = false;
          this.resetForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating category:', error);
          this.nameError = 'Không thể tạo danh mục. Vui lòng thử lại.';
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      console.error('Error checking category exists:', error);
      this.nameError = 'Không thể kiểm tra tên danh mục';
      this.isSubmitting = false;
    }
  }

  // Edit category
  openEditModal(category: Category) {
    this.selectedCategory = category;
    this.categoryForm = {
      name: category.name,
      description: category.description || '',
      active: category.active || true
    };
    this.resetValidation();
    this.showEditModal = true;
  }

  async updateCategory() {
    if (!this.selectedCategory || !this.validateForm() || this.isSubmitting) return;

    // Check if category name exists (except current category)
    this.isSubmitting = true;
    
    try {
      if (this.categoryForm.name !== this.selectedCategory.name) {
        const exists = await this.categoryService.checkCategoryExists(this.categoryForm.name).toPromise();
        if (exists) {
          this.nameError = 'Tên danh mục đã tồn tại';
          this.isSubmitting = false;
          return;
        }
      }

      this.categoryService.updateCategory(this.selectedCategory.id!, this.categoryForm).subscribe({
        next: (updatedCategory) => {
          const index = this.categories.findIndex(c => c.id === updatedCategory.id);
          if (index !== -1) {
            this.categories[index] = updatedCategory;
            this.applySortAndFilter();
          }
          this.showEditModal = false;
          this.resetForm();
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating category:', error);
          this.nameError = 'Không thể cập nhật danh mục. Vui lòng thử lại.';
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      console.error('Error checking category exists:', error);
      this.nameError = 'Không thể kiểm tra tên danh mục';
      this.isSubmitting = false;
    }
  }

  // Delete category
  openDeleteModal(category: Category) {
    this.selectedCategory = category;
    this.showDeleteModal = true;
  }

  deleteCategory() {
    if (!this.selectedCategory || this.isSubmitting) return;

    this.isSubmitting = true;

    this.categoryService.deleteCategory(this.selectedCategory.id!).subscribe({
      next: () => {
        this.categories = this.categories.filter(c => c.id !== this.selectedCategory!.id);
        this.applySortAndFilter();
        this.showDeleteModal = false;
        this.selectedCategory = null;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        alert('Không thể xóa danh mục. Có thể danh mục này đang chứa sản phẩm.');
        this.isSubmitting = false;
      }
    });
  }

  // Toggle active status
  toggleActiveStatus(category: Category) {
    this.categoryService.toggleActiveStatus(category.id!).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex(c => c.id === updatedCategory.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
          this.applySortAndFilter();
        }
      },
      error: (error) => {
        console.error('Error toggling category status:', error);
        alert('Không thể thay đổi trạng thái danh mục. Vui lòng thử lại.');
      }
    });
  }

  // Utility methods
  resetForm() {
    this.categoryForm = {
      name: '',
      description: '',
      active: true
    };
    this.selectedCategory = null;
    this.resetValidation();
  }

  resetValidation() {
    this.nameError = '';
    this.isSubmitting = false;
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.resetForm();
  }

  formatDate(date: Date | undefined): string {
    return this.categoryService.formatDate(date);
  }

  refreshData() {
    this.loadCategories();
  }

  // Get status badge class
  getStatusBadgeClass(active: boolean | undefined): string {
    return active ? 'badge bg-success' : 'badge bg-secondary';
  }

  // Get status text
  getStatusText(active: boolean | undefined): string {
    return active ? 'Hoạt động' : 'Tạm dừng';
  }
}
