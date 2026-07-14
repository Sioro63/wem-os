import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { getCustomer } from "@/features/customers/actions/customer-queries";
import { CustomerForm } from "@/features/customers/components/customer-form";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "Edit customer" };

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("customer.manage");
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.company}
        description={`Contact: ${customer.contactPerson}`}
      />
      <CustomerForm customer={customer} />
    </div>
  );
}
