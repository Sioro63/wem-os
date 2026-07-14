import "server-only";

import type { Prisma, QuoteStatus } from "@prisma/client";

import type {
  QuoteDetail,
  QuoteFormData,
  QuoteListItem,
} from "@/features/quotations/types";
import { prisma } from "@/lib/prisma";
import { getPageCount, getPagination } from "@/services/pagination";
import type { Paginated, SearchParams } from "@/types";

function param(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function getQuotes(
  searchParams: SearchParams,
): Promise<Paginated<QuoteListItem>> {
  const q = param(searchParams, "q")?.trim();
  const status = param(searchParams, "status") as QuoteStatus | undefined;
  const { page, pageSize, skip, take } = getPagination(searchParams.page);

  const where: Prisma.QuoteWhereInput = {
    ...(q
      ? {
          OR: [
            { quoteNumber: { contains: q, mode: "insensitive" } },
            { customer: { company: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.quote.findMany({
      where,
      include: {
        customer: { select: { company: true } },
        createdBy: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.quote.count({ where }),
  ]);

  return {
    items: rows.map((quote) => ({
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      customerName: quote.customer.company,
      status: quote.status,
      total: Number(quote.total),
      itemCount: quote._count.items,
      createdByName: quote.createdBy.name,
      createdAt: quote.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    pageCount: getPageCount(total, pageSize),
  };
}

export async function getQuote(id: string): Promise<QuoteDetail | null> {
  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      customer: { select: { company: true, email: true } },
      createdBy: { select: { name: true } },
      salesOrder: { select: { id: true, orderNumber: true } },
      items: {
        include: { product: { select: { name: true, sku: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!quote) return null;

  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    status: quote.status,
    customerId: quote.customerId,
    customerName: quote.customer.company,
    customerEmail: quote.customer.email,
    validUntil: quote.validUntil?.toISOString() ?? null,
    notes: quote.notes,
    subtotal: Number(quote.subtotal),
    discount: Number(quote.discount),
    tax: Number(quote.tax),
    total: Number(quote.total),
    createdByName: quote.createdBy.name,
    createdAt: quote.createdAt.toISOString(),
    salesOrderId: quote.salesOrder?.id ?? null,
    salesOrderNumber: quote.salesOrder?.orderNumber ?? null,
    items: quote.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSku: item.product.sku,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
  };
}

export async function getQuoteFormData(): Promise<QuoteFormData> {
  const [customers, products] = await prisma.$transaction([
    prisma.customer.findMany({
      orderBy: { company: "asc" },
      select: { id: true, company: true, priceLevel: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        srp: true,
        dealerPrice: true,
      },
    }),
  ]);

  return {
    customers: customers.map((c) => ({
      value: c.id,
      label: c.company,
      priceLevel: c.priceLevel,
    })),
    products: products.map((p) => ({
      value: p.id,
      label: p.name,
      sku: p.sku,
      srp: Number(p.srp),
      dealerPrice: Number(p.dealerPrice),
    })),
  };
}
