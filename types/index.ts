/**
 * Shared cross-feature types. Feature-specific types live in
 * `features/<feature>/types/`.
 */

/** Standard result shape returned by every server action. */
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/** Common shape for paginated server queries. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;
