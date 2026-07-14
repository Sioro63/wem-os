import { MissingProductStatus } from "@prisma/client";
import { z } from "zod";

export const missingProductFormSchema = z.object({
  customerId: z.string().min(1, "Choose a customer."),
  description: z
    .string()
    .min(4, "Describe the product the customer asked for."),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a quantity." })
    .int("Whole units only.")
    .positive("At least 1."),
  imageUrl: z.string().url("Enter a valid image URL.").optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const missingProductStatusSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(MissingProductStatus),
});

export type MissingProductFormInput = z.infer<typeof missingProductFormSchema>;
