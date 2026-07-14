"use server";

import { revalidatePath } from "next/cache";

import {
  customerFormSchema,
  type CustomerFormInput,
} from "@/features/customers/schemas/customer-schemas";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/session";
import { logActivity } from "@/services/activity-log";
import type { ActionResult } from "@/types";

function toData(input: CustomerFormInput) {
  return {
    company: input.company,
    contactPerson: input.contactPerson,
    email: input.email.toLowerCase(),
    phone: input.phone,
    address: input.address,
    region: input.region,
    priceLevel: input.priceLevel,
    notes: input.notes || null,
  };
}

export async function createCustomer(
  input: CustomerFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("customer.manage");
    const parsed = customerFormSchema.parse(input);

    const existing = await prisma.customer.findUnique({
      where: { email: parsed.email.toLowerCase() },
      select: { id: true },
    });
    if (existing) {
      return { success: false, error: "A customer with this email already exists." };
    }

    const customer = await prisma.customer.create({ data: toData(parsed) });

    await logActivity({
      action: "customer.created",
      entityType: "Customer",
      entityId: customer.id,
      summary: `${user.name} added customer ${customer.company}`,
      userId: user.id,
    });

    revalidatePath("/customers");
    return { success: true, data: { id: customer.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create the customer.",
    };
  }
}

export async function updateCustomer(
  id: string,
  input: CustomerFormInput,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requirePermission("customer.manage");
    const parsed = customerFormSchema.parse(input);

    const emailOwner = await prisma.customer.findUnique({
      where: { email: parsed.email.toLowerCase() },
      select: { id: true },
    });
    if (emailOwner && emailOwner.id !== id) {
      return { success: false, error: "A customer with this email already exists." };
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: toData(parsed),
    });

    await logActivity({
      action: "customer.updated",
      entityType: "Customer",
      entityId: customer.id,
      summary: `${user.name} updated customer ${customer.company}`,
      userId: user.id,
    });

    revalidatePath("/customers");
    revalidatePath(`/customers/${id}`);
    return { success: true, data: { id: customer.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update the customer.",
    };
  }
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  try {
    const user = await requirePermission("customer.manage");

    const usage = await prisma.customer.findUnique({
      where: { id },
      select: {
        company: true,
        _count: {
          select: {
            quotes: true,
            salesOrders: true,
            missingProductRequests: true,
          },
        },
      },
    });
    if (!usage) return { success: false, error: "Customer not found." };
    if (
      usage._count.quotes > 0 ||
      usage._count.salesOrders > 0 ||
      usage._count.missingProductRequests > 0
    ) {
      return {
        success: false,
        error:
          "This customer has quotes, orders or requests on file and can't be deleted.",
      };
    }

    await prisma.customer.delete({ where: { id } });

    await logActivity({
      action: "customer.deleted",
      entityType: "Customer",
      entityId: id,
      summary: `${user.name} deleted customer ${usage.company}`,
      userId: user.id,
    });

    revalidatePath("/customers");
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not delete the customer.",
    };
  }
}
