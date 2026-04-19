# Local Development

Minimal setup to run the full stack locally and start making changes. Commands are copy-pastable.

## Prerequisites

- **Bun** (latest) — `https://bun.sh`
- **Yarn** (classic) — required for the mobile app (Expo + Bun had issues historically; README flags this is temporary)
- **Docker** — for Postgres
- **Supabase CLI** — only needed for e2e (`bunx supabase` works from the repo, or install globally)

Optional:

- **Expo Go** app on a phone, or an iOS/Android simulator, if you want to run natively instead of web.

## One-time setup

From the repo root:

```bash
# Install dependencies
bun server:i
bun app:i

# Install the root dev deps (just the Supabase CLI wrapper)
bun i
```

Create env files:

### `server/.env`

```ini
DATABASE_URL=postgresql://ted:dnd_password@localhost:5432/dnd_companion
SUPABASE_URL=https://<your-project>.supabase.co
# PORT=4000   # optional
```

`DATABASE_URL` matches the credentials in `server/docker-compose.yml` (`ted` / `dnd_password` / `dnd_companion`). Change the compose file if you want different creds.

`SUPABASE_URL` should point at a Supabase project you control — the server uses it to fetch JWKS for JWT verification.

### `mobile-app/.env`

```ini
EXPO_PUBLIC_API_URL=http://localhost:4000/
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

`EXPO_PUBLIC_*` vars are baked into the Expo bundle at build time — restart the Metro server with `--clear` if you change them and see stale values.

## Day-to-day

Three terminals from the repo root:

```bash
# 1. Postgres
docker compose -f server/docker-compose.yml up

# 2. Seed (first time, or after db reset)
bun db:seed

# 3a. Server (restart as needed)
bun server:start        # bun --watch index.ts → http://localhost:4000

# 3b. Mobile (Expo dev server)
bun app:start           # expo start  (web/ios/android/go from the menu)
```

The mobile app auto-redirects `/` → `/characters`. The drawer route is gated by `useSessionGuard`, so if you don't have a session you'll be kicked to `/(auth)/sign-in`.

## Resetting the database

```bash
bun db:reset            # migrate reset + generate + seed
```

## Running a schema / code-gen cycle

After changing `server/prisma/schema.prisma`:

```bash
bun db:migrate -- <short_name>     # runs prisma migrate dev --name <short_name>
bun db:generate                    # usually done by migrate dev
```

After changing `server/schema.graphql`:

```bash
bun server:codegen
bun app:codegen
```

## Running tests

```bash
bun server:test                        # Server (bun test)
bun app:test                           # Mobile (jest via yarn)
bun app:test <substring>               # Mobile, filtered

# E2E (requires local Supabase)
bun e2e:up
bun app:e2e
bun e2e:down
```

Details: [`testing.md`](./testing.md).

## Common problems

- **`prisma` can't find the schema** — run migrations via `bun db:migrate` (root script) rather than `bunx prisma migrate` directly. The root script wraps `cd server && bunx prisma …` so `prisma.config.ts` resolves correctly.
- **`DATABASE_URL` not set** — `server/prisma.config.ts` reads it at parse time, so even `prisma generate` needs it in the env. Export it inline or make sure `server/.env` exists.
- **Expo web shows old API URL** — kill Metro and restart with `--clear`, e.g. `yarn web --clear`, so the new `EXPO_PUBLIC_*` env vars are baked into a fresh bundle.
- **Supabase session not persisting on web** — check the browser's `localStorage`. The mobile app deliberately no-ops storage during SSR; client-side storage only activates once `window.localStorage` is available.
- **Sandboxed Prisma commands failing** — if you're in a restricted env and Prisma needs Docker/host access, stop and ask the user to run the command manually (per `AGENTS.md`).

## RTK

Prefix shell commands with `rtk` to save tokens (user rule):

```bash
rtk bun server:test
rtk yarn test FilterSwitch
rtk git status
```
