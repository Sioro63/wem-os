import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getQuoteFormData } from "@/features/quotations/actions/quote-queries";
import { OrderForm } from "@/features/sales-orders/components/order-form";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "New sales order" };

export default async function NewSalesOrderPage() {
  await requirePagePermission("order.manage");
  const formData = await getQuoteFormData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New sales order"
        description="Manual entry for orders that skip the quote step."
      />
      <OrderForm formData={formData} />
    </div>
  );
}
