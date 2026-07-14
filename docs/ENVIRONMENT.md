# Environment Variables

All variables live in `.env` at the repo root. `.env.example` is the template.

## Required

### `DATABASE_URL`

PostgreSQL connection string used by Prisma.

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

- Local Docker: `postgresql://postgres:postgres@localhost:5432/wem_os`
- Neon/Supabase: copy from the provider dashboard; keep `?sslmode=require`
  if the provider includes it.

### `BETTER_AUTH_SECRET`

Secret used by Better Auth to sign session tokens. **Must be long and
random** — at least 32 characters.

```bash
openssl rand -base64 32
```

Changing this invalidates all existing sessions (users must sign in again).

### `BETTER_AUTH_URL`

The base URL the auth server runs on. Locally this is
`http://localhost:3000`. In production, your deployed URL, e.g.
`https://wem-os.vercel.app`.

## Optional

### `NEXT_PUBLIC_APP_URL`

The public base URL of the app, exposed to the browser. Used by the auth
client. Defaults work locally; set it in production to match
`BETTER_AUTH_URL`.

## Notes

- `.env` is gitignored. Never commit real credentials.
- On Vercel, set these in **Project → Settings → Environment Variables**.
- Prisma reads `DATABASE_URL` directly; Next.js reads the rest at boot.
