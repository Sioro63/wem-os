"use client";

import { ProductStatus } from "@prisma/client";

import { DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { getProductColumns } from "@/features/products/components/product-columns";
import type { ProductListItem, SelectOption } from "@/features/products/types";
import { PRODUCT_STATUS_LABELS } from "@/features/products/utils/status";
import type { Paginated } from "@/types";

interface ProductListProps {
  result: Paginated<ProductListItem>;
  categories: SelectOption[];
  canManage: boolean;
}

export function ProductList({ result, categories, canManage }: ProductListProps) {
  const columns = getProductColumns(canManage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search name, SKU or brand…" />
        <div className="flex gap-2">
          <FilterSelect
            paramName="category"
            placeholder="Category"
            options={categories}
          />
          <FilterSelect
            paramName="status"
            placeholder="Status"
            options={Object.values(ProductStatus).map((status) => ({
              label: PRODUCT_STATUS_LABELS[status],
              value: status,
            }))}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={result.items}
        rowHref={canManage ? (row) => `/products/${row.id}` : undefined}
        emptyTitle="No products found"
        emptyDescription="Try a different search, or add your first product."
      />
      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        total={result.total}
        pageSize={result.pageSize}
      />
    </div>
  );
}
