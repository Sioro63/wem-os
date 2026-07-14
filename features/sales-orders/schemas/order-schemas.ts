import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Choose a product."),
  quantity: z.coerce
    .number({ invalid_type_error: "Enter a quantity." })
    .int("Whole units only.")
    .positive("At least 1."),
  unitPrice: z.coerce
    .number({ invalid_type_error: "Enter a price." })
    .nonnegative("Must be zero or more."),
});

export const orderFormSchema = z.object({
  customerId: z.string().min(1, "Choose a customer."),
  discount: z.coerce.number().nonnegative("Must be zero or more.").default(0),
  notes: z.string().max(2000).optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1, "Add at least one line item."),
});

export type OrderFormInput = z.infer<typeof orderFormSchema>;
