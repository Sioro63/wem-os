"use client";

import { MissingProductStatus } from "@prisma/client";

import { DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { getMissingProductColumns } from "@/features/missing-products/components/missing-product-columns";
import type { MissingProductListItem } from "@/features/missing-products/types";
import { MISSING_STATUS_LABELS } from "@/features/missing-products/utils/status";
import type { Paginated } from "@/types";

interface MissingProductListProps {
  result: Paginated<MissingProductListItem>;
  canManage: boolean;
}

export function MissingProductList({
  result,
  canManage,
}: MissingProductListProps) {
  const columns = getMissingProductColumns(canManage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search description or customer…" />
        <FilterSelect
          paramName="status"
          placeholder="Status"
          options={Object.values(MissingProductStatus).map((status) => ({
            label: MISSING_STATUS_LABELS[status],
            value: status,
          }))}
        />
      </div>
      <DataTable
        columns={columns}
        data={result.items}
        emptyTitle="No missing product requests"
        emptyDescription="When a customer asks for something you don't carry, log it here."
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
