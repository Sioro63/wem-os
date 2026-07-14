"use client";

import type { UserRole } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "@/components/layout/nav-items";
import { hasPermission } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  role: UserRole;
  onNavigate?: () => void;
}

/**
 * Client component: filters NAV_ITEMS by role locally. Only the role string
 * crosses the server→client boundary — icon components (functions) can't be
 * serialized as props from a server component.
 */
export function SidebarNav({ role, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) =>
    hasPermission(role, item.permission),
  );

  return (
    <nav aria-label="Main navigation" className="flex flex-col gap-0.5">
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
