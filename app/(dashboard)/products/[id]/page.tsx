import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import {
  getProduct,
  getProductFormOptions,
} from "@/features/products/actions/product-queries";
import { ProductForm } from "@/features/products/components/product-form";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("product.manage");
  const { id } = await params;
  const [product, options] = await Promise.all([
    getProduct(id),
    getProductFormOptions(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`SKU ${product.sku}`}
      />
      <ProductForm options={options} product={product} />
    </div>
  );
}
