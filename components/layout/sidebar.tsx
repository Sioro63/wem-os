import type { UserRole } from "@prisma/client";

import { Logo } from "@/components/layout/logo";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { APP_TAGLINE } from "@/lib/constants";

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-background lg:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <SidebarNav role={role} />
      </div>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
      </div>
    </aside>
  );
}
