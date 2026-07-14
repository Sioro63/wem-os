# Folder Structure

```
wem-os/
├── app/                        # Routes only — thin composition layer
│   ├── (auth)/                 # Public: login, register
│   ├── (dashboard)/            # Protected: one folder per module
│   │   ├── layout.tsx          # Sidebar + topbar shell, requireUser()
│   │   ├── dashboard/
│   │   ├── products/           # page, new/, [id]/ (edit)
│   │   ├── inventory/
│   │   ├── customers/          # page, new/, [id]/
│   │   ├── quotations/         # page, new/, [id]/ (detail), [id]/edit/
│   │   ├── sales-orders/       # page, new/, [id]/ (detail)
│   │   └── missing-products/   # page, new/
│   ├── api/auth/[...all]/      # Better Auth handler
│   ├── layout.tsx              # Fonts, theme, providers, toaster
│   └── page.tsx                # Redirect → /dashboard
│
├── features/                   # All business logic, one folder per domain
│   └── <feature>/
│       ├── actions/            #   *-queries.ts (reads) + *-actions.ts (writes)
│       ├── components/         #   feature-specific UI
│       ├── schemas/            #   Zod validation
│       ├── types/              #   view-model types (Decimal already → number)
│       ├── utils/              #   status labels/variants, domain math
│       └── hooks/              #   feature-specific hooks (where needed)
│
├── components/
│   ├── ui/                     # shadcn/ui primitives (button, card, table…)
│   ├── shared/                 # DataTable, Pagination, SearchInput,
│   │                           # FilterSelect, PageHeader, StatCard,
│   │                           # ConfirmDialog, EmptyState, ImageUrlField…
│   ├── layout/                 # Sidebar, Topbar, Logo, nav-items, UserMenu
│   └── providers/              # Theme + React Query providers
│
├── lib/                        # Cross-cutting singletons & config
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts / auth-client.ts# Better Auth server + browser client
│   ├── session.ts              # getSession / requireUser / requirePermission
│   ├── permissions.ts          # Roles → permissions map
│   ├── constants.ts            # CURRENCY, TAX_RATE, PAGE_SIZE
│   └── utils.ts                # cn()
│
├── services/                   # Small server-side helpers
│   ├── activity-log.ts         # logActivity() — never throws
│   ├── document-numbers.ts     # Q-YYYY-#### / SO-YYYY-####
│   └── pagination.ts           # getPagination / getPageCount
│
├── prisma/
│   ├── schema.prisma           # Full schema + V2 extension notes
│   └── seed.ts                 # Deterministic demo data
│
├── styles/globals.css          # Design tokens (light + dark)
├── types/index.ts              # ActionResult, Paginated, SearchParams
├── utils/format.ts             # Currency/date/number formatters (₱, en-PH)
└── middleware.ts               # Optimistic session cookie check
```

## The rule that keeps it clean

**`app/` composes, `features/` implements.** A page file should only:
check permission → fetch via a query function → render feature components.
If you're writing business logic in `app/`, it belongs in `features/`.
