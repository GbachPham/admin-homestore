export interface Category {
  id?: string;
  name: string;
  description?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  productCount?: number;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
  active?: boolean;
}

export interface CategoryUpdateRequest {
  name: string;
  description?: string;
  active?: boolean;
} 