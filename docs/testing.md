# Testing

Three suites, three runners. All are safe to run without a live Postgres — unit tests mock Prisma; e2e brings up local Supabase.

## Mobile unit tests — Jest (jest-expo)

- **Config**: [`@/home/ted/projects/5e-companion/mobile-app/jest.config.js:1-20`](../mobile-app/jest.config.js).
- **Setup**: `mobile-app/jest-setup.ts` — global mocks (Expo font, navigation, etc.). See the RN 0.81 note below before adding mocks.
- **Preset**: `jest-expo`, matches `**/?(*.)+(test).[jt]s?(x)`.
- **Path alias**: `@/*` maps to the mobile-app root (e.g. `@/lib/supabase`).

### Commands (from `mobile-app/`, or use `bun app:test` at repo root)

```bash
yarn test                    # Full suite
yarn test <substring>        # By test file pattern, e.g. yarn test FilterSwitch
yarn test --watch <name>     # Watch mode
```

The `test` script sets `NODE_OPTIONS='--no-experimental-webstorage'`. **Don't drop that flag** — required for RN 0.81 under Jest.

### Gotchas (from `AGENTS.md` — keep in sync if anything changes)

- **Route-group parentheses** (`app/(rail)/...`) are zsh globs. Prefer `yarn test character-sheet.test.tsx` over literal route-group paths.
- **`SectionList` virtualises rows** — off-screen items won't exist in the test tree. Filter/search before asserting, or scroll first.
- **Spellbook prepared toggles** live in the accordion actions (`character-spell-prepare-*`). Open the row (`character-spell-row-*`) in the test before pressing prepare/unprepare.
- **`jest.requireActual('react-native')`**: if you extend RN mocks, mutate the actual module in place — **do not spread it**. RN 0.81's index has lazy getters (`DevMenu`, `SettingsManager`, etc.) that call `TurboModuleRegistry.getEnforcing` and throw under Jest the moment you touch them.
- **Don't add production conditionals to suppress `act(...)` warnings**. Fix the test harness, timers, or assertions instead.

## Server unit tests — `bun test`

- Runner: Bun's built-in test runner.
- Tests live colocated (e.g. `server/resolvers/character/multiclassRules.test.ts`) or next to the module they cover (`server/lib/spellFilters.test.ts`).
- `characterResolvers.testUtils.ts` provides the shared Prisma mocks and character fixtures.

### Commands (from `server/`, or use `bun server:test` at repo root)

```bash
bun test                                  # Full suite
bun test lib/spellFilters.test.ts         # Single file (path relative to server/)
bun test --test-name-pattern "longRest"   # Filter by test name
```

### Notes

- **No DB connection** required — tests mock Prisma. Do not introduce tests that require a live Postgres unless absolutely necessary.
- `DATABASE_URL` is still required by `server/prisma.config.ts` at parse time (because `env('DATABASE_URL')` is evaluated when the config loads). In CI the unit-tests workflow sets a dummy URL — see `.github/workflows/unit-tests.yml`.

## End-to-end tests — Playwright

- **Config**: [`@/home/ted/projects/5e-companion/mobile-app/playwright.config.ts:1-93`](../mobile-app/playwright.config.ts).
- **Tests**: `mobile-app/e2e/*.spec.ts`.
- Runs against the **Expo web** build + a local GraphQL server + local Supabase.

### Flow (handled by the config)

1. `globalSetup.ts` migrates the local Supabase Postgres and seeds a test user + character.
2. `playwright.config.ts` starts two web servers: the GraphQL server on `4010` and Expo web on `8081`, both pointed at the local Supabase stack.
3. The `setup` project runs `auth.setup.ts` once, performs a real UI sign-in, and saves auth storage state to `e2e/.auth/user.json`.
4. Other specs reuse that storage state via `storageState`.

### Commands (from repo root or `mobile-app/`)

```bash
# One-off — bring up local Supabase
bun e2e:up

# Run tests
bun app:e2e          # from root
yarn e2e             # from mobile-app/
yarn e2e:ui          # interactive UI mode
yarn e2e:report      # view the last HTML report

# Tear down
bun e2e:down
bun e2e:reset        # reset local Supabase DB
```

### When to add e2e

Prefer unit tests. Add an e2e spec only for flows that can't be meaningfully covered by unit tests — e.g. the auth cookie round trip, or cross-provider UI interactions. Each spec increases CI runtime noticeably.

## CI

- `.github/workflows/unit-tests.yml` — runs `bun test` (server) and `yarn test` (mobile) on every PR and push to `main`.
- `.github/workflows/e2e.yml` — brings up local Supabase via the Supabase CLI, installs Playwright browsers, runs the full e2e suite.
- `.github/workflows/lint.yml` — lint only.

All three run on Ubuntu, Node 24 + Bun latest.

## General testing discipline (from user rules)

- **Design/update tests before major implementation work** — never delete or weaken a test without explicit direction.
- **Don't bloat app code just for tests**. If something is only there to make tests pass, refactor the test or the harness instead.
- If you can't run a test locally, share the exact copy-pastable command for the user.
