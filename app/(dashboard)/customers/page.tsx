import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getCustomers } from "@/features/customers/actions/customer-queries";
import { CustomerList } from "@/features/customers/components/customer-list";
import { hasPermission } from "@/lib/permissions";
import { requirePagePermission } from "@/lib/session";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requirePagePermission("customer.view");
  const params = await searchParams;
  const { result, regions } = await getCustomers(params);
  const canManage = hasPermission(user.role, "customer.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Dealers and retail accounts, with their price levels."
      >
        {canManage ? (
          <Button asChild>
            <Link href="/customers/new">
              <Plus />
              New customer
            </Link>
          </Button>
        ) : null}
      </PageHeader>
      <CustomerList result={result} regions={regions} canManage={canManage} />
    </div>
  );
}
