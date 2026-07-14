import type { PriceLevel } from "@prisma/client";

export const PRICE_LEVEL_LABELS: Record<PriceLevel, string> = {
  SRP: "SRP",
  DEALER: "Dealer",
};

export const PRICE_LEVEL_VARIANTS: Record<PriceLevel, "secondary" | "water"> = {
  SRP: "secondary",
  DEALER: "water",
};
