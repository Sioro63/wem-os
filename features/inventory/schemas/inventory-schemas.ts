import { z } from "zod";

export const adjustStockSchema = z.object({
  inventoryId: z.string().min(1),
  physicalStock: z.coerce
    .number({ invalid_type_error: "Enter a number." })
    .int("Whole units only.")
    .min(0, "Stock can't be negative."),
  minimumStock: z.coerce.number().int().min(0),
  reorderPoint: z.coerce.number().int().min(0),
  reason: z.string().max(200).optional().or(z.literal("")),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
