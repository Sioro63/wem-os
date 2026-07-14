import Link from "next/link";

import { APP_TAGLINE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * WEM wordmark. The three letters carry the brand: W = water (blue),
 * E = electric (amber), M = more (ink).
 */
export function Logo({ withTagline = false, className }: { withTagline?: boolean; className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn("flex items-baseline gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm", className)}
      aria-label="WEM OS home"
    >
      <span className="text-lg font-bold tracking-tight">
        <span className="text-water">W</span>
        <span className="text-electric">E</span>
        <span>M</span>
        <span className="ml-1.5 text-sm font-medium text-muted-foreground">OS</span>
      </span>
      {withTagline ? (
        <span className="hidden text-xs text-muted-foreground md:inline">
          {APP_TAGLINE}
        </span>
      ) : null}
    </Link>
  );
}
