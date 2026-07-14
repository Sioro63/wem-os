"use client";

import { QuoteStatus } from "@prisma/client";

import { DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { quoteColumns } from "@/features/quotations/components/quote-columns";
import type { QuoteListItem } from "@/features/quotations/types";
import { QUOTE_STATUS_LABELS } from "@/features/quotations/utils/status";
import type { Paginated } from "@/types";

export function QuoteList({ result }: { result: Paginated<QuoteListItem> }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search quote number or customer…" />
        <FilterSelect
          paramName="status"
          placeholder="Status"
          options={Object.values(QuoteStatus).map((status) => ({
            label: QUOTE_STATUS_LABELS[status],
            value: status,
          }))}
        />
      </div>
      <DataTable
        columns={quoteColumns}
        data={result.items}
        rowHref={(row) => `/quotations/${row.id}`}
        emptyTitle="No quotations found"
        emptyDescription="Draft a quote to get started."
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
