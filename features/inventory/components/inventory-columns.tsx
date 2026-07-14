"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { AdjustStockDialog } from "@/features/inventory/components/adjust-stock-dialog";
import type { InventoryListItem } from "@/features/inventory/types";
import {
  STOCK_STATUS_LABELS,
  STOCK_STATUS_VARIANTS,
} from "@/features/inventory/utils/stock-status";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/utils/format";

const dotColor = {
  healthy: "bg-success",
  low: "bg-warning",
  critical: "bg-destructive",
} as const;

export function getInventoryColumns(
  canAdjust: boolean,
): ColumnDef<InventoryListItem>[] {
  const columns: ColumnDef<InventoryListItem>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.productName}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {row.original.productSku}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "warehouseName",
      header: "Warehouse",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.warehouseName}
        </span>
      ),
    },
    {
      accessorKey: "physicalStock",
      header: () => <span className="block text-right">Physical</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums">
          {formatNumber(row.original.physicalStock)}
        </span>
      ),
    },
    {
      accessorKey: "reservedStock",
      header: () => <span className="block text-right">Reserved</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-muted-foreground">
          {formatNumber(row.original.reservedStock)}
        </span>
      ),
    },
    {
      accessorKey: "availableStock",
      header: () => <span className="block text-right">Available</span>,
      cell: ({ row }) => (
        <span className="block text-right font-medium tabular-nums">
          {formatNumber(row.original.availableStock)}
        </span>
      ),
    },
    {
      accessorKey: "reorderPoint",
      header: () => <span className="block text-right">Reorder at</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-muted-foreground">
          {formatNumber(row.original.reorderPoint)}
        </span>
      ),
    },
    {
      accessorKey: "stockStatus",
      header: "Health",
      cell: ({ row }) => (
        <Badge variant={STOCK_STATUS_VARIANTS[row.original.stockStatus]}>
          <span
            aria-hidden
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              dotColor[row.original.stockStatus],
            )}
          />
          {STOCK_STATUS_LABELS[row.original.stockStatus]}
        </Badge>
      ),
    },
  ];

  if (canAdjust) {
    columns.push({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <AdjustStockDialog row={row.original} />
        </div>
      ),
    });
  }

  return columns;
}
