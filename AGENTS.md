# AGENTS.md

Injected project rules and gotchas. Long-form docs live in [`docs/`](./docs/README.md) — use them for setup, architecture, and feature flows.

When you hit a new pain point that costs time, add it here (hard rules / cross-cutting gotchas) or to the relevant doc under `docs/` (area-specific detail).

---

# Project Context

A D&D 5e companion app. Two deployables plus seed data:

- **Mobile app** (`mobile-app/`) — Expo React Native + TypeScript, Apollo Client, react-native-paper, Supabase auth.
- **Server** (`server/`) — Bun + Apollo Server 5 + Prisma + PostgreSQL. JWT verification via Supabase JWKS.
- **SRD seed data** (`srd-json-files/`) — imported into Postgres by `server/prisma/seeds/*.ts`.

Full overview: [`docs/overview.md`](./docs/overview.md), architecture: [`docs/architecture.md`](./docs/architecture.md), data model: [`docs/data-model.md`](./docs/data-model.md), auth: [`docs/features/auth.md`](./docs/features/auth.md).

Whenever you've finished a task that changes behaviour described in the docs, update those docs to accurately reflect the new behaviour.

---

# Hard rules

Full style guide: [`docs/conventions.md`](./docs/conventions.md). Non-negotiables:

- **`requireUser(ctx)`** and scope by `ownerUserId` on every resolver that touches user data.
- **Resolve SRD entities by `srdIndex`**, never DB id or display label. Mobile create-flow option values must match seeded SRD data.
- **Keep SRD parent/child feature choices aligned** across `server/prisma/seeds/seedCharacterReferenceData.ts` and `mobile-app/lib/srdFeatureChoices.ts` when changing Pact Boon, Fighting Style, Circle of the Land, Hunter choices, etc.
- **Extend `server/prisma/seeds/*.ts`** for missing SRD data — never hard-code lookup tables in app code.
- **Reuse `reconcileSheetCollection.ts`** for new character-sheet collections in `saveCharacterSheet` — don't hand-roll diff logic.
- **`Character.spellbook` has `merge: false`** in `mobile-app/app/apolloClient.ts` — partial mutation responses need an updated field policy or a full spellbook snapshot.
- **Never add production conditionals for tests**; never bloat app code for tests. Fix harness, mocks, or timers instead.
- **Fantasy theme via `fantasyTokens`** (`mobile-app/theme/fantasyTheme.ts`) — no inline hex or magic spacing numbers.
- **Don't commit unless explicitly told.** Don't commit root-level markdown/txt except `AGENTS.md`.

## After schema / GraphQL changes

- **Prisma schema changed** → `bun db:migrate -- <name>` then `bun db:generate`.
- **`server/schema.graphql` changed** → `bun server:codegen` **and** `bun app:codegen`.
- **Added a new reference table** → update the matching seeder in `server/prisma/seeds/`.

## Agent workflow

- **Use the `ask-user-questions` skill** when information is missing or a result needs confirming. Do not assume a task is complete — wait for explicit confirmation.
- **Run `tsc --noEmit` in both `server/` and `mobile-app/`** before considering a task done. Fix type errors in files you touched; ignore pre-existing errors elsewhere.

## Git commits

Examples: `feat(mobile): …`, `feat(api): …`, `refactor(mobile): …`, `bug(api): …`. Add bullet details on separate lines. See [`docs/conventions.md`](./docs/conventions.md) for full commit conventions.

---

# Commands

Full setup, sample `.env` files, and troubleshooting: [`docs/local-development.md`](./docs/local-development.md).

```bash
# One-off
bun server:i && bun app:i && bun i
docker compose -f server/docker-compose.yml up -d
bun db:seed

# Every day
bun server:start    # :4000
bun app:start
```

```bash
bun db:migrate -- <short_name>   # always via root scripts, not bunx prisma
bun db:generate
bun db:seed
bun db:reset
bun server:codegen
bun app:codegen
```

## Tests

Writing or debugging tests → **[`docs/testing.md`](./docs/testing.md)** (canonical gotchas).

```bash
bun server:test
bun app:test
bun app:test <substring>        # e.g. FilterSwitch — avoid zsh globbing on (rail) paths
bun e2e:up && bun app:e2e && bun e2e:down
```

---

# Gotchas

Area-specific detail lives in `docs/`; add cross-cutting items here.

## Prisma / DB

- **`bun db:migrate` needs Postgres running** — Prisma requires a live shadow DB. If unreachable, write migration SQL by hand under `server/prisma/migrations/` and validate once the DB is back.
- **Sandbox permissions**: if Prisma needs Docker/host/network access a sandbox can't provide, stop and ask the user to run the command manually.

## GraphQL codegen

- **`mobile-app/codegen.yml` scans** `app/**/*.tsx`, `components/**/*.tsx`, and `graphql/**/*.ts`. Extend the config before adding GraphQL documents elsewhere.

## Expo TypeScript / platform forks

- `Component.native.tsx` + `Component.web.tsx` — keep `mobile-app/tsconfig.json` `compilerOptions.moduleSuffixes` aligned with Metro.
- Keep bottom-sheet dismiss pan gestures on the drag handle, not around nested scroll views; on Android a parent pan recognizer can block the scroll view's initial upward gesture.

## Character creation reference-data

- `createCharacter` resolves class/subclass/race/background by `srdIndex`. Do not offer options the current seed can't resolve. See [`docs/features/character-creation.md`](./docs/features/character-creation.md) and `mobile-app/app/characters/create/CHARACTER_CREATION_FLOW.md`.
