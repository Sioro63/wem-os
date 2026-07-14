import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getCustomerOptions } from "@/features/customers/actions/customer-queries";
import { MissingProductForm } from "@/features/missing-products/components/missing-product-form";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "Log missing product" };

export default async function NewMissingProductPage() {
  await requirePagePermission("missing.manage");
  const customers = await getCustomerOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Log missing product"
        description="Capture demand for products not in the catalog."
      />
      <MissingProductForm
        customers={customers.map((c) => ({ value: c.value, label: c.label }))}
      />
    </div>
  );
}
