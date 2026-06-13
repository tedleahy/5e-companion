# Agent browser auth

Use this when an agent or browser automation harness needs to inspect the Expo web app while signed in. Do not repeatedly click through the sign-in UI unless this bootstrap fails.

## Goal

`bun app:e2e:auth` creates portable auth artifacts for the local e2e stack:

- `mobile-app/e2e/.auth/browser-local-storage.json` — harness-neutral localStorage payload.
- `mobile-app/e2e/.auth/user.json` — Playwright `storageState` payload.
- `mobile-app/e2e/.seed/state.json` — seeded user + character ids.
- `mobile-app/.env.development.local` — generated Expo env pointing web at local Supabase and API URLs.

The generated files are ignored by git because they contain live auth tokens or local machine state.

## Bootstrap

From the repo root:

```bash
bun e2e:up
bun app:e2e:auth
```

The auth command:

1. Checks the local Supabase stack.
2. Applies Prisma migrations to the local Supabase Postgres database.
3. Seeds SRD reference data when needed.
4. Creates or reuses the e2e test user.
5. Seeds a fresh `E2E Test Fighter` character.
6. Signs in through Supabase Auth REST, not the app UI.
7. Writes both generic localStorage auth and Playwright storage-state artifacts.

Then start the browser-facing services:

```bash
# terminal 1, from repo root
bun app:e2e:server

# terminal 2, from repo root
bun app:e2e:web
```

The e2e API URL is `http://127.0.0.1:4010/` and the e2e web URL is `http://127.0.0.1:8081`. `bun app:e2e:server` runs the GraphQL server with the local Supabase/Postgres env. The auth bootstrap writes `mobile-app/.env.development.local`; `bun app:e2e:web` keeps `--clear` on Expo web so Metro rebuilds with those URLs.

## Harness-neutral localStorage injection

Read `mobile-app/e2e/.auth/browser-local-storage.json`. It has this shape:

```json
{
  "origin": "http://127.0.0.1:8081",
  "storageKey": "sb-127-auth-token",
  "storageValue": "{...Supabase session JSON...}",
  "characterSheetUrl": "http://127.0.0.1:8081/character/<id>"
}
```

For any browser harness, set the storage item for that origin before loading protected routes:

```js
const auth = JSON.parse(await fs.promises.readFile('mobile-app/e2e/.auth/browser-local-storage.json', 'utf8'));

await page.goto(auth.origin, { waitUntil: 'domcontentloaded' });
await page.evaluate(({ storageKey, storageValue }) => {
  window.localStorage.setItem(storageKey, storageValue);
}, auth);
await page.goto(auth.characterSheetUrl);
```

This works for Playwright MCP, browser-use style harnesses, Selenium wrappers that can execute JavaScript, and custom browser drivers. If the harness can create storage before navigation, prefer doing that instead of first visiting the origin.

## Playwright usage

Use the generated storage state directly:

```ts
use: {
  storageState: 'mobile-app/e2e/.auth/user.json',
}
```

The normal Playwright e2e config still has its own UI-login setup project. The bootstrap script is for agents and external harnesses that need authenticated browsing without depending on Playwright project dependencies.

## Agent rules

- Do not use production Supabase for exploratory browser automation.
- Do not add auth-bypass conditionals to app code.
- Do not hard-code local Supabase keys; the script reads them from `supabase status`.
- Prefer direct navigation to `characterSheetUrl` over searching the character roster.
- If auth fails, rerun `bun app:e2e:auth`; tokens expire and are intentionally regenerated.
- If the app redirects to `/sign-in`, verify Expo was restarted with `--clear` after `mobile-app/.env.development.local` was generated.

## Cleanup

When done:

```bash
bun e2e:down
```

If you need to restore a developer-owned `mobile-app/.env.development.local`, run the normal Playwright teardown or manually restore `mobile-app/.env.development.local.e2e-backup` if present.
