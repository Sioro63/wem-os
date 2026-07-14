"use server";

import type { MissingProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import {
  missingProductFormSchema,
  missingProductStatusSchema,
  type MissingProductFormInput,
} from "@/features/missing-products/schemas/missing-product-schemas";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logActivity } from "@/services/activity-log";
import type { ActionResult } from "@/types";

export async function createMissingProductRequest(
  input: MissingProductFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("missing.manage");
    const parsed = missingProductFormSchema.parse(input);

    const request = await prisma.missingProductRequest.create({
      data: {
        customerId: parsed.customerId,
        description: parsed.description,
        quantity: parsed.quantity,
        imageUrl: parsed.imageUrl || null,
        notes: parsed.notes || null,
        requestedById: user.id,
      },
      include: { customer: { select: { company: true } } },
    });

    await logActivity({
      action: "missing.created",
      entityType: "MissingProductRequest",
      entityId: request.id,
      summary: `${user.name} logged a missing product request from ${request.customer.company}`,
      userId: user.id,
    });

    revalidatePath("/missing-products");
    return { success: true, data: { id: request.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not log the request.",
    };
  }
}

export async function updateMissingProductStatus(
  id: string,
  status: MissingProductStatus,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("missing.manage");
    const parsed = missingProductStatusSchema.parse({ id, status });

    const request = await prisma.missingProductRequest.update({
      where: { id: parsed.id },
      data: { status: parsed.status },
    });

    await logActivity({
      action: "missing.statusChanged",
      entityType: "MissingProductRequest",
      entityId: request.id,
      summary: `${user.name} moved a missing product request to ${parsed.status.toLowerCase()}`,
      userId: user.id,
    });

    revalidatePath("/missing-products");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update the request.",
    };
  }
}

export async function deleteMissingProductRequest(
  id: string,
): Promise<ActionResult> {
  try {
    const user = await requirePermission("missing.manage");

    await prisma.missingProductRequest.delete({ where: { id } });

    await logActivity({
      action: "missing.deleted",
      entityType: "MissingProductRequest",
      entityId: id,
      summary: `${user.name} deleted a missing product request`,
      userId: user.id,
    });

    revalidatePath("/missing-products");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete the request.",
    };
  }
}
