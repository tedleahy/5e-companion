# Conventions

Canonical code-style and workflow guide. [`AGENTS.md`](../AGENTS.md) holds the short non-negotiable list injected into every agent session; if this doc and `AGENTS.md` disagree on a hard rule, `AGENTS.md` wins — update both in the same commit.

## Language and formatting

- **TypeScript everywhere** — both `mobile-app/` and `server/`.
- **British English spellings** in names, comments, and docs (e.g. `initialise`, `normalise`, `colour` in text, but not when it clashes with React Native APIs like `color`).
- **JSDoc every function, class, and exported constant**. One-line for trivial helpers is fine.
- **Function declarations over const arrow functions**, except for one-liners:
  ```ts
  function buildThing() { … }          // prefer
  const buildThing = () => { … };       // only for one-liners
  ```
- **Async/await in try/catch**, not `.then().catch()`.

## Components and modules

- **Fantasy-style look and feel** throughout.
- **Keep components small**. Prefer `react-native-paper` primitives.
- **One component per file where practical** — don't stack multiple components in a single file.
- **Check for existing components before adding a new one**. The sheet/spells/wizard areas have a lot of reusable pieces.
- **Avoid functions that are only used once** unless naming them adds real readability or testability.
- **Keep code DRY**, but only where it doesn't hurt readability. Refactor passes are the right time to collapse duplication.
- If a file is getting **too large or too specialised**, split it. If the split will complicate your current change, note it and mention it when you're done rather than blocking yourself.

## UI / theming

- Pull colours, spacing, and motion from `mobile-app/theme/fantasyTheme.ts` (`fantasyTokens`) — don't inline hex values or magic numbers.

## Server-specific

- Mutations that need a user call `requireUser(ctx)` and scope by `ownerUserId`.
- Resolve SRD entities by **`srdIndex`**, not DB `id` or display label.
- **Keep SRD parent/child feature choices aligned** across `server/prisma/seeds/seedCharacterReferenceData.ts` and `mobile-app/lib/srdFeatureChoices.ts` when changing feature groups (Pact Boon, Fighting Style, Circle of the Land, Hunter, etc.).
- If SRD data is missing, **extend the seed** — never hard-code lookup tables into app code.
- Prefer promoting `Spell.raw` JSON fields into typed columns + indexes rather than reading JSON in filters.
- When adding a sheet collection, reuse `reconcileSheetCollection.ts` rather than hand-rolling diff logic.
- After `server/schema.graphql` changes: `bun server:codegen` and `bun app:codegen`. After Prisma schema changes: `bun db:migrate -- <name>` then `bun db:generate`.

## Mobile-specific

- Use `@/…` imports (configured in `tsconfig.json` + Jest `moduleNameMapper`).
- **`Character.spellbook` has `merge: false`** in `app/apolloClient.ts` — partial mutation responses need an updated field policy or a full spellbook snapshot.
- Use the root auth gate in `app/_layout.tsx` for app-wide redirects, and `useProtectedNavigation` / `useSessionGuard` for focused protected navigation or screen-level checks.
- Platform forks via `Foo.web.tsx` / `Foo.native.tsx` — keep `tsconfig.json` `moduleSuffixes` in sync with Metro.
- Regenerate GraphQL types with `bun app:codegen` after any schema or operation change.

## Git

- **Don't commit anything unless asked.**
- Group changes into multiple focused commits, each with a detailed message.
- Format:
  ```
  feat(mobile): Added x screen to y tab, allowing user to do z

  - extra detail on a separate line
  - another detail
  ```
- Allowed prefixes: `feat`, `refactor`, `chore`, `bug` (others OK if they fit). Add `(mobile)` or `(api)` when scoped.
- **Don't commit markdown or plain-text files** in the project root except `AGENTS.md` (commit `docs/` when the user asks).

## Testing discipline

- **Design or update tests before major implementation work.**
- **Never delete or weaken a test** without explicit direction.
- **Don't add production conditionals just to satisfy Jest** — fix the harness, timers, mocks, or assertions.
- **Don't bloat app code for tests.**
- Commands and harness gotchas: [`testing.md`](./testing.md).

## Working with the user

- For any missing info or required confirmation, use the **`ask-user-questions`** skill instead of pressing on with guesses. Keep using it during troubleshooting until the user explicitly confirms the task is complete.
- Prefer minimal upstream fixes over downstream workarounds. Identify root cause before coding; use one-line changes when sufficient.
- Keep concise progress notes only when they'll genuinely speed up future work. Don't create speculative `.md` files for yourself.
- For multi-step work, keep only one step `in_progress` in the todo list, and refresh the plan as new info arrives.

## Agent-specific rules

- **Prefix shell commands with `rtk`** where the RTK proxy is available — e.g. `rtk git status`, `rtk bun test`, `rtk yarn test FilterSwitch`.
- **Run `tsc --noEmit` in both `server/` and `mobile-app/`** before considering a task done. Fix type errors in files you touched.
