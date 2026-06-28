# Testing

Canonical reference for test commands, CI, and harness gotchas. [`AGENTS.md`](../AGENTS.md) lists minimal test commands; read this doc when writing, fixing, or running tests.

Three suites, three runners. All unit suites are safe without live Postgres — Prisma is mocked; e2e brings up local Supabase.

## Mobile unit tests — Jest (jest-expo)

- **Config**: [`@/home/ted/projects/5e-companion/mobile-app/jest.config.js:1-19`](../mobile-app/jest.config.js).
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

### Gotchas

- **Route-group parentheses** (`app/(rail)/...`, `app/(auth)/...`) are **zsh globs**. Quote them in shell commands; prefer `yarn test character-sheet.test.tsx` or `bun app:test character-sheet` over literal route-group paths.
- **`SectionList` virtualises rows** — off-screen items aren't in the test tree. Filter/search first (or scroll) before asserting on or pressing deep list rows. Same applies to spell lists — see [`features/spells.md`](./features/spells.md).
- **`jest.requireActual('react-native')`**: if you extend RN mocks, **mutate the actual module in place — do not spread it**. RN 0.81's index has lazy getters (`DevMenu`, `SettingsManager`, …) that call `TurboModuleRegistry.getEnforcing` and throw under Jest the moment they're touched.
- **Don't suppress `act(...)` warnings** with production code changes. Fix timers, mocks, or assertions instead.
- **Spellbook prepare/unprepare toggles** live inside the spell row's accordion actions (`character-spell-prepare-*`). Open the row (`character-spell-row-*`) before pressing.

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

### Gotchas

- **Don't install partial `mock.module('../prisma/prisma')` fakes in individual test files.** Bun test file ordering can differ between local and GitHub Actions, so a partial Prisma fake from one suite can leak into another. Reuse the shared resolver test Prisma mock and extend it when a new delegate is needed.
- **No DB connection** required — tests mock Prisma. Do not introduce tests that require live Postgres unless absolutely necessary.
- `DATABASE_URL` is still required by `server/prisma.config.ts` at parse time. In CI the unit-tests workflow sets a dummy URL — see `.github/workflows/unit-tests.yml`.

## End-to-end tests — Playwright

- **Config**: [`@/home/ted/projects/5e-companion/mobile-app/playwright.config.ts:1-94`](../mobile-app/playwright.config.ts).
- **Tests**: `mobile-app/e2e/*.spec.ts`.
- Runs against the **Expo web** build + a local GraphQL server + local Supabase.

### Flow (handled by the config)

1. `globalSetup.ts` migrates the local Supabase Postgres and seeds a test user + character.
2. `playwright.config.ts` starts two web servers: the GraphQL server on `4010` and Expo web on `8081`, both pointed at the local Supabase stack. During the run, `globalSetup.ts` writes a generated `mobile-app/.env.development.local` so Expo bakes the e2e URLs into the web bundle; `globalTeardown.ts` removes that generated file and restores any developer-owned backup.
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

### Gotchas

- **Don't target plain RN `TextInput` fields with `input[type="text"]` in Playwright.** React Native Web may omit the `type` attribute. Prefer accessible labels, placeholders, or stable `testID` selectors.

### When to add e2e

Prefer unit tests. Add an e2e spec only for flows that can't be meaningfully covered by unit tests — e.g. the auth cookie round trip, or cross-provider UI interactions. Each spec increases CI runtime noticeably.

## CI

- `.github/workflows/backend-checks.yml` — runs actionlint, Prisma validation/generation, server GraphQL codegen drift check, `tsc --noEmit`, `bun test`, and an API Docker build for backend-related changes. Backend deploys use this workflow as their gate.
- `.github/workflows/frontend-checks.yml` — runs mobile GraphQL codegen drift check, `tsc --noEmit`, Expo lint, and Jest for mobile-app changes and server GraphQL schema changes.
- `.github/workflows/e2e.yml` — brings up local Supabase via the Supabase CLI and runs the full e2e suite for full-stack app/server/data changes. CI uses the Chrome installed on GitHub-hosted runners instead of downloading Playwright Chromium.

All CI workflows run on Ubuntu. Frontend and e2e use Node 24; backend and e2e use Bun latest.

## General testing discipline

- **Design/update tests before major implementation work** — never delete or weaken a test without explicit direction.
- **Don't bloat app code just for tests**. If something is only there to make tests pass, refactor the test or the harness instead.
- **Don't add production conditionals just to satisfy Jest** — fix the harness, timers, mocks, or assertions instead.
- If you can't run a test locally, share the exact copy-pastable command for the user.
