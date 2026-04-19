# Conventions

This is a short, actionable summary. The source of truth is [`../AGENTS.md`](../AGENTS.md) — read that in full at least once. If this doc and `AGENTS.md` disagree, `AGENTS.md` wins; update this doc in the same commit.

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

- **Keep components small and modern**. Prefer react-native-paper primitives.
- **One component per file where practical** — don't stack multiple components in a single file.
- **Check for existing components before adding a new one**. The sheet/spells/wizard areas have a lot of reusable pieces.
- **Avoid functions that are only used once** unless naming them adds real readability.
- **Keep code DRY**, but only where it doesn't hurt readability. Duplication is a refactor target, not a bug.
- If a file is getting **too large or too specialised**, split it. If the split will complicate your current change, note it and mention it when you're done rather than blocking yourself.

## Server-specific

- Mutations that need a user call `requireUser(ctx)`.
- Resolve SRD entities by **`srdIndex`**, not DB `id` or display label.
- If SRD data is missing, **extend the seed** — never hard-code lookup tables into app code.
- Prefer promoting `Spell.raw` fields into typed columns + indexes rather than reading JSON in filters.
- When adding a sheet collection, reuse `reconcileSheetCollection.ts` rather than hand-rolling diff logic.

## Mobile-specific

- Use `@/…` imports (configured in `tsconfig.json` + Jest `moduleNameMapper`).
- Pull colours/spacing from `theme/fantasyTheme.ts`'s `fantasyTokens`.
- Use `useProtectedNavigation` + `useSessionGuard` for auth-gated routing.
- Platform forks via `Foo.web.tsx` / `Foo.native.tsx` — keep `tsconfig.json` `moduleSuffixes` in sync.
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
- **Don't commit markdown or plain-text files** except `AGENTS.md` (and, by extension, these `docs/` files when the user asks).

## Testing discipline

- **Design or update tests before major implementation work.**
- **Never delete or weaken a test** without explicit direction.
- **Don't add production conditionals just to satisfy Jest** — fix the harness, timers, mocks, or assertions.
- See [`testing.md`](./testing.md) for command details and gotchas.

## Working with the user

- For any missing info or required confirmation, use the **`ask-user-questions`** skill instead of pressing on with guesses. Keep using it during troubleshooting until the user explicitly confirms the task is complete.
- Prefer minimal upstream fixes over downstream workarounds. Identify root cause before coding; use one-line changes when sufficient.
- Keep concise progress notes only when they'll genuinely speed up future work. Don't create speculative `.md` files for yourself.
- For multi-step work, keep only one step `in_progress` in the todo list, and refresh the plan as new info arrives.

## Agent-specific rules

- **Always prefix shell commands with `rtk`** to save tokens (see the RTK rule in user memory). Example: `rtk git status`, `rtk bun test`, `rtk yarn test FilterSwitch`.
