import "server-only";

import { getStockStatus } from "@/features/inventory/utils/stock-status";
import type {
  DashboardData,
  MonthlyOrdersPoint,
} from "@/features/dashboard/types";
import { prisma } from "@/lib/prisma";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export async function getDashboardData(): Promise<DashboardData> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [
    productCount,
    customerCount,
    pendingQuoteCount,
    openOrderCount,
    inventoryRows,
    activityRows,
    recentOrders,
  ] = await prisma.$transaction([
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.customer.count(),
    prisma.quote.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
    prisma.salesOrder.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    }),
    prisma.inventory.findMany({
      select: {
        physicalStock: true,
        reservedStock: true,
        minimumStock: true,
        reorderPoint: true,
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, summary: true, createdAt: true },
    }),
    prisma.salesOrder.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, total: true },
    }),
  ]);

  const breakdown = { healthy: 0, low: 0, critical: 0 };
  for (const row of inventoryRows) {
    const status = getStockStatus(
      row.physicalStock - row.reservedStock,
      row.minimumStock,
      row.reorderPoint,
    );
    breakdown[status] += 1;
  }

  // Six-month order volume/revenue series, oldest month first.
  const series: MonthlyOrdersPoint[] = [];
  const cursor = new Date(sixMonthsAgo);
  for (let i = 0; i < 6; i++) {
    series.push({
      month: MONTH_LABELS[cursor.getMonth()],
      orders: 0,
      revenue: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  for (const order of recentOrders) {
    const monthsFromStart =
      (order.createdAt.getFullYear() - sixMonthsAgo.getFullYear()) * 12 +
      (order.createdAt.getMonth() - sixMonthsAgo.getMonth());
    if (monthsFromStart >= 0 && monthsFromStart < 6) {
      series[monthsFromStart].orders += 1;
      series[monthsFromStart].revenue += Number(order.total);
    }
  }

  return {
    kpis: {
      productCount,
      customerCount,
      lowStockCount: breakdown.low + breakdown.critical,
      pendingQuoteCount,
      openOrderCount,
    },
    activity: activityRows.map((row) => ({
      id: row.id,
      summary: row.summary,
      createdAt: row.createdAt.toISOString(),
    })),
    monthlyOrders: series.map((point) => ({
      ...point,
      revenue: Math.round(point.revenue),
    })),
    inventoryBreakdown: breakdown,
  };
}
