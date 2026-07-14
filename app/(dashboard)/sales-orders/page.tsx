import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getSalesOrders } from "@/features/sales-orders/actions/order-queries";
import { OrderList } from "@/features/sales-orders/components/order-list";
import { hasPermission } from "@/lib/permissions";
import { requirePagePermission } from "@/lib/session";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Sales orders" };

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requirePagePermission("order.view");
  const params = await searchParams;
  const result = await getSalesOrders(params);
  const canManage = hasPermission(user.role, "order.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales orders"
        description="From reservation to fulfillment."
      >
        {canManage ? (
          <Button asChild>
            <Link href="/sales-orders/new">
              <Plus />
              New order
            </Link>
          </Button>
        ) : null}
      </PageHeader>
      <OrderList result={result} />
    </div>
  );
}
