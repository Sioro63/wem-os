"use client";

import { SalesOrderStatus } from "@prisma/client";

import { DataTable } from "@/components/shared/data-table";
import { FilterSelect } from "@/components/shared/filter-select";
import { Pagination } from "@/components/shared/pagination";
import { SearchInput } from "@/components/shared/search-input";
import { orderColumns } from "@/features/sales-orders/components/order-columns";
import type { OrderListItem } from "@/features/sales-orders/types";
import { ORDER_STATUS_LABELS } from "@/features/sales-orders/utils/status";
import type { Paginated } from "@/types";

export function OrderList({ result }: { result: Paginated<OrderListItem> }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search order number or customer…" />
        <FilterSelect
          paramName="status"
          placeholder="Status"
          options={Object.values(SalesOrderStatus).map((status) => ({
            label: ORDER_STATUS_LABELS[status],
            value: status,
          }))}
        />
      </div>
      <DataTable
        columns={orderColumns}
        data={result.items}
        rowHref={(row) => `/sales-orders/${row.id}`}
        emptyTitle="No sales orders found"
        emptyDescription="Orders appear here when quotes are accepted or entered manually."
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
