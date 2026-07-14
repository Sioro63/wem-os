import "server-only";

import type { Prisma, SalesOrderStatus } from "@prisma/client";

import type {
  OrderDetail,
  OrderListItem,
} from "@/features/sales-orders/types";
import { prisma } from "@/lib/prisma";
import { getPageCount, getPagination } from "@/services/pagination";
import type { Paginated, SearchParams } from "@/types";

function param(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function getSalesOrders(
  searchParams: SearchParams,
): Promise<Paginated<OrderListItem>> {
  const q = param(searchParams, "q")?.trim();
  const status = param(searchParams, "status") as SalesOrderStatus | undefined;
  const { page, pageSize, skip, take } = getPagination(searchParams.page);

  const where: Prisma.SalesOrderWhereInput = {
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { customer: { company: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.salesOrder.findMany({
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
    prisma.salesOrder.count({ where }),
  ]);

  return {
    items: rows.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customer.company,
      status: order.status,
      total: Number(order.total),
      itemCount: order._count.items,
      createdByName: order.createdBy.name,
      createdAt: order.createdAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    pageCount: getPageCount(total, pageSize),
  };
}

export async function getSalesOrder(id: string): Promise<OrderDetail | null> {
  const order = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      customer: { select: { company: true, email: true } },
      createdBy: { select: { name: true } },
      quote: { select: { id: true, quoteNumber: true } },
      items: {
        include: { product: { select: { name: true, sku: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customer.company,
    customerEmail: order.customer.email,
    notes: order.notes,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    tax: Number(order.tax),
    total: Number(order.total),
    createdByName: order.createdBy.name,
    createdAt: order.createdAt.toISOString(),
    quoteId: order.quote?.id ?? null,
    quoteNumber: order.quote?.quoteNumber ?? null,
    items: order.items.map((item) => ({
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
