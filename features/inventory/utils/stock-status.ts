import type { StockStatus } from "@/features/inventory/types";

/**
 * Traffic-light stock health:
 *  red    (critical) — available ≤ minimum stock
 *  yellow (low)      — available ≤ reorder point
 *  green  (healthy)  — everything else
 */
export function getStockStatus(
  available: number,
  minimumStock: number,
  reorderPoint: number,
): StockStatus {
  if (available <= minimumStock) return "critical";
  if (available <= reorderPoint) return "low";
  return "healthy";
}

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  healthy: "Healthy",
  low: "Low",
  critical: "Critical",
};

export const STOCK_STATUS_VARIANTS: Record<
  StockStatus,
  "success" | "warning" | "destructive"
> = {
  healthy: "success",
  low: "warning",
  critical: "destructive",
};
