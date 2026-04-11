# Backend Deployment Handoff

## Goal

Deploy the Bun + Apollo Server + Prisma backend for the D&D Companion app to a single small Hetzner VPS as the first live production setup.

The intended initial production shape is:

- 1 VPS
- Docker Compose
- `api` container for the Bun/Apollo server
- `db` container for PostgreSQL
- `caddy` container for reverse proxy + HTTPS
- public API hostname: `api.5e-companion.com`

## Decisions Already Made

- Hosting provider: Hetzner Cloud
- Deployment model: single-box VPS, not a managed platform
- Domain already bought: `5e-companion.com`
- Planned API hostname: `api.5e-companion.com`
- The API should stay simple and cost-effective for a hobby app first, with room to split API and DB later if usage grows

## Current Branch State

Branch `feature/deploy-backend` contains all deployment work. The two deployment commits are already applied to this branch (not dangling):

- `558966c` `feat(api): add production runtime configuration for the backend`
- `0c94e7d` `feat(api): add single-box production deployment stack`

### What these commits added (all present on this branch now)

**Production runtime configuration (`558966c`):**

- `server/index.ts` — env-driven `PORT` handling (defaults to `4000`), startup validation for required env vars
- `server/package.json` — `db:deploy` and `db:seed` scripts
- `package.json` — root-level `db:deploy` and `db:seed` helper scripts

**Single-box deployment stack (`0c94e7d`):**

- `deploy/docker-compose.prod.yml`
- `deploy/Caddyfile`
- `deploy/.env.prod.example`
- `server/Dockerfile`
- `server/.dockerignore`
- `server/.env.example`

## Production Design Notes

- The current Apollo server uses `startStandaloneServer(...)`.
- Unless that is changed, the GraphQL endpoint is served at the root path, not `/graphql`.
- That means the production API URL will currently be `https://api.5e-companion.com/`, not `https://api.5e-companion.com/graphql`.
- If a cleaner `/graphql` path is desired, the server bootstrap should be changed deliberately rather than assumed.

## Outstanding Tasks

### 1. ~~Bring the deploy work onto the current branch~~ DONE

Both commits are already on `feature/deploy-backend`. No cherry-picking or recovery needed.

### 2. Re-verify the backend after applying them

- run `bun run test` in `server/`

### 3. Prepare DNS

In Porkbun:

- create an `A` record for host `api`
- point it to the Hetzner server IPv4

Result:

- `api.5e-companion.com` should resolve to the VPS

### 4. Provision the VPS

Suggested baseline:

- Ubuntu 24.04 LTS
- Docker Engine
- Docker Compose plugin
- firewall allowing only `22`, `80`, and `443`

### 5. Prepare production env files on the server

Expected production env values include:

- `API_DOMAIN=api.5e-companion.com`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `SUPABASE_URL`
- `DATABASE_URL` for the API container, typically pointing at the Compose `db` service

### 6. Run first production deploy

Expected sequence after the deployment files are present:

1. Start Postgres only.
2. Run Prisma production migrations.
3. Run the seed once.
4. Start the full stack.
5. Confirm the API responds through Caddy over HTTPS.

## Likely Deployment Commands

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d db
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod run --rm api bun run db:deploy
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod run --rm api bun run db:seed
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.prod up -d
```

## Mobile App Follow-Up

After the backend is live:

- set the production mobile env `EXPO_PUBLIC_API_URL` to the live backend URL
- rebuild the mobile app so it targets production instead of local development

Because the server currently serves GraphQL at the root path, use the root URL unless the bootstrap is changed.

## Notes For The Next Agent

- The worktree currently has unrelated dirty mobile-app changes. Do not revert them.
- There are also unrelated untracked notes and prototype files in the repo root. Leave them alone.
- Keep deployment work isolated to backend/deploy files unless a small mobile env change is explicitly needed.
