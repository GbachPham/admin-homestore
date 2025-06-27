export interface Product {
  id?: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  active?: boolean;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  categoryIds?: string[]; // Multiple categories support
  categoryNames?: string[]; // For display
  variants?: ProductVariant[];
  variantCount?: number;
  tags?: ProductTag[]; // Product tags for promotions
}

export interface ProductVariant {
  id?: string;
  name: string;
  color?: string;
  size?: string;
  material?: string;
  specifications?: string;
  sku?: string;
  additionalPrice?: number;
  stock?: number;
  active?: boolean;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
  productId?: string;
  productName?: string;
}

export interface ProductCreateRequest {
  name: string;
  description?: string;
  price: number;
  sku?: string;
  active?: boolean;
  imageUrl?: string;
  categoryIds?: string[]; // Multiple categories
  variants?: ProductVariant[];
  tags?: ProductTag[];
}

export interface ProductUpdateRequest {
  name: string;
  description?: string;
  price: number;
  sku?: string;
  active?: boolean;
  imageUrl?: string;
  categoryIds?: string[]; // Multiple categories
  variants?: ProductVariant[];
  tags?: ProductTag[];
}

export interface ProductVariantCreateRequest {
  name: string;
  color?: string;
  size?: string;
  material?: string;
  specifications?: string;
  sku?: string;
  additionalPrice?: number;
  stock?: number;
  active?: boolean;
  imageUrl?: string;
}

export interface ProductVariantUpdateRequest {
  name: string;
  color?: string;
  size?: string;
  material?: string;
  specifications?: string;
  sku?: string;
  additionalPrice?: number;
  stock?: number;
  active?: boolean;
  imageUrl?: string;
}

export interface ProductTag {
  type: string; // "discount", "hot", "new", "bestseller", "featured"
  value?: string; // Value of tag (e.g., "10%" for discount)
  color?: string; // Display color
  active?: boolean;
} 