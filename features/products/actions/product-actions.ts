"use server";

import { revalidatePath } from "next/cache";

import {
  productFormSchema,
  type ProductFormInput,
} from "@/features/products/schemas/product-schemas";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logActivity } from "@/services/activity-log";
import type { ActionResult } from "@/types";

function toData(input: ProductFormInput) {
  return {
    sku: input.sku.toUpperCase(),
    name: input.name,
    description: input.description || null,
    categoryId: input.categoryId,
    brandId: input.brandId || null,
    supplierId: input.supplierId || null,
    country: input.country || null,
    cost: input.cost,
    srp: input.srp,
    dealerPrice: input.dealerPrice,
    imageUrl: input.imageUrl || null,
    status: input.status,
  };
}

export async function createProduct(
  input: ProductFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("product.manage");
    const parsed = productFormSchema.parse(input);

    const existing = await prisma.product.findUnique({
      where: { sku: parsed.sku.toUpperCase() },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: `SKU ${parsed.sku.toUpperCase()} is already in use.` };
    }

    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { isDefault: true },
    });

    const product = await prisma.product.create({
      data: {
        ...toData(parsed),
        // Every product gets an inventory row in the default warehouse so it
        // appears on the Inventory screen immediately.
        ...(defaultWarehouse
          ? {
              inventory: {
                create: {
                  warehouseId: defaultWarehouse.id,
                  physicalStock: 0,
                  reservedStock: 0,
                  minimumStock: 5,
                  reorderPoint: 10,
                },
              },
            }
          : {}),
      },
    });

    await logActivity({
      action: "product.created",
      entityType: "Product",
      entityId: product.id,
      summary: `${user.name} added product ${product.sku} — ${product.name}`,
      userId: user.id,
    });

    revalidatePath("/products");
    revalidatePath("/inventory");
    return { success: true, data: { id: product.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create the product.",
    };
  }
}

export async function updateProduct(
  id: string,
  input: ProductFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("product.manage");
    const parsed = productFormSchema.parse(input);

    const skuOwner = await prisma.product.findUnique({
      where: { sku: parsed.sku.toUpperCase() },
      select: { id: true },
    });
    if (skuOwner && skuOwner.id !== id) {
      return { success: false, error: `SKU ${parsed.sku.toUpperCase()} is already in use.` };
    }

    const product = await prisma.product.update({
      where: { id },
      data: toData(parsed),
    });

    await logActivity({
      action: "product.updated",
      entityType: "Product",
      entityId: product.id,
      summary: `${user.name} updated product ${product.sku}`,
      userId: user.id,
    });

    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    return { success: true, data: { id: product.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update the product.",
    };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("product.manage");

    const usage = await prisma.product.findUnique({
      where: { id },
      select: {
        sku: true,
        _count: { select: { quoteItems: true, salesOrderItems: true } },
      },
    });
    if (!usage) return { success: false, error: "Product not found." };
    if (usage._count.quoteItems > 0 || usage._count.salesOrderItems > 0) {
      return {
        success: false,
        error:
          "This product appears on quotes or orders. Set its status to Discontinued instead of deleting it.",
      };
    }

    await prisma.product.delete({ where: { id } });

    await logActivity({
      action: "product.deleted",
      entityType: "Product",
      entityId: id,
      summary: `${user.name} deleted product ${usage.sku}`,
      userId: user.id,
    });

    revalidatePath("/products");
    revalidatePath("/inventory");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete the product.",
    };
  }
}
