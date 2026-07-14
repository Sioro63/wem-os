import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { getQuoteFormData } from "@/features/quotations/actions/quote-queries";
import { QuoteForm } from "@/features/quotations/components/quote-form";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "New quote" };

export default async function NewQuotePage() {
  await requirePagePermission("quote.manage");
  const formData = await getQuoteFormData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New quote"
        description="Prices follow the customer's price level — override any line as needed."
      />
      <QuoteForm formData={formData} />
    </div>
  );
}
