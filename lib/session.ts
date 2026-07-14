import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { UserRole } from "@prisma/client";

/** Returns the current session or null. Server-side only. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Returns the current user (typed role) or redirects to /login. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/login");
  return { ...session.user, role: session.user.role as UserRole };
}

/**
 * For **pages**: returns the user if they hold the permission, otherwise
 * redirects (to /login when signed out, /dashboard when unauthorized).
 */
export async function requirePagePermission(permission: Permission) {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = session.user.role as UserRole;
  if (!hasPermission(role, permission)) redirect("/dashboard");
  return { ...session.user, role };
}

/**
 * For **server actions**: returns the user if they hold the permission,
 * otherwise throws (caught by the action's try/catch into an ActionResult).
 */
export async function requirePermission(permission: Permission) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated.");
  const role = session.user.role as UserRole;
  if (!hasPermission(role, permission)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return { ...session.user, role };
}
