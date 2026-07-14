import type { UserRole } from "@prisma/client";

/**
 * Permission-based access control.
 *
 * Roles map to a flat set of permissions. UI renders (or hides) affordances
 * with `hasPermission`, and server actions enforce the same checks with
 * `requirePermission` — the UI check is convenience, the server check is law.
 */
export const PERMISSIONS = [
  "product.view",
  "product.manage",
  "inventory.view",
  "inventory.adjust",
  "customer.view",
  "customer.manage",
  "quote.view",
  "quote.manage",
  "quote.decide", // approve / reject
  "order.view",
  "order.manage",
  "order.updateStatus",
  "missing.view",
  "missing.manage",
  "user.manage",
  "dashboard.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  OWNER: ALL,
  MANAGER: ALL.filter((p) => p !== "user.manage"),
  SALES: [
    "dashboard.view",
    "product.view",
    "inventory.view",
    "customer.view",
    "customer.manage",
    "quote.view",
    "quote.manage",
    "order.view",
    "order.manage",
    "missing.view",
    "missing.manage",
  ],
  WAREHOUSE: [
    "dashboard.view",
    "product.view",
    "inventory.view",
    "inventory.adjust",
    "order.view",
    "order.updateStatus",
    "missing.view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  SALES: "Sales",
  WAREHOUSE: "Warehouse",
};
