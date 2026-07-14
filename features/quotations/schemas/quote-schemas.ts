import { z } from "zod";

export const quoteItemSchema = z.object({
  productId: z.string().min(1, "Choose a product."),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a quantity." })
    .int("Whole units only.")
    .positive("At least 1."),
  unitPrice: z.coerce
    .number({ invalid_type_error: "Enter a price." })
    .nonnegative("Must be zero or more."),
});

export const quoteFormSchema = z.object({
  customerId: z.string().min(1, "Choose a customer."),
  validUntil: z.string().optional().or(z.literal("")),
  discount: z.coerce.number().nonnegative("Must be zero or more.").default(0),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z.array(quoteItemSchema).min(1, "Add at least one line item."),
});

export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
export type QuoteFormInput = z.infer<typeof quoteFormSchema>;
