"use client";

import { MissingProductStatus } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import { ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteMissingProductRequest,
  updateMissingProductStatus,
} from "@/features/missing-products/actions/missing-product-actions";
import type { MissingProductListItem } from "@/features/missing-products/types";
import {
  MISSING_STATUS_LABELS,
  MISSING_STATUS_VARIANTS,
} from "@/features/missing-products/utils/status";
import { formatDate, formatNumber } from "@/utils/format";

function StatusCell({ row }: { row: MissingProductListItem }) {
  const router = useRouter();

  const onChange = async (status: string) => {
    const result = await updateMissingProductStatus(
      row.id,
      status as MissingProductStatus,
    );
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Status updated.");
    router.refresh();
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Select value={row.status} onValueChange={onChange}>
        <SelectTrigger
          className="h-8 w-[130px]"
          aria-label={`Status for request from ${row.customerName}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(MissingProductStatus).map((status) => (
            <SelectItem key={status} value={status}>
              {MISSING_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DeleteCell({ row }: { row: MissingProductListItem }) {
  const router = useRouter();

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <ConfirmDialog
        trigger={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete request"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        }
        title="Delete this request?"
        description="The request will be permanently removed."
        confirmLabel="Delete request"
        destructive
        onConfirm={async () => {
          const result = await deleteMissingProductRequest(row.id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Request deleted.");
          router.refresh();
        }}
      />
    </div>
  );
}

export function getMissingProductColumns(
  canManage: boolean,
): ColumnDef<MissingProductListItem>[] {
  const columns: ColumnDef<MissingProductListItem>[] = [
    {
      accessorKey: "description",
      header: "Request",
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
              <ImageIcon
                className="h-4 w-4 text-muted-foreground"
                aria-hidden
              />
            )}
          </div>
          <p className="max-w-md truncate font-medium">
            {row.original.description}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.customerName}
        </span>
      ),
    },
    {
      accessorKey: "quantity",
      header: () => <span className="block text-right">Qty</span>,
      cell: ({ row }) => (
        <span className="block text-right tabular-nums">
          {formatNumber(row.original.quantity)}
        </span>
      ),
    },
    {
      accessorKey: "requestedByName",
      header: "Logged by",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.requestedByName}
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

  if (canManage) {
    columns.push(
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell row={row.original} />,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <DeleteCell row={row.original} />,
      },
    );
  } else {
    columns.push({
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={MISSING_STATUS_VARIANTS[row.original.status]}>
          {MISSING_STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    });
  }

  return columns;
}
