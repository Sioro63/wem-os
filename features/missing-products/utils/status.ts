import type { MissingProductStatus } from "@prisma/client";

export const MISSING_STATUS_LABELS: Record<MissingProductStatus, string> = {
  OPEN: "Open",
  SOURCING: "Sourcing",
  FULFILLED: "Fulfilled",
  CLOSED: "Closed",
};

export const MISSING_STATUS_VARIANTS: Record<
  MissingProductStatus,
  "warning" | "water" | "success" | "secondary"
> = {
  OPEN: "warning",
  SOURCING: "water",
  FULFILLED: "success",
  CLOSED: "secondary",
};
