import "server-only";

import type { Prisma } from "@prisma/client";

import type {
  InventoryListItem,
  InventorySummary,
} from "@/features/inventory/types";
import { getStockStatus } from "@/features/inventory/utils/stock-status";
import { prisma } from "@/lib/prisma";
import { getPageCount, getPagination } from "@/services/pagination";
import type { Paginated, SearchParams } from "@/types";

function param(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function getInventory(
  searchParams: SearchParams,
): Promise<{
  result: Paginated<InventoryListItem>;
  summary: InventorySummary;
  warehouses: { label: string; value: string }[];
}> {
  const q = param(searchParams, "q")?.trim();
  const warehouse = param(searchParams, "warehouse");
  const stock = param(searchParams, "stock"); // healthy | low | critical
  const { page, pageSize, skip, take } = getPagination(searchParams.page);

  const where: Prisma.InventoryWhereInput = {
    ...(q
      ? {
          product: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
            ],
          },
        }
      : {}),
    ...(warehouse ? { warehouseId: warehouse } : {}),
  };

  // Stock health depends on derived math, so we filter in memory after
  // fetching the matching rows. Row counts stay small in V1 (one warehouse,
  // a few hundred products); revisit with generated columns if that changes.
  const [rows, warehouses] = await prisma.$transaction([
    prisma.inventory.findMany({
      where,
      include: {
        product: { select: { name: true, sku: true } },
        warehouse: { select: { name: true } },
      },
      orderBy: { product: { name: "asc" } },
    }),
    prisma.warehouse.findMany({ orderBy: { name: "asc" } }),
  ]);

  const mapped: InventoryListItem[] = rows.map((row) => {
    const availableStock = row.physicalStock - row.reservedStock;
    return {
      id: row.id,
      productId: row.productId,
      productName: row.product.name,
      productSku: row.product.sku,
      warehouseId: row.warehouseId,
      warehouseName: row.warehouse.name,
      physicalStock: row.physicalStock,
      reservedStock: row.reservedStock,
      availableStock,
      minimumStock: row.minimumStock,
      reorderPoint: row.reorderPoint,
      stockStatus: getStockStatus(
        availableStock,
        row.minimumStock,
        row.reorderPoint,
      ),
    };
  });

  const summary: InventorySummary = {
    healthy: mapped.filter((r) => r.stockStatus === "healthy").length,
    low: mapped.filter((r) => r.stockStatus === "low").length,
    critical: mapped.filter((r) => r.stockStatus === "critical").length,
  };

  const filtered = stock
    ? mapped.filter((row) => row.stockStatus === stock)
    : mapped;

  const total = filtered.length;

  return {
    result: {
      items: filtered.slice(skip, skip + take),
      total,
      page,
      pageSize,
      pageCount: getPageCount(total, pageSize),
    },
    summary,
    warehouses: warehouses.map((w) => ({ label: w.name, value: w.id })),
  };
}
