import type { SalesOrderStatus } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<SalesOrderStatus, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
};

export const ORDER_STATUS_VARIANTS: Record<
  SalesOrderStatus,
  "secondary" | "water" | "success"
> = {
  PENDING: "secondary",
  PROCESSING: "water",
  COMPLETED: "success",
};

/** Allowed forward transitions. */
export const ORDER_NEXT_STATUS: Record<
  SalesOrderStatus,
  SalesOrderStatus | null
> = {
  PENDING: "PROCESSING",
  PROCESSING: "COMPLETED",
  COMPLETED: null,
};
