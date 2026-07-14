import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import {
  getQuote,
  getQuoteFormData,
} from "@/features/quotations/actions/quote-queries";
import { QuoteForm } from "@/features/quotations/components/quote-form";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "Edit quote" };

export default async function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission("quote.manage");
  const { id } = await params;
  const [quote, formData] = await Promise.all([
    getQuote(id),
    getQuoteFormData(),
  ]);
  if (!quote) notFound();
  if (quote.status !== "DRAFT") redirect(`/quotations/${id}`);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${quote.quoteNumber}`}
        description="Only drafts can be edited."
      />
      <QuoteForm formData={formData} quote={quote} />
    </div>
  );
}
