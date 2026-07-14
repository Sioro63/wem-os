import type { ProductStatus } from "@prisma/client";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DISCONTINUED: "Discontinued",
};

export const PRODUCT_STATUS_VARIANTS: Record<
  ProductStatus,
  "success" | "secondary" | "destructive"
> = {
  ACTIVE: "success",
  INACTIVE: "secondary",
  DISCONTINUED: "destructive",
};
