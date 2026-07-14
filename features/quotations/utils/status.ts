import type { QuoteStatus } from "@prisma/client";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
};

export const QUOTE_STATUS_VARIANTS: Record<
  QuoteStatus,
  "secondary" | "water" | "success" | "destructive"
> = {
  DRAFT: "secondary",
  SENT: "water",
  ACCEPTED: "success",
  DECLINED: "destructive",
};
