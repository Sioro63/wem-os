import "server-only";

import type { Prisma } from "@prisma/client";

import type {
  CustomerDetail,
  CustomerListItem,
} from "@/features/customers/types";
import { prisma } from "@/lib/prisma";
import { getPageCount, getPagination } from "@/services/pagination";
import type { Paginated, SearchParams } from "@/types";

function param(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function getCustomers(
  searchParams: SearchParams,
): Promise<{ result: Paginated<CustomerListItem>; regions: string[] }> {
  const q = param(searchParams, "q")?.trim();
  const region = param(searchParams, "region");
  const { page, pageSize, skip, take } = getPagination(searchParams.page);

  const where: Prisma.CustomerWhereInput = {
    ...(q
      ? {
          OR: [
            { company: { contains: q, mode: "insensitive" } },
            { contactPerson: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(region ? { region } : {}),
  };

  const [rows, total, regionRows] = await prisma.$transaction([
    prisma.customer.findMany({
      where,
      include: { _count: { select: { quotes: true, salesOrders: true } } },
      orderBy: { company: "asc" },
      skip,
      take,
    }),
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      distinct: ["region"],
      select: { region: true },
      orderBy: { region: "asc" },
    }),
  ]);

  return {
    result: {
      items: rows.map((customer) => ({
        id: customer.id,
        company: customer.company,
        contactPerson: customer.contactPerson,
        email: customer.email,
        phone: customer.phone,
        region: customer.region,
        priceLevel: customer.priceLevel,
        quoteCount: customer._count.quotes,
        orderCount: customer._count.salesOrders,
      })),
      total,
      page,
      pageSize,
      pageCount: getPageCount(total, pageSize),
    },
    regions: regionRows.map((r) => r.region),
  };
}

export async function getCustomer(id: string): Promise<CustomerDetail | null> {
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) return null;
  return {
    id: customer.id,
    company: customer.company,
    contactPerson: customer.contactPerson,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    region: customer.region,
    priceLevel: customer.priceLevel,
    notes: customer.notes,
  };
}

export async function getCustomerOptions() {
  const customers = await prisma.customer.findMany({
    orderBy: { company: "asc" },
    select: { id: true, company: true, priceLevel: true },
  });
  return customers.map((c) => ({
    value: c.id,
    label: c.company,
    priceLevel: c.priceLevel,
  }));
}
