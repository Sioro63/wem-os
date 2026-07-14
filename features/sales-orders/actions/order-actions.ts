"use server";

import type { SalesOrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  orderFormSchema,
  type OrderFormInput,
} from "@/features/sales-orders/schemas/order-schemas";
import { ORDER_NEXT_STATUS } from "@/features/sales-orders/utils/status";
import { computeTotals } from "@/features/quotations/utils/totals";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logActivity } from "@/services/activity-log";
import { nextSalesOrderNumber } from "@/services/document-numbers";
import type { ActionResult } from "@/types";

/**
 * Manual sales order (no quote). Reserves stock for every line item in the
 * default warehouse inside the same transaction.
 */
export async function createSalesOrder(
  input: OrderFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("order.manage");
    const parsed = orderFormSchema.parse(input);
    const totals = computeTotals(parsed);

    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { isDefault: true },
    });
    if (!defaultWarehouse) {
      return { success: false, error: "No default warehouse is configured." };
    }

    const orderNumber = await nextSalesOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: parsed.customerId,
          createdById: user.id,
          notes: parsed.notes || null,
          ...totals,
          items: {
            create: parsed.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
            })),
          },
        },
      });

      for (const item of parsed.items) {
        await tx.inventory.upsert({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: defaultWarehouse.id,
            },
          },
          update: { reservedStock: { increment: item.quantity } },
          create: {
            productId: item.productId,
            warehouseId: defaultWarehouse.id,
            physicalStock: 0,
            reservedStock: item.quantity,
            minimumStock: 5,
            reorderPoint: 10,
          },
        });
      }

      return created;
    });

    await logActivity({
      action: "order.created",
      entityType: "SalesOrder",
      entityId: order.id,
      summary: `${user.name} created sales order ${order.orderNumber}`,
      userId: user.id,
    });

    revalidatePath("/sales-orders");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true, data: { id: order.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create the order.",
    };
  }
}

/**
 * Moves an order forward: PENDING → PROCESSING → COMPLETED.
 * Completing an order ships the goods: physical and reserved stock are both
 * decremented in the default warehouse.
 */
export async function updateOrderStatus(
  id: string,
  nextStatus: SalesOrderStatus,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("order.updateStatus");

    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) return { success: false, error: "Order not found." };

    if (ORDER_NEXT_STATUS[order.status] !== nextStatus) {
      return {
        success: false,
        error: `Orders move ${order.status === "COMPLETED" ? "no further" : `from ${order.status} to ${ORDER_NEXT_STATUS[order.status]}`}.`,
      };
    }

    if (nextStatus === "COMPLETED") {
      const defaultWarehouse = await prisma.warehouse.findFirst({
        where: { isDefault: true },
      });
      if (!defaultWarehouse) {
        return { success: false, error: "No default warehouse is configured." };
      }

      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.inventory.update({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: defaultWarehouse.id,
              },
            },
            data: {
              physicalStock: { decrement: item.quantity },
              reservedStock: { decrement: item.quantity },
            },
          });
        }
        await tx.salesOrder.update({
          where: { id },
          data: { status: nextStatus },
        });
      });
    } else {
      await prisma.salesOrder.update({
        where: { id },
        data: { status: nextStatus },
      });
    }

    await logActivity({
      action: "order.statusChanged",
      entityType: "SalesOrder",
      entityId: id,
      summary: `${user.name} moved order ${order.orderNumber} to ${nextStatus.toLowerCase()}`,
      userId: user.id,
      metadata: { from: order.status, to: nextStatus },
    });

    revalidatePath("/sales-orders");
    revalidatePath(`/sales-orders/${id}`);
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update the order.",
    };
  }
}
