# Server

Bun + Apollo Server 5 GraphQL API under `server/`.

## Entry point

[`@/home/ted/projects/5e-companion/server/index.ts:1-168`](../server/index.ts) does three things:

1. Loads `schema.graphql` (single file) with `loadFilesSync`.
2. Builds a `context()` function that reads `Authorization: Bearer <jwt>`, verifies it against Supabase's JWKS, and exposes `{ userId }` on every resolver.
3. Wires up `Query`, `Mutation`, and `Character` type resolvers into a single `Resolvers` object, then mounts Apollo on a minimal Express API at `/` with CORS middleware and listens on `PORT` (default `4000`).

## Context + auth

```ts
export type Context = { userId: string | null };
```

- Verified in [`@/home/ted/projects/5e-companion/server/lib/auth.ts:1-20`](../server/lib/auth.ts) using `jose.createRemoteJWKSet` against `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`.
- Every resolver that needs a user calls `requireUser(ctx)` (throws `'UNAUTHENTICATED'` when absent).
- Invalid tokens become `{ userId: null }` rather than a 401 — resolvers decide whether a given operation is public. Character operations and spell queries require a user.

## CORS

Browser origins are controlled by `CORS_ALLOWED_ORIGINS`, a comma-separated list of exact origins such as `http://localhost:8081` or `https://app.example.com`.

- When `CORS_ALLOWED_ORIGINS` is set, only those browser origins receive CORS headers.
- When it is unset outside production, the server allows the local Expo web origins `http://localhost:8081`, `http://127.0.0.1:8081`, `http://localhost:19006`, and `http://127.0.0.1:19006`.
- When `NODE_ENV=production` or `BUN_ENV=production` and `CORS_ALLOWED_ORIGINS` is unset, browser origins are denied rather than falling back to `*`.
- Requests without an `Origin` header, such as native app or server-to-server requests, do not need CORS headers.

The CORS allow-list parser and Express guard live in [`@/home/ted/projects/5e-companion/server/lib/corsPolicy.ts:1-117`](../server/lib/corsPolicy.ts).

## Schema layout

Single file: [`@/home/ted/projects/5e-companion/server/schema.graphql:1-479`](../server/schema.graphql).

Three concern-blocks inside it:

1. **Spells** — `Spell`, `SpellFilter`, `SpellPagination`.
2. **Character sheet** — `Character`, `CharacterStats`, `SkillProficiencies`, `Weapon`, `InventoryItem`, `CharacterFeature`, `SpellSlot`, `SpellcastingProfile`, `CharacterSpell`, etc.
3. **Inputs / Queries / Mutations** — including the big `SaveCharacterSheetInput` used by the "save sheet" mutation.

When editing: keep these blocks in order (spells → character types → inputs → Query → Mutation).

## Resolver organisation

Single `ApolloServer` object wiring; resolvers are modularised by file:

| File | Contents |
| --- | --- |
| `resolvers/spellsResolver.ts` | `Query.spells` — requires auth, filter + pagination, selects only queried fields via `buildSpellSelect(info)` |
| `resolvers/spellResolver.ts` | `Query.spell` by id; requires auth before reading SRD spell detail |
| `resolvers/characterResolvers.ts` | Barrel re-exporting the `character/*` modules |
| `resolvers/character/queries.ts` | `character`, `hasCurrentUserCharacters`, `currentUserCharacters`, `availableSubclasses` |
| `resolvers/character/lifecycleMutations.ts` | `createCharacter`, `updateCharacter`, `deleteCharacter`, `toggleInspiration` |
| `resolvers/character/saveCharacterSheetMutation.ts` | `saveCharacterSheet` — big reconcile of the full editable sheet |
| `resolvers/character/statsMutations.ts` | `updateDeathSaves`, `updateHitDice`, `updateSkillProficiencies`, `updateSavingThrowProficiencies` |
| `resolvers/character/spellbookMutations.ts` | `learnSpell`, `forgetSpell`, `prepareSpell`, `unprepareSpell`, `toggleSpellSlot` |
| `resolvers/character/gearAndFeaturesMutations.ts` | `updateInventoryItem` |
| `resolvers/character/restMutations.ts` | `spendHitDie`, `shortRest`, `longRest` |
| `resolvers/character/fieldResolvers.ts` | Derived `Character.*` fields (level, proficiency bonus, classes, spellcastingProfiles, stats, weapons, inventory, features, spellSlots, spellbook) + `CharacterStats.hitDicePools` |
| `resolvers/character/multiclassRules.ts` | Pure rules: proficiency bonus, hit-dice pools, spell slots (multiclass formula), spellcasting profiles, validation |
| `resolvers/character/subclassReferences.ts` | Loads the visible subclasses (SRD + user-owned) and materialises custom subclasses on create/save |
| `resolvers/character/customSubclassManager.ts` | Manager query/mutations for reusable custom subclasses |
| `resolvers/character/reconcileSheetCollection.ts` | Generic insert/update/delete helper used by `saveCharacterSheet` |
| `resolvers/character/detailLoad.ts` | Shared Prisma `include` objects for list/detail queries |
| `resolvers/character/helpers.ts` | Shared defaults + `findOwnedCharacter` guard |

## User-Owned Reference Rows

Reference tables can mix SRD rows and user-owned rows. SRD rows use `ownerUserId: null`; user-owned rows set `ownerUserId` and every resolver that touches them must call `requireUser(ctx)` and scope by that id.

Custom subclasses are the main user-owned reference type today. Active custom subclass lookups filter `archivedAt: null`, and manager + inline creation paths treat duplicate names as case-insensitive per user/class. The manager also reconciles reusable custom subclass feature definitions transactionally as `Feature` rows with `kind: SUBCLASS_FEATURE`, scoped by `ownerUserId`, `classId`, and `subclassId`; omitted submitted feature ids are removed. Archiving a custom subclass hides it from future create and level-up selections, but existing characters keep their subclass relation; `saveCharacterSheet` may preserve an archived subclass id only when it was already attached to that same character.

## Shared library

`server/lib/`:

- `auth.ts` — JWT verification + `requireUser`.
- `spellFilters.ts` — Maps GraphQL filter inputs to Prisma `where` clauses. Houses the category → raw value maps for range / duration / casting time.
- `spellSelect.ts` — Translates the requested GraphQL info into a Prisma `select`, so the DB only projects fields you asked for.

## Patterns worth knowing

- **Prisma-backed mappers for complex types**: `server/codegen.yml` maps `Character`, `CharacterStats`, `CharacterSpell` to their Prisma model types. Field resolvers receive Prisma rows as the parent and convert them to GraphQL shape.
- **SRD indexes are the external id**: create/save mutations resolve classes, subclasses, races, backgrounds by `srdIndex`, not DB id. The mobile app's option lists must stay aligned with seeded data — see the "Character creation reference-data note" in `AGENTS.md`.
- **Tests don't hit the DB**: the current test suites mock Prisma via small helpers in `characterResolvers.testUtils.ts` and `lib/spellFilters.test.ts`. You can run `bun test` without Postgres running.
- **Errors** — resolvers throw `Error` with a short code (e.g. `'UNAUTHENTICATED'`). Client-side Apollo errors bubble up with that message intact.
- **Idempotent reconcile**: `saveCharacterSheet` uses `reconcileSheetCollection.ts` to diff incoming arrays vs. persisted rows by id, creating/updating/deleting as needed. Preserve this pattern when adding a new sheet collection rather than hand-rolling diff logic.

## Scripts

Commands and env setup: [`local-development.md`](./local-development.md). Always run Prisma via root `package.json` scripts, never `bunx prisma` directly (`server/prisma.config.ts`).

## Environment variables

`server/.env` expects:

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `SUPABASE_URL` | Used to build the JWKS endpoint |
| `PORT` | Optional, defaults to `4000` |
| `CORS_ALLOWED_ORIGINS` | Optional comma-separated browser origins allowed by CORS |
