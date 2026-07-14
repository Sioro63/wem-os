import { Activity } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import type { ActivityFeedItem } from "@/features/dashboard/types";
import { formatDateTime } from "@/utils/format";

export function ActivityFeed({ items }: { items: ActivityFeedItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Actions across the workspace will show up here."
        icon={<Activity className="h-5 w-5" />}
      />
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <span
            aria-hidden
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-water"
          />
          <div className="min-w-0">
            <p className="text-sm leading-snug">{item.summary}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(item.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
