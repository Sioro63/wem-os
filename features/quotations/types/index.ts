import type { PriceLevel, QuoteStatus } from "@prisma/client";

export interface QuoteListItem {
  id: string;
  quoteNumber: string;
  customerName: string;
  status: QuoteStatus;
  total: number;
  itemCount: number;
  createdByName: string;
  createdAt: string;
}

export interface QuoteDetailItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuoteDetail {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  customerId: string;
  customerName: string;
  customerEmail: string;
  validUntil: string | null;
  notes: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdByName: string;
  createdAt: string;
  salesOrderId: string | null;
  salesOrderNumber: string | null;
  items: QuoteDetailItem[];
}

export interface QuoteCustomerOption {
  value: string;
  label: string;
  priceLevel: PriceLevel;
}

export interface QuoteProductOption {
  value: string;
  label: string;
  sku: string;
  srp: number;
  dealerPrice: number;
}

export interface QuoteFormData {
  customers: QuoteCustomerOption[];
  products: QuoteProductOption[];
}
