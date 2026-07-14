"use client";

import { DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { getCustomerColumns } from "@/features/customers/components/customer-columns";
import type { CustomerListItem } from "@/features/customers/types";
import type { Paginated } from "@/types";

interface CustomerListProps {
  result: Paginated<CustomerListItem>;
  regions: string[];
  canManage: boolean;
}

export function CustomerList({ result, regions, canManage }: CustomerListProps) {
  const columns = getCustomerColumns(canManage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search company, contact or email…" />
        <FilterSelect
          paramName="region"
          placeholder="Region"
          options={regions.map((region) => ({ label: region, value: region }))}
        />
      </div>
      <DataTable
        columns={columns}
        data={result.items}
        rowHref={canManage ? (row) => `/customers/${row.id}` : undefined}
        emptyTitle="No customers found"
        emptyDescription="Try a different search, or add your first customer."
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
