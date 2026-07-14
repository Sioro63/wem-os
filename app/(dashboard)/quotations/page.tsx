import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getQuotes } from "@/features/quotations/actions/quote-queries";
import { QuoteList } from "@/features/quotations/components/quote-list";
import { hasPermission } from "@/lib/permissions";
import { requirePagePermission } from "@/lib/session";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Quotations" };

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requirePagePermission("quote.view");
  const params = await searchParams;
  const result = await getQuotes(params);
  const canManage = hasPermission(user.role, "quote.manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="Draft, send and convert quotes into sales orders."
      >
        {canManage ? (
          <Button asChild>
            <Link href="/quotations/new">
              <Plus />
              New quote
            </Link>
          </Button>
        ) : null}
      </PageHeader>
      <QuoteList result={result} />
    </div>
  );
}
