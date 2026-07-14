"use server";

import { revalidatePath } from "next/cache";

import {
  adjustStockSchema,
  type AdjustStockInput,
} from "@/features/inventory/schemas/inventory-schemas";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logActivity } from "@/services/activity-log";
import type { ActionResult } from "@/types";

export async function adjustStock(
  input: AdjustStockInput,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("inventory.adjust");
    const parsed = adjustStockSchema.parse(input);

    const inventory = await prisma.inventory.findUnique({
      where: { id: parsed.inventoryId },
      include: { product: { select: { sku: true, name: true } } },
    });
    if (!inventory) return { success: false, error: "Inventory row not found." };

    if (parsed.physicalStock < inventory.reservedStock) {
      return {
        success: false,
        error: `Physical stock can't drop below the ${inventory.reservedStock} units currently reserved on open orders.`,
      };
    }

    await prisma.inventory.update({
      where: { id: parsed.inventoryId },
      data: {
        physicalStock: parsed.physicalStock,
        minimumStock: parsed.minimumStock,
        reorderPoint: parsed.reorderPoint,
      },
    });

    await logActivity({
      action: "inventory.adjusted",
      entityType: "Inventory",
      entityId: inventory.id,
      summary: `${user.name} set ${inventory.product.sku} stock to ${parsed.physicalStock}${parsed.reason ? ` — ${parsed.reason}` : ""}`,
      userId: user.id,
      metadata: {
        from: inventory.physicalStock,
        to: parsed.physicalStock,
        reason: parsed.reason || null,
      },
    });

    revalidatePath("/inventory");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not adjust stock.",
    };
  }
}
