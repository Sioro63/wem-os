"use client";

import { ArrowRight, PackageCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/features/sales-orders/actions/order-actions";
import type { OrderDetail } from "@/features/sales-orders/types";
import {
  ORDER_NEXT_STATUS,
  ORDER_STATUS_LABELS,
} from "@/features/sales-orders/utils/status";

export function OrderStatusActions({
  order,
  canUpdate,
}: {
  order: OrderDetail;
  canUpdate: boolean;
}) {
  const router = useRouter();
  const next = ORDER_NEXT_STATUS[order.status];

  if (!canUpdate || !next) return null;

  const isCompleting = next === "COMPLETED";

  return (
    <ConfirmDialog
      trigger={
        <Button>
          {isCompleting ? <PackageCheck /> : <ArrowRight />}
          Move to {ORDER_STATUS_LABELS[next]}
        </Button>
      }
      title={`Move ${order.orderNumber} to ${ORDER_STATUS_LABELS[next]}?`}
      description={
        isCompleting
          ? "Completing the order deducts the shipped quantities from physical stock and releases the reservations."
          : "The order moves to processing while the warehouse picks and packs it."
      }
      confirmLabel={`Move to ${ORDER_STATUS_LABELS[next]}`}
      onConfirm={async () => {
        const result = await updateOrderStatus(order.id, next);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success(`Order moved to ${ORDER_STATUS_LABELS[next].toLowerCase()}.`);
        router.refresh();
      }}
    />
  );
}
