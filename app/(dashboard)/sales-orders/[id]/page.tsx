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
import { getSalesOrder } from "@/features/sales-orders/actions/order-queries";
import { OrderStatusActions } from "@/features/sales-orders/components/order-status-actions";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_VARIANTS,
} from "@/features/sales-orders/utils/status";
import { hasPermission } from "@/lib/permissions";
import { requirePagePermission } from "@/lib/session";
import { formatCurrency, formatDate } from "@/utils/format";

export const metadata: Metadata = { title: "Sales order" };

export default async function SalesOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePagePermission("order.view");
  const { id } = await params;
  const order = await getSalesOrder(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={order.orderNumber}
        description={`${order.customerName} · created ${formatDate(order.createdAt)} by ${order.createdByName}`}
      >
        <OrderStatusActions
          order={order}
          canUpdate={hasPermission(user.role, "order.updateStatus")}
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
                {order.items.map((item) => (
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
                <Badge variant={ORDER_STATUS_VARIANTS[order.status]}>
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>
              {order.quoteId ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">From quote</span>
                  <Link
                    href={`/quotations/${order.quoteId}`}
                    className="inline-flex items-center gap-1 font-mono text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {order.quoteNumber}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : null}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums">
                  −{formatCurrency(order.discount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT (12%)</span>
                <span className="tabular-nums">
                  {formatCurrency(order.tax)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </CardContent>
          </Card>

          {order.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
