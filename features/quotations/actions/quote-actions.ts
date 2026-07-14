"use server";

import { revalidatePath } from "next/cache";

import {
  quoteFormSchema,
  type QuoteFormInput,
} from "@/features/quotations/schemas/quote-schemas";
import { computeTotals } from "@/features/quotations/utils/totals";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logActivity } from "@/services/activity-log";
import {
  nextQuoteNumber,
  nextSalesOrderNumber,
} from "@/services/document-numbers";
import type { ActionResult } from "@/types";

function buildItems(parsed: QuoteFormInput) {
  return parsed.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
  }));
}

export async function createQuote(
  input: QuoteFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("quote.manage");
    const parsed = quoteFormSchema.parse(input);
    const totals = computeTotals(parsed);
    const quoteNumber = await nextQuoteNumber();

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerId: parsed.customerId,
        createdById: user.id,
        validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
        notes: parsed.notes || null,
        ...totals,
        items: { create: buildItems(parsed) },
      },
    });

    await logActivity({
      action: "quote.created",
      entityType: "Quote",
      entityId: quote.id,
      summary: `${user.name} drafted quote ${quote.quoteNumber}`,
      userId: user.id,
    });

    revalidatePath("/quotations");
    return { success: true, data: { id: quote.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create the quote.",
    };
  }
}

export async function updateQuote(
  id: string,
  input: QuoteFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("quote.manage");
    const parsed = quoteFormSchema.parse(input);

    const existing = await prisma.quote.findUnique({
      where: { id },
      select: { status: true, quoteNumber: true },
    });
    if (!existing) return { success: false, error: "Quote not found." };
    if (existing.status !== "DRAFT") {
      return { success: false, error: "Only draft quotes can be edited." };
    }

    const totals = computeTotals(parsed);

    await prisma.$transaction([
      prisma.quoteItem.deleteMany({ where: { quoteId: id } }),
      prisma.quote.update({
        where: { id },
        data: {
          customerId: parsed.customerId,
          validUntil: parsed.validUntil ? new Date(parsed.validUntil) : null,
          notes: parsed.notes || null,
          ...totals,
          items: { create: buildItems(parsed) },
        },
      }),
    ]);

    await logActivity({
      action: "quote.updated",
      entityType: "Quote",
      entityId: id,
      summary: `${user.name} updated quote ${existing.quoteNumber}`,
      userId: user.id,
    });

    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update the quote.",
    };
  }
}

export async function sendQuote(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("quote.manage");
    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { status: true, quoteNumber: true },
    });
    if (!quote) return { success: false, error: "Quote not found." };
    if (quote.status !== "DRAFT") {
      return { success: false, error: "Only draft quotes can be sent." };
    }

    await prisma.quote.update({ where: { id }, data: { status: "SENT" } });

    await logActivity({
      action: "quote.sent",
      entityType: "Quote",
      entityId: id,
      summary: `${user.name} marked quote ${quote.quoteNumber} as sent`,
      userId: user.id,
    });

    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not send the quote.",
    };
  }
}

/**
 * Accepting a quote converts it into a sales order and reserves stock for
 * every line item in the default warehouse — all inside one transaction.
 */
export async function acceptQuote(
  id: string,
): Promise<ActionResult<{ salesOrderId: string }>> {
  try {
    const user = await requirePermission("quote.decide");

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true, customer: { select: { company: true } } },
    });
    if (!quote) return { success: false, error: "Quote not found." };
    if (quote.status !== "SENT") {
      return { success: false, error: "Only sent quotes can be accepted." };
    }

    const defaultWarehouse = await prisma.warehouse.findFirst({
      where: { isDefault: true },
    });
    if (!defaultWarehouse) {
      return { success: false, error: "No default warehouse is configured." };
    }

    const orderNumber = await nextSalesOrderNumber();

    const salesOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId: quote.customerId,
          createdById: user.id,
          quoteId: quote.id,
          notes: quote.notes,
          subtotal: quote.subtotal,
          discount: quote.discount,
          tax: quote.tax,
          total: quote.total,
          items: {
            create: quote.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        },
      });

      for (const item of quote.items) {
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

      await tx.quote.update({ where: { id }, data: { status: "ACCEPTED" } });
      return order;
    });

    await logActivity({
      action: "quote.accepted",
      entityType: "Quote",
      entityId: id,
      summary: `${user.name} accepted quote ${quote.quoteNumber} for ${quote.customer.company} → order ${orderNumber}`,
      userId: user.id,
    });

    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    revalidatePath("/sales-orders");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true, data: { salesOrderId: salesOrder.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not accept the quote.",
    };
  }
}

export async function declineQuote(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("quote.decide");
    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { status: true, quoteNumber: true },
    });
    if (!quote) return { success: false, error: "Quote not found." };
    if (quote.status !== "SENT") {
      return { success: false, error: "Only sent quotes can be declined." };
    }

    await prisma.quote.update({ where: { id }, data: { status: "DECLINED" } });

    await logActivity({
      action: "quote.declined",
      entityType: "Quote",
      entityId: id,
      summary: `${user.name} declined quote ${quote.quoteNumber}`,
      userId: user.id,
    });

    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not decline the quote.",
    };
  }
}

export async function deleteQuote(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("quote.manage");
    const quote = await prisma.quote.findUnique({
      where: { id },
      select: { status: true, quoteNumber: true },
    });
    if (!quote) return { success: false, error: "Quote not found." };
    if (quote.status !== "DRAFT") {
      return { success: false, error: "Only draft quotes can be deleted." };
    }

    await prisma.quote.delete({ where: { id } });

    await logActivity({
      action: "quote.deleted",
      entityType: "Quote",
      entityId: id,
      summary: `${user.name} deleted draft quote ${quote.quoteNumber}`,
      userId: user.id,
    });

    revalidatePath("/quotations");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete the quote.",
    };
  }
}
