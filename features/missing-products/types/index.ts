import type { MissingProductStatus } from "@prisma/client";

export interface MissingProductListItem {
  id: string;
  description: string;
  quantity: number;
  imageUrl: string | null;
  status: MissingProductStatus;
  customerId: string;
  customerName: string;
  requestedByName: string;
  createdAt: string;
  notes: string | null;
}
