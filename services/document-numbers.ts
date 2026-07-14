import "server-only";

import { prisma } from "@/lib/prisma";

/**
 * Generates sequential, human-readable document numbers such as
 * Q-2026-0042 or SO-2026-0007, scoped per year.
 */
async function nextNumber(prefix: "Q" | "SO", count: number) {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(count + 1).padStart(4, "0")}`;
}

export async function nextQuoteNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: { quoteNumber: { startsWith: `Q-${year}-` } },
  });
  return nextNumber("Q", count);
}

export async function nextSalesOrderNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.salesOrder.count({
    where: { orderNumber: { startsWith: `SO-${year}-` } },
  });
  return nextNumber("SO", count);
}
