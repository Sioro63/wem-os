"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteCustomer } from "@/features/customers/actions/customer-actions";
import type { CustomerListItem } from "@/features/customers/types";

export function CustomerRowActions({ customer }: { customer: CustomerListItem }) {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await deleteCustomer(customer.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`${customer.company} deleted.`);
    router.refresh();
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${customer.company}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/customers/${customer.id}`)}
          >
            <Pencil />
            Edit
          </DropdownMenuItem>
          <ConfirmDialog
            trigger={
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            }
            title={`Delete ${customer.company}?`}
            description="Customers with quotes, orders or requests on file can't be deleted."
            confirmLabel="Delete customer"
            destructive
            onConfirm={handleDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
