# Database

PostgreSQL via Prisma. The full schema lives in `prisma/schema.prisma`.

## Model tour

### Auth (managed by Better Auth)

- **User** — has a `role` (`OWNER | MANAGER | SALES | WAREHOUSE`) stored as
  an enum column, added through Better Auth's `additionalFields`.
- **Session / Account / Verification** — standard Better Auth tables.

### Catalog

- **Category / Brand / Supplier** — simple lookup tables.
- **Product** — SKU (unique), name, description, `cost`, `srp`,
  `dealerPrice` (all `Decimal(12,2)`), status
  (`ACTIVE | INACTIVE | DISCONTINUED`), optional image URL, relations to the
  three lookups.

### Stock

- **Warehouse** — one row has `isDefault = true`; all V1 stock movements use
  it.
- **Inventory** — unique per `(productId, warehouseId)`. Tracks
  `physicalStock`, `reservedStock`, `minimumStock`, `reorderPoint`.
  **Available stock is derived** (`physical − reserved`), never stored, so it
  can't drift.

### Sales

- **Customer** — unique email, `priceLevel` (`SRP | DEALER`) which drives
  default unit prices on quotes and orders.
- **Quote / QuoteItem** — document number `Q-YYYY-0001`, status
  `DRAFT → SENT → ACCEPTED | DECLINED`. Money fields: `subtotal`,
  `discount`, `tax` (12% VAT), `total`.
- **SalesOrder / SalesOrderItem** — document number `SO-YYYY-0001`, status
  `PENDING → PROCESSING → COMPLETED`. Optional one-to-one link back to the
  quote it came from (`quoteId` unique).
- **MissingProductRequest** — free-text demand capture with status
  `OPEN → SOURCING → FULFILLED | CLOSED`.

### Audit

- **ActivityLog** — append-only feed: `action`, `entityType`, `entityId`,
  human-readable `summary`, optional JSON `metadata`.

## Stock lifecycle

```
Quote accepted / order created  →  reservedStock += qty
Order completed                 →  physicalStock −= qty, reservedStock −= qty
```

Both movements run inside database transactions with the document status
change, so stock and documents can never disagree.

## Migration workflow

```bash
# after editing schema.prisma
npx prisma migrate dev --name describe_your_change

# regenerate client only (no migration)
npx prisma generate

# inspect data in a GUI
npx prisma studio

# nuke and re-seed
npx prisma migrate reset
```

## Conventions

- All money columns are `Decimal(12,2)`; the query layer converts to
  `number` before data reaches components.
- Document numbers are generated in `services/document-numbers.ts` by
  counting rows for the current year — fine for a single-team internal tool.
- Deletes are restricted: products on documents and customers with history
  can't be deleted (enforced in server actions).
