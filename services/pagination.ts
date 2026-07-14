import { PAGE_SIZE } from "@/lib/constants";

/** Parses `?page=` search params into Prisma skip/take. */
export function getPagination(pageParam?: string | string[], pageSize = PAGE_SIZE) {
  const raw = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const page = Math.max(1, Number.parseInt(raw ?? "1", 10) || 1);
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

export function getPageCount(total: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}
