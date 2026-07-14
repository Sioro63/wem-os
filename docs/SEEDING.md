# Seeding

```bash
npx prisma db seed
```

The seed script (`prisma/seed.ts`) is **deterministic** — faker is seeded
with a fixed value, so every run produces identical data. It also **wipes all
tables first**, so never point it at production data.

## What gets created

| Entity | Count | Notes |
| ------ | ----- | ----- |
| Users | 4 | One per role, password `wemos1234` |
| Warehouses | 2 | "Main Warehouse" (default) + "Annex Warehouse" |
| Categories | 20 | Water (pumps, valves, tanks…), electric (wiring, breakers, lighting…), general |
| Brands | 10 | AquaFlow, Voltek, LumenPro… |
| Suppliers | 5 | With contact emails and phones |
| Products | 150 | `cost < dealerPrice < srp`, SKUs like `WTR-PMP-0001`, ~88% active |
| Inventory | 150 rows | Spread across healthy/low/critical bands |
| Customers | 30 | PH regions, ~45% dealer pricing |
| Quotes | 20 | Mixed statuses; accepted ones link to real orders |
| Sales orders | 40 | Mixed statuses across the last ~6 months (feeds the dashboard chart) |
| Missing requests | 15 | Realistic hardware asks |
| Activity log | ~75 entries | Backing the dashboard feed |

## Consistency guarantees

- Order/quote totals are computed with the **same VAT math** the app uses
  (12% after discount, rounded to centavos).
- Open orders (`PENDING`/`PROCESSING`) hold real stock reservations —
  `reservedStock` never exceeds `physicalStock`.
- Document numbers are sequential per year (`Q-2025-0001`, `SO-2025-0001`, …).

## Customizing

Open `prisma/seed.ts` and adjust the constants near each section:

- `PRODUCT_COUNT`, `CUSTOMER_COUNT`, `ORDER_COUNT`, `QUOTE_COUNT`,
  `MISSING_COUNT`
- `CATEGORY_SEEDS` — add categories with their SKU prefix and product nouns
- `faker.seed(1337)` — change or remove for different/random data

## Demo logins

| Email | Role |
| ----- | ---- |
| owner@wem.ph | OWNER |
| manager@wem.ph | MANAGER |
| sales@wem.ph | SALES |
| warehouse@wem.ph | WAREHOUSE |

Password for all: `wemos1234`
