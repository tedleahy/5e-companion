# AGENTS.md

Rules and gotchas for working on this repo. Long-form project docs live in [`docs/`](./docs/README.md) — **read `docs/README.md` first**, then come back here.

When you hit a new pain point that costs time, add a rule or gotcha to the relevant section below so the next session doesn't repeat it.

---

# Project Context

A D&D 5e companion app. Two deployables plus seed data:

- **Mobile app** (`mobile-app/`) — Expo React Native + TypeScript, Apollo Client, react-native-paper, Supabase auth.
- **Server** (`server/`) — Bun + Apollo Server 5 + Prisma + PostgreSQL. JWT verification via Supabase JWKS.
- **SRD seed data** (`srd-json-files/`) — imported into Postgres by `server/prisma/seeds/*.ts`.

Full overview: [`docs/overview.md`](./docs/README.md), architecture: [`docs/architecture.md`](./docs/architecture.md), data model: [`docs/data-model.md`](./docs/data-model.md), auth: [`docs/features/auth.md`](./docs/features/auth.md).

Secondary goal: learn React Native + GraphQL/Apollo. When explaining, assume I know React (web) and REST APIs; assume I don't know GraphQL internals or native-only concerns.

---

# Rules

## Coding conventions

- **TypeScript everywhere.**
- **JSDoc** every function, class, and exported constant.
- **British English** in names, comments, and docs (`initialise`, `normalise`) — but don't fight React Native APIs like `color`.
- **Function declarations** over const arrows, except one-liners: `function foo() { … }` vs `const foo = (x) => x + 1;`.
- **async/await in try/catch**, not `.then().catch()`.
- **One component per file** where practical.
- **Check for existing components before writing a new one** — the sheet/spells/wizard areas have a lot of reusable pieces.
- **DRY, but not at the cost of readability.** Refactor-passes are the right time to collapse duplication.
- **Don't create single-use named functions/variables** unless the name adds clarity or testability. Extracting for either reason is fine.
- **Files getting too big or too specialised?** Split them. If the split would derail the current task, note it and surface when you're done.
- **If SRD data is missing**, extend `server/prisma/seeds/*.ts` — never hard-code SRD lookup tables in app code.
- **Never add production conditionals just to satisfy tests.** Fix the test harness, mocks, or timers instead.
- **Never bloat app code for tests.**

## UI / theming

- **Fantasy-style look and feel** throughout.
- **Pull colours, spacing, motion from `mobile-app/theme/fantasyTheme.ts`** (`fantasyTokens`) — don't inline hex values or magic numbers.
- Use `react-native-paper` primitives where they fit.

## Server patterns

- **Every resolver that touches user data** calls `requireUser(ctx)` and scopes queries by `ownerUserId`. No exceptions today.
- **Resolve SRD entities by `srdIndex`**, never by DB id or display label. The mobile app's option values (races, classes, subclasses, backgrounds) must stay aligned with seeded SRD data — otherwise `createCharacter` and friends can't resolve them.
- **Reuse `reconcileSheetCollection.ts`** when adding a new character-sheet collection to `saveCharacterSheet` — don't hand-roll diff logic.
- **Prefer promoting `Spell.raw` JSON fields** to typed columns + indexes when you need to filter/sort on them, rather than reading JSON at query time.

## Apollo client gotchas

- **`Character.spellbook` has `merge: false`** in `mobile-app/app/apolloClient.ts`. If you add a mutation that returns a partial spellbook, either update the field policy or make the mutation return the full snapshot — otherwise cached deletions will reappear.

## After schema / GraphQL changes

- **Prisma schema changed** → `bun db:migrate -- <name>` then `bun db:generate`.
- **`server/schema.graphql` changed** → `bun server:codegen` **and** `bun app:codegen`.
- **Added a new reference table** → update the matching seeder in `server/prisma/seeds/`.

## Agent workflow

- **Prefix shell commands with `rtk`** where the RTK proxy is available — saves tokens on noisy commands (`rtk bun test`, `rtk git status`, `rtk yarn test <name>`).
- **Use the `ask-user-questions` skill** whenever information is missing or a result needs confirming. Keep using it through troubleshooting. Do not assume a task is complete — wait for explicit confirmation.
- **Don't commit anything unless explicitly told to.**

## Git commits

Write detailed, grouped commit messages. Examples of the style:

- `feat(mobile): Added x screen to y tab, allowing user to do z`
- `feat(api): Updated spell resolvers to expose x for the y feature`
- `refactor(mobile): Split x component out`
- `refactor(api): Moved x resolvers into their own file`
- `chore: document x in AGENTS.md`
- `bug(mobile): fixed bug where x was happening`
- `bug(api): fixed bug where x was happening`

Rules:

- Scope with `(mobile)` or `(api)` where applicable.
- Add bullet points on separate lines for extra detail.
- **Don't commit markdown or txt files**, except `AGENTS.md` and anything under `docs/`.

---

# Running the stack

Prerequisites: Bun (latest), Yarn, Docker, optional Supabase CLI (for e2e).

## Dev stack

```bash
# One-off
bun server:i && bun app:i && bun i          # install deps
docker compose -f server/docker-compose.yml up -d   # start Postgres
bun db:seed                                  # seed SRD + dev character

# Every day
bun server:start    # Apollo Server at :4000 (watch mode)
bun app:start       # Expo dev server
```

## Database

```bash
bun db:migrate -- <short_name>   # prisma migrate dev --name <short_name>
bun db:generate                  # prisma generate
bun db:seed                      # prisma db seed
bun db:reset                     # full reset + seed
```

**Always** run Prisma via these root scripts — `bunx prisma` from the repo root doesn't find the schema because of `server/prisma.config.ts`. Seeding and migrations need `DATABASE_URL` set.

## Codegen

```bash
bun server:codegen    # server/generated/graphql.ts (typescript + typescript-resolvers)
bun app:codegen       # mobile-app/types/generated_graphql_types.ts (typescript-operations)
```

## Tests

All suites are safe to run without a live Postgres (Jest and `bun test` mock Prisma).

```bash
# Mobile (Jest + jest-expo)
bun app:test                    # full suite
bun app:test <substring>        # by filename substring, e.g. `bun app:test FilterSwitch`
# From mobile-app/: yarn test [--watch] [<substring>]

# Server (bun test)
bun server:test                 # full suite
# From server/: bun test lib/spellFilters.test.ts
# From server/: bun test --test-name-pattern "longRest"

# E2E (Playwright against Expo web + local Supabase)
bun e2e:up                      # start local Supabase
bun app:e2e                     # run Playwright suites
bun e2e:down                    # stop local Supabase
bun e2e:reset                   # reset local Supabase DB
```

The mobile `test` script sets `NODE_OPTIONS='--no-experimental-webstorage'` — required for RN 0.81 under Jest. Don't drop it.

## Environment variables

### `server/.env`

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. Read at parse time by `prisma.config.ts`, so every Prisma invocation needs it. |
| `SUPABASE_URL` | Used to fetch JWKS for JWT verification. |
| `PORT` | Optional; default `4000`. |

### `mobile-app/.env`

| Var | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Apollo HTTP link target. |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key. |

`EXPO_PUBLIC_*` is baked into the bundle at build time. Restart Metro with `--clear` if you change them and see stale values.

---

# Gotchas

Single flat section on purpose — easier to add to. Grouped by area.

## Shell / test paths

- **Route-group parentheses** (`app/(rail)/...`, `app/(auth)/...`) are globs in `zsh`. Quote them in shell commands, and prefer a substring filename pattern like `bun app:test character-sheet.test.tsx` over literal route-group paths in Jest.

## Prisma / DB

- **`bun db:migrate` needs Postgres running** at `localhost:5432` (or whatever your `DATABASE_URL` points at) — Prisma requires a live shadow DB. If the DB is unreachable, write migration SQL by hand in a new folder under `server/prisma/migrations/` and validate once the DB is back.
- **Sandbox permissions**: if a Prisma command needs Docker/host/network access that a sandbox can't provide, stop and ask me to run it manually. Don't retry blindly.

## React Native testing

- **`SectionList` virtualises rows** — off-screen items aren't in the test tree. Filter/search first (or scroll) before asserting on or pressing deep list rows.
- **Never spread `jest.requireActual('react-native')`** when adding global mocks. Mutate it in place. RN 0.81's index has lazy getters (`DevMenu`, `SettingsManager`, …) that call `TurboModuleRegistry.getEnforcing` and throw under Jest the moment they're touched.
- **Don't suppress `act(...)` warnings** with production code changes. Fix timers, mocks, or assertions instead.

## Bun server testing

- **Don't install partial `mock.module('../prisma/prisma')` fakes in individual test files.** Bun test file ordering can differ between local and GitHub Actions, so a partial Prisma fake from one suite can leak into another. Reuse the shared resolver test Prisma mock and extend it when a new delegate is needed.

## Spellbook test harness

- **Prepare/unprepare toggles** live inside the spell row's accordion actions (`character-spell-prepare-*`). Open the row (`character-spell-row-*`) before pressing.

## GraphQL codegen

- **`mobile-app/codegen.yml` scans** `app/**/*.tsx`, `components/**/*.tsx`, and `graphql/**/*.ts`. If you add GraphQL documents elsewhere, extend the config first.

## Expo TypeScript / platform forks

- If you add `Component.native.tsx` + `Component.web.tsx`, keep `mobile-app/tsconfig.json`'s `compilerOptions.moduleSuffixes` aligned so TypeScript resolves the same variants Expo/Metro does.

## Character creation reference-data

- The server `createCharacter` mutation resolves class/subclass/race/background rows by `srdIndex`. The mobile create-flow option values must match seeded SRD data — do not offer races/classes/subclasses/backgrounds that the current seed can't resolve. See [`docs/features/character-creation.md`](./docs/features/character-creation.md) and `mobile-app/app/characters/create/CHARACTER_CREATION_FLOW.md`.
