import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQuote } from "@/features/quotations/actions/quote-queries";
import { QuoteDetailActions } from "@/features/quotations/components/quote-detail-actions";
import {
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_VARIANTS,
} from "@/features/quotations/utils/status";
import { hasPermission } from "@/lib/permissions";
import { requirePagePermission } from "@/lib/session";
import { formatCurrency, formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Quote" };

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePagePermission("quote.view");
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={quote.quoteNumber}
        description={`${quote.customerName} · created ${formatDate(quote.createdAt)} by ${quote.createdByName}`}
      >
        <QuoteDetailActions
          quote={quote}
          canManage={hasPermission(user.role, "quote.manage")}
          canDecide={hasPermission(user.role, "quote.decide")}
        />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit price</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.productName}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {item.productSku}
                      </p>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={QUOTE_STATUS_VARIANTS[quote.status]}>
                  {QUOTE_STATUS_LABELS[quote.status]}
                </Badge>
              </div>
              {quote.validUntil ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valid until</span>
                  <span>{formatDate(quote.validUntil)}</span>
                </div>
              ) : null}
              {quote.salesOrderId ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sales order</span>
                  <Link
                    href={`/sales-orders/${quote.salesOrderId}`}
                    className="inline-flex items-center gap-1 font-mono text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {quote.salesOrderNumber}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : null}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(quote.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums">
                  −{formatCurrency(quote.discount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (12%)</span>
                <span className="tabular-nums">
                  {formatCurrency(quote.tax)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(quote.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {quote.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {quote.notes}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
