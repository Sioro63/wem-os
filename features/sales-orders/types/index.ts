import type { SalesOrderStatus } from "@prisma/client";

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  status: SalesOrderStatus;
  total: number;
  itemCount: number;
  createdByName: string;
  createdAt: string;
}

export interface OrderDetailItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: SalesOrderStatus;
  customerName: string;
  customerEmail: string;
  notes: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  createdByName: string;
  createdAt: string;
  quoteId: string | null;
  quoteNumber: string | null;
  items: OrderDetailItem[];
}
