"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { QuoteListItem } from "@/features/quotations/types";
import {
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_VARIANTS,
} from "@/features/quotations/utils/status";
import { formatCurrency, formatDate, formatNumber } from "@/utils/format";

export const quoteColumns: ColumnDef<QuoteListItem>[] = [
  {
    accessorKey: "quoteNumber",
    header: "Quote",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.quoteNumber}
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
      <Badge variant={QUOTE_STATUS_VARIANTS[row.original.status]}>
        {QUOTE_STATUS_LABELS[row.original.status]}
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
