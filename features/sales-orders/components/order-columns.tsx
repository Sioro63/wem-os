"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { OrderListItem } from "@/features/sales-orders/types";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
} from "@/features/sales-orders/utils/status";
import { formatCurrency, formatDate, formatNumber } from "@/utils/format";

export const orderColumns: ColumnDef<OrderListItem>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.orderNumber}
      </span>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.customerName}</span>
    ),
  },
  {
    accessorKey: "itemCount",
    header: () => <span className="block text-right">Items</span>,
    cell: ({ row }) => (
      <span className="block text-right tabular-nums text-muted-foreground">
        {formatNumber(row.original.itemCount)}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: () => <span className="block text-right">Total</span>,
    cell: ({ row }) => (
      <span className="block text-right font-medium tabular-nums">
        {formatCurrency(row.original.total)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={ORDER_STATUS_VARIANTS[row.original.status]}>
        {ORDER_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: "createdByName",
    header: "Created by",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.createdByName}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];
