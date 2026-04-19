# 5e Companion Docs

Onboarding documentation for the **D&D 5e Companion** project. These docs are written to let a new agent or developer go from "never seen this repo" to "making effective changes" in under 30 minutes.

Each doc is short and cross-links to the code; it does not duplicate the code. Pair these with [`AGENTS.md`](../AGENTS.md) (project rules + running commands) at the repo root.

## Start here

1. [`overview.md`](./overview.md) — what this project is, stack, and top-level layout
2. [`architecture.md`](./architecture.md) — how the mobile app, server, database, and auth fit together (with diagrams)
3. [`local-development.md`](./local-development.md) — install, run, seed, env vars, common commands
4. [`where-to-look.md`](./where-to-look.md) — "I want to do X, which file do I touch?"

## Reference

- [`data-model.md`](./data-model.md) — Prisma schema, SRD ingestion, unified spells
- [`mobile-app.md`](./mobile-app.md) — Expo Router layout, navigation, Apollo, theme, platform forks
- [`server.md`](./server.md) — Apollo Server, GraphQL schema, resolver structure, auth context
- [`testing.md`](./testing.md) — Jest (mobile), Bun test (server), Playwright (e2e), gotchas
- [`conventions.md`](./conventions.md) — code style, commits, review habits (summarises `AGENTS.md`)

## Features

- [`features/character-creation.md`](./features/character-creation.md) — multi-step create-character wizard
- [`features/level-up-wizard.md`](./features/level-up-wizard.md) — per-class level-up wizard and step assembly
- [`features/spells.md`](./features/spells.md) — SRD + custom spells, filters, spellbook
- [`features/auth.md`](./features/auth.md) — Supabase JWT flow, client storage, session guard

## Conventions for these docs

- **Code-linking over copying**: when describing a flow, link to files with line ranges instead of pasting code.
- **British spellings** (e.g. "initialise", "normalise") to match the codebase.
- **If something is wrong** — update the doc in the same commit as the behaviour change.
