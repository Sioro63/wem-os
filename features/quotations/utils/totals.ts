import { TAX_RATE } from "@/lib/constants";

export interface TotalsInput {
  items: { quantity: number; unitPrice: number }[];
  discount: number;
}

/**
 * Quote/order money math, shared by the form preview and the server actions
 * so the numbers the user sees are exactly the numbers that get stored.
 * VAT is applied after discount. All values rounded to centavos.
 */
export function computeTotals({ items, discount }: TotalsInput) {
  const subtotal = round(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  );
  const cappedDiscount = Math.min(round(discount), subtotal);
  const taxable = subtotal - cappedDiscount;
  const tax = round(taxable * TAX_RATE);
  const total = round(taxable + tax);
  return { subtotal, discount: cappedDiscount, tax, total };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
