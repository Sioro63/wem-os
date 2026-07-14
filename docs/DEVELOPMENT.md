# Development Guide

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Run the seed script |
| `npm run db:studio` | Prisma Studio GUI |

## Core patterns

### Server actions return `ActionResult<T>`

Every mutation returns a discriminated union instead of throwing:

```ts
type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };
```

Client components branch on `result.success` and surface `result.error`
through a toast. Nothing user-facing ever throws.

### Queries vs actions

Each feature splits its data layer:

- `actions/*-queries.ts` — read-only, imported by **server components**
  (marked `import "server-only"`). Convert Prisma `Decimal` → `number` here.
- `actions/*-actions.ts` — mutations, marked `"use server"`, always start by
  calling `requirePermission(...)`.

### Permission gating

`lib/permissions.ts` defines flat permission strings
(`"product.manage"`, `"order.updateStatus"`, …) and a role → permission map.

- **Pages** call `requirePermission("x.view")` — redirects to `/login` when
  signed out, `/dashboard` when unauthorized.
- **Actions** call `requirePermission("x.manage")` — throws, caught into an
  `ActionResult` error.
- **UI** hides buttons with `hasPermission(user.role, "...")` — cosmetic
  only; the server checks are the real boundary.

### Server-driven tables

List pages read `searchParams` (`q`, `page`, plus per-page filters like
`status`), pass them to the query function, and render `<DataTable>` +
`<Pagination>`. Search/filter components just update the URL — the server
does the rest.

### Money

12% VAT applied after discount, rounded to centavos. The math lives in
**one** function — `features/quotations/utils/totals.ts` — shared by the
quote form preview, order form preview, both server actions, and the seed.

## Adding a new feature module

1. `mkdir -p features/<name>/{components,actions,schemas,types,utils}`
2. Add models to `prisma/schema.prisma` → `npm run db:migrate`
3. Add permissions to `lib/permissions.ts` and grant them per role
4. Write `schemas/` (Zod), `actions/<name>-queries.ts`,
   `actions/<name>-actions.ts`
5. Build components (reuse `DataTable`, `PageHeader`, `SearchInput`,
   `FilterSelect`, `ConfirmDialog`)
6. Add routes under `app/(dashboard)/<name>/`
7. Add a nav item to `components/layout/nav-items.ts` with its `view`
   permission

## Code style

- TypeScript strict; no `any` unless unavoidable
- Named exports (default exports only where Next.js requires them)
- `@/` path alias everywhere
- Toasts: past-tense confirmations ("Product created."), verbatim server
  errors on failure
