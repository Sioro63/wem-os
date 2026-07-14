import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getProductFormOptions } from "@/features/products/actions/product-queries";
import { ProductForm } from "@/features/products/components/product-form";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  await requirePagePermission("product.manage");
  const options = await getProductFormOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New product"
        description="Add a product to the catalog. An inventory row is created automatically."
      />
      <ProductForm options={options} />
    </div>
  );
}
