"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { CustomerRowActions } from "@/features/customers/components/customer-row-actions";
import type { CustomerListItem } from "@/features/customers/types";
import {
  PRICE_LEVEL_LABELS,
  PRICE_LEVEL_VARIANTS,
} from "@/features/customers/utils/price-level";
import { formatNumber } from "@/utils/format";

export function getCustomerColumns(
  canManage: boolean,
): ColumnDef<CustomerListItem>[] {
  const columns: ColumnDef<CustomerListItem>[] = [
    {
      accessorKey: "company",
      header: "Customer",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.original.company}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.contactPerson}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => (
        <div className="min-w-0 text-muted-foreground">
          <p className="truncate">{row.original.email}</p>
          <p className="truncate text-xs">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.region}</span>
      ),
    },
    {
      accessorKey: "priceLevel",
      header: "Price level",
      cell: ({ row }) => (
        <Badge variant={PRICE_LEVEL_VARIANTS[row.original.priceLevel]}>
          {PRICE_LEVEL_LABELS[row.original.priceLevel]}
        </Badge>
      ),
    },
    {
      accessorKey: "quoteCount",
      header: () => <span className="block text-right">Quotes</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-muted-foreground">
          {formatNumber(row.original.quoteCount)}
        </span>
      ),
    },
    {
      accessorKey: "orderCount",
      header: () => <span className="block text-right">Orders</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-muted-foreground">
          {formatNumber(row.original.orderCount)}
        </span>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <CustomerRowActions customer={row.original} />,
    });
  }

  return columns;
}
