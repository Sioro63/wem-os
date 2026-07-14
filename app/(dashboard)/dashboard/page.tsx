import { AlertTriangle, FileText, Package, ShoppingCart, Users } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDashboardData } from "@/features/dashboard/actions/dashboard-queries";
import { ActivityFeed } from "@/features/dashboard/components/activity-feed";
import { InventoryDonut } from "@/features/dashboard/components/inventory-donut";
import { OrdersChart } from "@/features/dashboard/components/orders-chart";
import { requirePagePermission } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  await requirePagePermission("dashboard.view");
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A live look at the whole operation."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Active products"
          value={data.kpis.productCount}
          icon={Package}
        />
        <StatCard
          label="Customers"
          value={data.kpis.customerCount}
          icon={Users}
        />
        <StatCard
          label="Low / critical stock"
          value={data.kpis.lowStockCount}
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Pending quotes"
          value={data.kpis.pendingQuoteCount}
          icon={FileText}
          tone="water"
        />
        <StatCard
          label="Open orders"
          value={data.kpis.openOrderCount}
          icon={ShoppingCart}
          tone="electric"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales orders</CardTitle>
            <CardDescription>Order volume over the last six months.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrdersChart data={data.monthlyOrders} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Inventory health</CardTitle>
            <CardDescription>SKUs by stock status.</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryDonut data={data.inventoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>The latest actions across the workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed items={data.activity} />
        </CardContent>
      </Card>
    </div>
  );
}
