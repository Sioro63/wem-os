<div align="center">

# WEM OS

**Water. Electric. More.**

The internal operating system for WEM — products, inventory, customers,
quotations, and sales orders in one place.

</div>

---

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# → set DATABASE_URL to your PostgreSQL connection string
# → set BETTER_AUTH_SECRET to a random 32+ char string

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. Seed demo data
npx prisma db seed

# 5. Run
npm run dev
```

Open http://localhost:3000 and sign in with one of the demo accounts.

## Demo accounts

Password for all accounts: **`wemos1234`**

| Email              | Role      | Can do |
| ------------------ | --------- | ------ |
| `owner@wem.ph`     | Owner     | Everything |
| `manager@wem.ph`   | Manager   | Everything except user management |
| `sales@wem.ph`     | Sales     | Customers, quotes, orders, missing products (view products/inventory) |
| `warehouse@wem.ph` | Warehouse | Adjust stock, move orders through fulfillment |

## What's inside

| Module | What it does |
| ------ | ------------ |
| **Dashboard** | KPIs, 6-month order chart, inventory health donut, live activity feed |
| **Products** | Full catalog with SKUs, dual pricing (SRP / dealer), categories, brands, suppliers |
| **Inventory** | Physical vs reserved vs available stock, traffic-light health, stock adjustments |
| **Customers** | Dealer and retail accounts with price levels that drive quote pricing |
| **Quotations** | Draft → Sent → Accepted/Declined. Accepting converts to a sales order and reserves stock |
| **Sales Orders** | Pending → Processing → Completed. Completing deducts stock |
| **Missing Products** | Log what customers asked for that you don't carry — a demand signal for purchasing |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui ·
Prisma + PostgreSQL · Better Auth · TanStack Table · React Hook Form + Zod ·
Recharts

## Documentation

| Doc | Contents |
| --- | -------- |
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Full setup walkthrough, prerequisites, troubleshooting |
| [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) | Every environment variable explained |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema tour, relations, migration workflow |
| [docs/SEEDING.md](docs/SEEDING.md) | What the seed creates and how to customize it |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Conventions, adding a feature, common tasks |
| [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) | Where everything lives and why |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploying to Vercel + hosted Postgres |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Design decisions, permission model, V2 extension seams |

## Roadmap (extension points already in place)

Purchase orders & receiving · shipments/delivery tracking · barcode scanning ·
technician/installation jobs · multi-warehouse transfers · supplier portal ·
accounting exports · online payments · mobile app · public API.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for where each one plugs in.
