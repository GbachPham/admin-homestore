import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { FileUploadService } from '../../services/file-upload.service';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';
import { 
  Product, 
  ProductVariant,
  ProductCreateRequest, 
  ProductUpdateRequest,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest 
} from '../../models/product.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule, FileUploadComponent],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  
  // Loading and error states
  isLoading = true;
  hasError = false;
  errorMessage = '';
  
  // Search and filter
  searchTerm = '';
  filterCategory: string | null = null;
  filterActive: boolean | null = null;
  
  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showVariantsModal = false;
  showCreateVariantModal = false;
  showEditVariantModal = false;
  showDeleteVariantModal = false;
  
  selectedProduct: Product | null = null;
  selectedVariant: ProductVariant | null = null;
  productVariants: ProductVariant[] = [];
  
  // Form data
  productForm: ProductCreateRequest = {
    name: '',
    description: '',
    price: 0,
    sku: '',
    active: true,
    imageUrl: '',
    categoryIds: []
  };

  // Helper for single category selection in form
  selectedCategoryId: string = '';

  // Add fileId tracking for product
  productImageFileId: string | null = null;

  variantForm: ProductVariantCreateRequest = {
    name: '',
    color: '',
    size: '',
    material: '',
    specifications: '',
    sku: '',
    additionalPrice: 0,
    stock: 0,
    active: true,
    imageUrl: ''
  };

  // Add fileId tracking for variant
  variantImageFileId: string | null = null;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    public fileUploadService: FileUploadService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // Load data from APIs
  loadData() {
    this.isLoading = true;
    this.hasError = false;
    
    // Load categories first
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        
        // Then load products
        this.productService.getAllProducts().subscribe({
          next: (products) => {
            this.products = products;
            this.applyFilters();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading products:', error);
            this.hasError = true;
            this.errorMessage = 'Không thể tải danh sách sản phẩm';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.hasError = true;
        this.errorMessage = 'Không thể tải danh sách danh mục';
        this.isLoading = false;
      }
    });
  }

  // Apply search and filter
  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (product.sku && product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesCategory = !this.filterCategory || 
        (product.categoryIds && product.categoryIds.includes(this.filterCategory));
      const matchesActive = this.filterActive === null || product.active === this.filterActive;
      
      return matchesSearch && matchesCategory && matchesActive;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  // Category change handler for forms
  onCategoryChange() {
    if (this.selectedCategoryId) {
      this.productForm.categoryIds = [this.selectedCategoryId];
    } else {
      this.productForm.categoryIds = [];
    }
  }

  // ==================== PRODUCT CRUD ====================

  openCreateModal() {
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      sku: '',
      active: true,
      imageUrl: '',
      categoryIds: []
    };
    this.selectedCategoryId = this.categories.length > 0 ? this.categories[0].id! : '';
    this.onCategoryChange();
    this.showCreateModal = true;
  }

  createProduct() {
    if (!this.productForm.name.trim() || !this.productForm.categoryIds || this.productForm.categoryIds.length === 0) {
      alert('Vui lòng nhập tên sản phẩm và chọn danh mục');
      return;
    }

    this.productService.createProduct(this.productForm).subscribe({
      next: (product) => {
        this.products.push(product);
        this.applyFilters();
        this.showCreateModal = false;
        this.resetProductForm();
        this.notifyCategoryUpdate();
      },
      error: (error) => {
        console.error('Error creating product:', error);
        alert('Không thể tạo sản phẩm. Vui lòng thử lại.');
      }
    });
  }

  openEditModal(product: Product) {
    this.selectedProduct = product;
    this.productForm = {
      name: product.name,
      description: product.description || '',
      price: product.price,
      sku: product.sku || '',
      active: product.active || true,
      imageUrl: product.imageUrl || '',
      categoryIds: product.categoryIds || []
    };
    this.selectedCategoryId = (product.categoryIds && product.categoryIds.length > 0) ? product.categoryIds[0] : '';
    this.showEditModal = true;
  }

  updateProduct() {
    if (!this.selectedProduct || !this.productForm.name.trim()) {
      alert('Vui lòng nhập tên sản phẩm');
      return;
    }

    this.productService.updateProduct(this.selectedProduct.id!, this.productForm).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
          this.applyFilters();
        }
        this.showEditModal = false;
        this.resetProductForm();
        this.notifyCategoryUpdate();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        alert('Không thể cập nhật sản phẩm. Vui lòng thử lại.');
      }
    });
  }

  openDeleteModal(product: Product) {
    this.selectedProduct = product;
    this.showDeleteModal = true;
  }

  deleteProduct() {
    if (!this.selectedProduct) return;

    this.productService.deleteProduct(this.selectedProduct.id!).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== this.selectedProduct!.id);
        this.applyFilters();
        this.showDeleteModal = false;
        this.selectedProduct = null;
        this.notifyCategoryUpdate();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        alert('Không thể xóa sản phẩm. Vui lòng thử lại.');
      }
    });
  }

  toggleProductStatus(product: Product) {
    this.productService.toggleActiveStatus(product.id!).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error toggling product status:', error);
        alert('Không thể thay đổi trạng thái sản phẩm.');
      }
    });
  }

  // ==================== VARIANT MANAGEMENT ====================

  openVariantsModal(product: Product) {
    this.selectedProduct = product;
    this.productVariants = product.variants || [];
    this.showVariantsModal = true;
  }

  openCreateVariantModal() {
    this.variantForm = {
      name: '',
      color: '',
      size: '',
      material: '',
      specifications: '',
      sku: '',
      additionalPrice: 0,
      stock: 0,
      active: true,
      imageUrl: ''
    };
    this.showCreateVariantModal = true;
  }

  createVariant() {
    if (!this.selectedProduct || !this.variantForm.name.trim()) {
      alert('Vui lòng nhập tên biến thể');
      return;
    }

    this.productService.createProductVariant(this.selectedProduct.id!, this.variantForm).subscribe({
      next: (updatedProduct) => {
        // Update the product in the list
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
          this.selectedProduct = updatedProduct;
          this.productVariants = updatedProduct.variants || [];
          this.applyFilters();
        }
        this.showCreateVariantModal = false;
        this.resetVariantForm();
      },
      error: (error) => {
        console.error('Error creating variant:', error);
        alert('Không thể tạo biến thể. Vui lòng thử lại.');
      }
    });
  }

  openEditVariantModal(variant: ProductVariant) {
    this.selectedVariant = variant;
    this.variantForm = {
      name: variant.name,
      color: variant.color || '',
      size: variant.size || '',
      material: variant.material || '',
      specifications: variant.specifications || '',
      sku: variant.sku || '',
      additionalPrice: variant.additionalPrice || 0,
      stock: variant.stock || 0,
      active: variant.active || true,
      imageUrl: variant.imageUrl || ''
    };
    this.showEditVariantModal = true;
  }

  updateVariant() {
    if (!this.selectedProduct || !this.selectedVariant || !this.variantForm.name.trim()) {
      alert('Vui lòng nhập tên biến thể');
      return;
    }

    this.productService.updateProductVariant(this.selectedProduct.id!, this.selectedVariant.id!, this.variantForm).subscribe({
      next: (updatedProduct) => {
        // Update the product in the list
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
          this.selectedProduct = updatedProduct;
          this.productVariants = updatedProduct.variants || [];
          this.applyFilters();
        }
        this.showEditVariantModal = false;
        this.resetVariantForm();
      },
      error: (error) => {
        console.error('Error updating variant:', error);
        alert('Không thể cập nhật biến thể. Vui lòng thử lại.');
      }
    });
  }

  openDeleteVariantModal(variant: ProductVariant) {
    this.selectedVariant = variant;
    this.showDeleteVariantModal = true;
  }

  deleteVariant() {
    if (!this.selectedProduct || !this.selectedVariant) return;

    this.productService.deleteProductVariant(this.selectedProduct.id!, this.selectedVariant.id!).subscribe({
      next: (updatedProduct) => {
        // Update the product in the list
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
          this.selectedProduct = updatedProduct;
          this.productVariants = updatedProduct.variants || [];
          this.applyFilters();
        }
        this.showDeleteVariantModal = false;
        this.selectedVariant = null;
      },
      error: (error) => {
        console.error('Error deleting variant:', error);
        alert('Không thể xóa biến thể. Vui lòng thử lại.');
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  resetProductForm() {
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      sku: '',
      active: true,
      imageUrl: '',
      categoryIds: []
    };
    this.selectedCategoryId = '';
  }

  resetVariantForm() {
    this.variantForm = {
      name: '',
      color: '',
      size: '',
      material: '',
      specifications: '',
      sku: '',
      additionalPrice: 0,
      stock: 0,
      active: true,
      imageUrl: ''
    };
  }

  closeModal() {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.showDeleteModal = false;
    this.showVariantsModal = false;
    this.showCreateVariantModal = false;
    this.showEditVariantModal = false;
    this.showDeleteVariantModal = false;
    this.selectedProduct = null;
    this.selectedVariant = null;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price) + 'đ';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(dateObj);
  }

  refreshData() {
    this.loadData();
  }

  private notifyCategoryUpdate() {
    // Emit event hoặc call service để notify category component update product count
    console.log('Categories should refresh product count');
  }

  // File upload handlers
  onProductImageUploaded(event: {fileId: string, url: string}) {
    this.productImageFileId = event.fileId;
    this.productForm.imageUrl = event.url;
  }

  onProductImageRemoved() {
    this.productImageFileId = null;
    this.productForm.imageUrl = '';
  }

  onProductImageError(error: string) {
    console.error('Product image upload error:', error);
    alert('Lỗi tải ảnh sản phẩm: ' + error);
  }

  onVariantImageUploaded(event: {fileId: string, url: string}) {
    this.variantImageFileId = event.fileId;
    this.variantForm.imageUrl = event.url;
  }

  onVariantImageRemoved() {
    this.variantImageFileId = null;
    this.variantForm.imageUrl = '';
  }

  onVariantImageError(error: string) {
    console.error('Variant image upload error:', error);
    alert('Lỗi tải ảnh biến thể: ' + error);
  }

  // Extract file ID from image URL for editing
  extractFileIdFromUrl(imageUrl: string | undefined): string | null {
    if (!imageUrl) return null;
    const matches = imageUrl.match(/\/files\/([^\/]+)$/);
    return matches ? matches[1] : null;
  }

  getImageUrl(fileId: string): string {
    return this.fileUploadService.getFileUrl(fileId);
  }
}
