export type StockStatus = "healthy" | "low" | "critical";

export interface InventoryListItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  warehouseName: string;
  physicalStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  reorderPoint: number;
  stockStatus: StockStatus;
}

export interface InventorySummary {
  healthy: number;
  low: number;
  critical: number;
}
