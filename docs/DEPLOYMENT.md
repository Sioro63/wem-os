# Deployment

The stack deploys anywhere Next.js runs. The path of least resistance is
**Vercel + a hosted Postgres** (Neon, Supabase, or Vercel Postgres).

## 1. Database

Create a Postgres database on your provider and copy the connection string.
For serverless deployments prefer the **pooled** connection string if the
provider offers one (Neon: "Pooled connection", Supabase: port 6543).

## 2. Vercel setup

1. Push the repo to GitHub and import it in Vercel.
2. Set environment variables (Project → Settings → Environment Variables):

   | Variable | Value |
   | -------- | ----- |
   | `DATABASE_URL` | your pooled Postgres connection string |
   | `BETTER_AUTH_SECRET` | `openssl rand -base64 32` output |
   | `BETTER_AUTH_URL` | `https://your-app.vercel.app` |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

3. Deploy. The default build command (`next build`) works as-is;
   `postinstall` runs `prisma generate` automatically.

## 3. Run migrations against production

Migrations are not run during the Vercel build. From your machine:

```bash
DATABASE_URL="<production-url>" npx prisma migrate deploy
```

Optionally seed (demo data only — it wipes existing rows!):

```bash
DATABASE_URL="<production-url>" npx prisma db seed
```

> Alternatively, change the build command to
> `prisma migrate deploy && next build` to migrate on every deploy.

## 4. Post-deploy checklist

- [ ] Sign in works (`BETTER_AUTH_URL` matches the real domain exactly)
- [ ] Create a real owner account, then remove/replace demo users
- [ ] Change all demo passwords if you keep the accounts
- [ ] Verify HTTPS-only cookies (automatic when the URL is https)

## Self-hosting (Docker/VPS)

```bash
npm ci
npx prisma migrate deploy
npm run build
npm run start   # serves on :3000
```

Put a reverse proxy (Caddy/nginx) in front for TLS, and set the two URL
variables to your public domain.
