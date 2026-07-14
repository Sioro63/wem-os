import {
  Boxes,
  FileQuestion,
  FileText,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Permission } from "@/lib/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" },
  { label: "Products", href: "/products", icon: Package, permission: "product.view" },
  { label: "Inventory", href: "/inventory", icon: Boxes, permission: "inventory.view" },
  { label: "Customers", href: "/customers", icon: Users, permission: "customer.view" },
  { label: "Quotations", href: "/quotations", icon: FileText, permission: "quote.view" },
  { label: "Sales orders", href: "/sales-orders", icon: ShoppingCart, permission: "order.view" },
  { label: "Missing products", href: "/missing-products", icon: FileQuestion, permission: "missing.view" },
];
