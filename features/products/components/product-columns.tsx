"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ProductListItem } from "@/features/products/types";
import { ProductRowActions } from "@/features/products/components/product-row-actions";
import {
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_VARIANTS,
} from "@/features/products/utils/status";
import { formatCurrency, formatNumber } from "@/utils/format";

export function getProductColumns(canManage: boolean): ColumnDef<ProductListItem>[] {
  const columns: ColumnDef<ProductListItem>[] = [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
            {row.original.imageUrl ? (
              <Image
                src={row.original.imageUrl}
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <Package className="h-4 w-4 text-muted-foreground" aria-hidden />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="font-mono text-xs text-muted-foreground">
              {row.original.sku}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.categoryName}</span>
      ),
    },
    {
      accessorKey: "brandName",
      header: "Brand",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.brandName ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "srp",
      header: () => <span className="block text-right">SRP</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums">
          {formatCurrency(row.original.srp)}
        </span>
      ),
    },
    {
      accessorKey: "dealerPrice",
      header: () => <span className="block text-right">Dealer</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums text-muted-foreground">
          {formatCurrency(row.original.dealerPrice)}
        </span>
      ),
    },
    {
      accessorKey: "availableStock",
      header: () => <span className="block text-right">Available</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums">
          {formatNumber(row.original.availableStock)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={PRODUCT_STATUS_VARIANTS[row.original.status]}>
          {PRODUCT_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <ProductRowActions product={row.original} />,
    });
  }

  return columns;
}
