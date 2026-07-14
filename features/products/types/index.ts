import type { ProductStatus } from "@prisma/client";

/** Plain-object product for list views (Decimals converted to numbers). */
export interface ProductListItem {
  id: string;
  sku: string;
  name: string;
  imageUrl: string | null;
  categoryName: string;
  brandName: string | null;
  cost: number;
  srp: number;
  dealerPrice: number;
  status: ProductStatus;
  availableStock: number;
}

/** Plain-object product for the edit form. */
export interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string;
  brandId: string | null;
  supplierId: string | null;
  country: string | null;
  cost: number;
  srp: number;
  dealerPrice: number;
  imageUrl: string | null;
  status: ProductStatus;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface ProductFormOptions {
  categories: SelectOption[];
  brands: SelectOption[];
  suppliers: SelectOption[];
}
