import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  getProductFormOptions,
  getProducts,
} from "@/features/products/actions/product-queries";
import { ProductList } from "@/features/products/components/product-list";
import { hasPermission } from "@/lib/permissions";
import { requirePagePermission } from "@/lib/session";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requirePagePermission("product.view");
  const params = await searchParams;
  const [result, options] = await Promise.all([
    getProducts(params),
    getProductFormOptions(),
  ]);
  const canManage = hasPermission(user.role, "product.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="The full catalog — water, electric, and more."
      >
        {canManage ? (
          <Button asChild>
            <Link href="/products/new">
              <Plus />
              New product
            </Link>
          </Button>
        ) : null}
      </PageHeader>
      <ProductList
        result={result}
        categories={options.categories}
        canManage={canManage}
      />
    </div>
  );
}
