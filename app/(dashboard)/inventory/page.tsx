import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getInventory } from "@/features/inventory/actions/inventory-queries";
import { InventoryList } from "@/features/inventory/components/inventory-list";
import { hasPermission } from "@/lib/permissions";
import { requirePagePermission } from "@/lib/session";
import type { SearchParams } from "@/types";

export const metadata: Metadata = { title: "Inventory" };

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requirePagePermission("inventory.view");
  const params = await searchParams;
  const { result, summary, warehouses } = await getInventory(params);
  const canAdjust = hasPermission(user.role, "inventory.adjust");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Physical, reserved and available stock across warehouses."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Healthy"
          value={summary.healthy}
          icon={CheckCircle2}
        />
        <StatCard
          label="Low stock"
          value={summary.low}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Critical"
          value={summary.critical}
          icon={CircleAlert}
          tone="destructive"
        />
      </div>
      <InventoryList
        result={result}
        warehouses={warehouses}
        canAdjust={canAdjust}
      />
    </div>
  );
}
