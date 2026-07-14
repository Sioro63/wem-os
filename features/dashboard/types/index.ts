export interface DashboardKpis {
  productCount: number;
  customerCount: number;
  lowStockCount: number;
  pendingQuoteCount: number;
  openOrderCount: number;
}

export interface ActivityFeedItem {
  id: string;
  summary: string;
  createdAt: string;
}

export interface MonthlyOrdersPoint {
  month: string; // "Feb"
  orders: number;
  revenue: number;
}

export interface InventoryBreakdown {
  healthy: number;
  low: number;
  critical: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  activity: ActivityFeedItem[];
  monthlyOrders: MonthlyOrdersPoint[];
  inventoryBreakdown: InventoryBreakdown;
}
