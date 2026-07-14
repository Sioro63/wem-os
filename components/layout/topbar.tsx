import type { UserRole } from "@prisma/client";

import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { ROLE_LABELS } from "@/lib/permissions";

interface TopbarProps {
  user: { name: string; email: string; role: UserRole };
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
      <div className="flex items-center gap-2">
        <MobileNav role={user.role} />
        <div className="lg:hidden">
          <Logo />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <UserMenu
          name={user.name}
          email={user.email}
          roleLabel={ROLE_LABELS[user.role]}
        />
      </div>
    </header>
  );
}
