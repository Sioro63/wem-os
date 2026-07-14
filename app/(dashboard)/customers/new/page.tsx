import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "New customer" };

export default async function NewCustomerPage() {
  await requirePagePermission("customer.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="New customer"
        description="Add a dealer or retail account."
      />
      <CustomerForm />
    </div>
  );
}
