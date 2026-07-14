# Installation

## Prerequisites

- **Node.js 20+** (`node -v`)
- **PostgreSQL 14+** — local install, Docker, or a hosted provider (Neon, Supabase, Railway)
- **npm 10+**

## Step-by-step

### 1. Install dependencies

```bash
npm install
```

This also runs `prisma generate` via the `postinstall` hook, so the Prisma
client is ready immediately.

### 2. Set up PostgreSQL

**Option A — Docker (fastest):**

```bash
docker run --name wem-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=wem_os \
  -p 5432:5432 -d postgres:16
```

Your connection string is then:
`postgresql://postgres:postgres@localhost:5432/wem_os`

**Option B — Local install:** create a database named `wem_os` with any user.

**Option C — Hosted:** create a project on Neon/Supabase/Railway and copy the
connection string.

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wem_os"
BETTER_AUTH_SECRET="generate-a-long-random-string-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate a secret with: `openssl rand -base64 32`

See [ENVIRONMENT.md](ENVIRONMENT.md) for details on each variable.

### 4. Create the schema

```bash
npx prisma migrate dev --name init
```

This creates all tables and generates the typed Prisma client.

### 5. Seed demo data

```bash
npx prisma db seed
```

Creates 4 demo users, ~150 products, 30 customers, 20 quotes, 40 orders and
more. See [SEEDING.md](SEEDING.md).

### 6. Run

```bash
npm run dev
```

Visit http://localhost:3000 → you'll be redirected to `/login`.
Sign in with `owner@wem.ph` / `wemos1234`.

## Troubleshooting

| Problem | Fix |
| ------- | --- |
| `P1001: Can't reach database server` | Postgres isn't running or `DATABASE_URL` is wrong |
| `Environment variable not found: DATABASE_URL` | You haven't created `.env` (step 3) |
| Sign-in fails after seeding | Make sure `BETTER_AUTH_SECRET` didn't change between seeding and running |
| Types out of sync after schema edits | Run `npx prisma generate` |
| Want a clean slate | `npx prisma migrate reset` (drops, re-migrates, re-seeds) |
