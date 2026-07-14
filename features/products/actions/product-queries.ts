import "server-only";

import type { Prisma, ProductStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getPageCount, getPagination } from "@/services/pagination";
import type { Paginated, SearchParams } from "@/types";
import type {
  ProductDetail,
  ProductFormOptions,
  ProductListItem,
} from "@/features/products/types";

function param(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function getProducts(
  searchParams: SearchParams,
): Promise<Paginated<ProductListItem>> {
  const q = param(searchParams, "q")?.trim();
  const category = param(searchParams, "category");
  const status = param(searchParams, "status") as ProductStatus | undefined;
  const { page, pageSize, skip, take } = getPagination(searchParams.page);

  const where: Prisma.ProductWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(category ? { categoryId: category } : {}),
    ...(status ? { status } : {}),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        inventory: { select: { physicalStock: true, reservedStock: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: rows.map((product) => ({
      id: product.id,
      sku: product.sku,
      name: product.name,
      imageUrl: product.imageUrl,
      categoryName: product.category.name,
      brandName: product.brand?.name ?? null,
      cost: Number(product.cost),
      srp: Number(product.srp),
      dealerPrice: Number(product.dealerPrice),
      status: product.status,
      availableStock: product.inventory.reduce(
        (sum, row) => sum + (row.physicalStock - row.reservedStock),
        0,
      ),
    })),
    total,
    page,
    pageSize,
    pageCount: getPageCount(total, pageSize),
  };
}

export async function getProduct(id: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return null;
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    brandId: product.brandId,
    supplierId: product.supplierId,
    country: product.country,
    cost: Number(product.cost),
    srp: Number(product.srp),
    dealerPrice: Number(product.dealerPrice),
    imageUrl: product.imageUrl,
    status: product.status,
  };
}

export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const [categories, brands, suppliers] = await prisma.$transaction([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
  ]);

  return {
    categories: categories.map((c) => ({ label: c.name, value: c.id })),
    brands: brands.map((b) => ({ label: b.name, value: b.id })),
    suppliers: suppliers.map((s) => ({ label: s.name, value: s.id })),
  };
}
