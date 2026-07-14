"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { InventoryBreakdown } from "@/features/dashboard/types";
import { formatNumber } from "@/utils/format";

const SEGMENTS = [
  { key: "healthy", label: "Healthy", color: "hsl(var(--success))" },
  { key: "low", label: "Low", color: "hsl(var(--warning))" },
  { key: "critical", label: "Critical", color: "hsl(var(--destructive))" },
] as const;

export function InventoryDonut({ data }: { data: InventoryBreakdown }) {
  const chartData = SEGMENTS.map((segment) => ({
    name: segment.label,
    value: data[segment.key],
    color: segment.color,
  }));
  const total = data.healthy + data.low + data.critical;

  return (
    <div className="flex items-center gap-6">
      <div
        className="relative h-40 w-40 shrink-0"
        role="img"
        aria-label="Inventory health breakdown"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={2}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--popover-foreground))",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums">
            {formatNumber(total)}
          </span>
          <span className="text-xs text-muted-foreground">SKUs</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {SEGMENTS.map((segment) => (
          <li key={segment.key} className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-muted-foreground">{segment.label}</span>
            <span className="ml-auto font-medium tabular-nums">
              {formatNumber(data[segment.key])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
