import "server-only";

import type { MissingProductStatus, Prisma } from "@prisma/client";

import type { MissingProductListItem } from "@/features/missing-products/types";
import { prisma } from "@/lib/prisma";
import { getPageCount, getPagination } from "@/services/pagination";
import type { Paginated, SearchParams } from "@/types";

function param(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function getMissingProductRequests(
  searchParams: SearchParams,
): Promise<Paginated<MissingProductListItem>> {
  const q = param(searchParams, "q")?.trim();
  const status = param(searchParams, "status") as
    | MissingProductStatus
    | undefined;
  const { page, pageSize, skip, take } = getPagination(searchParams.page);

  const where: Prisma.MissingProductRequestWhereInput = {
    ...(q
      ? {
          OR: [
            { description: { contains: q, mode: "insensitive" } },
            { customer: { company: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(status ? { status } : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.missingProductRequest.findMany({
      where,
      include: {
        customer: { select: { company: true } },
        requestedBy: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.missingProductRequest.count({ where }),
  ]);

  return {
    items: rows.map((request) => ({
      id: request.id,
      description: request.description,
      quantity: request.quantity,
      imageUrl: request.imageUrl,
      status: request.status,
      customerId: request.customerId,
      customerName: request.customer.company,
      requestedByName: request.requestedBy.name,
      createdAt: request.createdAt.toISOString(),
      notes: request.notes,
    })),
    total,
    page,
    pageSize,
    pageCount: getPageCount(total, pageSize),
  };
}
