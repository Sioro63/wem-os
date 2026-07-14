import { ProductStatus } from "@prisma/client";
import { z } from "zod";

const money = z.coerce
  .number({ invalid_type_error: "Enter a number." })
  .nonnegative("Must be zero or more.");

export const productFormSchema = z.object({
  sku: z
    .string()
    .min(2, "SKU needs at least 2 characters.")
    .max(40, "SKU can be at most 40 characters.")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only."),
  name: z.string().min(2, "Enter the product name."),
  description: z.string().max(2000).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Choose a category."),
  brandId: z.string().optional().or(z.literal("")),
  supplierId: z.string().optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  cost: money,
  srp: money,
  dealerPrice: money,
  imageUrl: z.string().url("Enter a valid image URL.").optional().or(z.literal("")),
  status: z.nativeEnum(ProductStatus),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export const productListParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
});
