"use client";

import { Check, Pencil, Send, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  acceptQuote,
  declineQuote,
  deleteQuote,
  sendQuote,
} from "@/features/quotations/actions/quote-actions";
import type { QuoteDetail } from "@/features/quotations/types";

interface QuoteDetailActionsProps {
  quote: QuoteDetail;
  canManage: boolean;
  canDecide: boolean;
}

export function QuoteDetailActions({
  quote,
  canManage,
  canDecide,
}: QuoteDetailActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (fn: () => Promise<void>) => startTransition(fn);

  if (quote.status === "DRAFT" && canManage) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => router.push(`/quotations/${quote.id}/edit`)}
        >
          <Pencil />
          Edit
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="text-destructive">
              <Trash2 />
              Delete
            </Button>
          }
          title={`Delete ${quote.quoteNumber}?`}
          description="This draft and its line items will be permanently removed."
          confirmLabel="Delete draft"
          destructive
          onConfirm={async () => {
            const result = await deleteQuote(quote.id);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success("Draft deleted.");
            router.push("/quotations");
            router.refresh();
          }}
        />
        <Button
          disabled={isPending}
          onClick={() =>
            run(async () => {
              const result = await sendQuote(quote.id);
              if (!result.success) {
                toast.error(result.error);
                return;
              }
              toast.success(`${quote.quoteNumber} marked as sent.`);
              router.refresh();
            })
          }
        >
          <Send />
          Mark as sent
        </Button>
      </div>
    );
  }

  if (quote.status === "SENT" && canDecide) {
    return (
      <div className="flex gap-2">
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="text-destructive" disabled={isPending}>
              <X />
              Decline
            </Button>
          }
          title={`Decline ${quote.quoteNumber}?`}
          description="The quote will be closed. This can't be undone."
          confirmLabel="Decline quote"
          destructive
          onConfirm={async () => {
            const result = await declineQuote(quote.id);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success("Quote declined.");
            router.refresh();
          }}
        />
        <ConfirmDialog
          trigger={
            <Button disabled={isPending}>
              <Check />
              Accept &amp; create order
            </Button>
          }
          title={`Accept ${quote.quoteNumber}?`}
          description="A sales order will be created and stock reserved for every line item."
          confirmLabel="Accept quote"
          onConfirm={async () => {
            const result = await acceptQuote(quote.id);
            if (!result.success) {
              toast.error(result.error);
              return;
            }
            toast.success("Quote accepted — sales order created.");
            router.push(`/sales-orders/${result.data.salesOrderId}`);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return null;
}
