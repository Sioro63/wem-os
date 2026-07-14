"use client";

import { DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { getInventoryColumns } from "@/features/inventory/components/inventory-columns";
import type { InventoryListItem } from "@/features/inventory/types";
import type { Paginated } from "@/types";

interface InventoryListProps {
  result: Paginated<InventoryListItem>;
  warehouses: { label: string; value: string }[];
  canAdjust: boolean;
}

export function InventoryList({
  result,
  warehouses,
  canAdjust,
}: InventoryListProps) {
  const columns = getInventoryColumns(canAdjust);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search product or SKU…" />
        <div className="flex gap-2">
          <FilterSelect
            paramName="warehouse"
            placeholder="Warehouse"
            options={warehouses}
          />
          <FilterSelect
            paramName="stock"
            placeholder="Health"
            options={[
              { label: "Healthy", value: "healthy" },
              { label: "Low", value: "low" },
              { label: "Critical", value: "critical" },
            ]}
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={result.items}
        emptyTitle="No inventory rows"
        emptyDescription="Add products to start tracking stock."
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
