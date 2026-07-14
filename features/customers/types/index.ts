import type { PriceLevel } from "@prisma/client";

export interface CustomerListItem {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  region: string;
  priceLevel: PriceLevel;
  quoteCount: number;
  orderCount: number;
}

export interface CustomerDetail {
  id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  priceLevel: PriceLevel;
  notes: string | null;
}
