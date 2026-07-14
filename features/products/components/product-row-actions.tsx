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
import { deleteProduct } from "@/features/products/actions/product-actions";
import type { ProductListItem } from "@/features/products/types";

export function ProductRowActions({ product }: { product: ProductListItem }) {
  const router = useRouter();

  const handleDelete = async () => {
    const result = await deleteProduct(product.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`${product.sku} deleted.`);
    router.refresh();
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${product.name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/products/${product.id}`)}
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
            title={`Delete ${product.sku}?`}
            description="This permanently removes the product and its inventory rows. Products used on quotes or orders can't be deleted — discontinue them instead."
            confirmLabel="Delete product"
            destructive
            onConfirm={handleDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
