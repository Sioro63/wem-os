import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getMissingProductRequests } from "@/features/missing-products/actions/missing-product-queries";
import { MissingProductList } from "@/features/missing-products/components/missing-product-list";
import { hasPermission } from "@/lib/permissions";
import { requirePagePermission } from "@/lib/session";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Missing products" };

export default async function MissingProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requirePagePermission("missing.view");
  const params = await searchParams;
  const result = await getMissingProductRequests(params);
  const canManage = hasPermission(user.role, "missing.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Missing products"
        description="What customers asked for that we don't carry — yet."
      >
        {canManage ? (
          <Button asChild>
            <Link href="/missing-products/new">
              <Plus />
              Log request
            </Link>
          </Button>
        ) : null}
      </PageHeader>
      <MissingProductList result={result} canManage={canManage} />
    </div>
  );
}
