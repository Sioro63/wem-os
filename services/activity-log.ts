import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type LogInput = {
  action: string;
  entityType: string;
  entityId?: string;
  summary: string;
  userId?: string;
  metadata?: Prisma.InputJsonValue;
};

/**
 * Append-only audit trail. Logging must never break the primary operation,
 * so failures are swallowed and reported to the server console only.
 */
export async function logActivity(input: LogInput) {
  try {
    await prisma.activityLog.create({ data: input });
  } catch (error) {
    console.error("[activity-log] failed to write entry", error);
  }
}
