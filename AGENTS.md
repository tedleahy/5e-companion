# Project Context: D&D Companion App

Goal
- Build a Dungeons & Dragons companion app to use during play.
- Features: browse/search/filter spells, create custom spells, manage characters (HP, inventory, etc).
- Learn: React Native + GraphQL (Apollo Server), all in TypeScript.

App (Mobile)
- Expo React Native + TypeScript
- UI: react-native-paper (Material Design components)
- GraphQL client: Apollo Client

Backend (API)
- Node.js + TypeScript + Bun
- Using Bun, not node/npm
- Apollo Server (GraphQL)
- Database: PostgreSQL + Prisma ORM
- Prisma commands (migrate, generate, seed) must be run via root package.json scripts (e.g. `bun db:migrate -- <name>`, `bun db:generate`). Running `bunx prisma` directly won't find the schema due to the prisma.config.ts setup.

Data strategy
- Day 1: import SRD JSON files (e.g. 5e-SRD-Spells.json, in the srd-json-files directory) into Postgres.
- Unified spells list: includes SRD + user-created spells.
- Store full SRD objects as JSONB (`raw`) plus extracted/indexed fields for search/filter (name, level, schoolIndex, classIndexes, ritual, concentration).
- Custom spells stored in same table with `source=CUSTOM` and `ownerUserId`.

GraphQL API shape
- Query: `spells(filter, pagination)` returns SRD + current user custom spells (default).
- Query: `spell(id)` for details.
- Mutations: create/update custom spells; character management mutations later.

Coding conventions
- TypeScript everywhere.
- Use JSDoc for all functions, classes, constants, etc
- Keep components simple and modern; use react-native-paper patterns.
- Avoid having multiple components in the same file where possible.
- Prefer small, composable modules; avoid overengineering early.
- Use function foo() {} instead of const foo = () => {}, except for one-liners
- Use async/await in a try/catch block instead of .then(), .catch(), etc., where possible
- When creating components, check existing components to see if there is anything similar that could be reused/extended to reduce duplication.
- Avoid creating functions/variables that are only used once, unless doing so improves readability.
- Use british english for spellings in functions, docs, etc., e.g. "initialise" instead of "initialize"
- Keep code DRY wherever possible, provided that doing so does not make the code less readable.
    - Cleaning up duplicated code is particularly something to look out for during refactor/cleanup passes
- When you're creating or extending existing code, consider whether the file you're editing is becoming too large/specialised. If it is, consider extracting some of the logic into helper or other modules. Don't be afraid to refactor, but if it's going to complicate your current task, just make a note and mention it to me when you're finished.

UI style
- Give the app a fantasy-style look and feel to it.

Git Commits
- Don't commit anything unless you're explicitly told to.
- Group changes into commits and write detailed commit messages for each of them.
- Follow these general examples for formatting them:
    - feat(mobile): Added x screen to y tab, allowing user to do z
    - feat(api): Updated spell resolvers to give x information to support the y feature
    - refactor(mobile): Split x component out
    - refactor(api): Moved x resolvers into their own file
    - chore: document x in AGENTS.md
    - chore: add jest config and dependencies
    - bug(mobile): fixed bug where x was happening
    - bug(api): fixed bug where x was happening
- You don't have to stick to those exact prefixes, but do that sort of thing - type of commit followed
  by (mobile) or (api) if applicable
- Add bullet points on separate lines where it would be useful to add extra detail.
- Don't commit any markdown or txt files, other than AGENTS.md.

General instructions
- The main goal in making this app is learning React Native and GraphQL. Explain new concepts relating to these technologies. You can assume React web knowledge and REST API knowledge, but assume no knowledge of graphql or native-specific things. So when you tell me how to do something graphql or react native specific, use it as a teaching opportunity.
- If you encounter any particular pain points when executing tasks, reflect on them afterwards and make changes to this file to help you navigate the same issues more quickly in future.
- Shell/testing note: quote paths that contain route-group parentheses (for example `app/(tabs)/...`) when using `zsh` commands, and prefer broad Jest patterns (for example `yarn test character-sheet.test.tsx`) over literal `app/(tabs)/...` paths to avoid glob/pattern mismatches.
- Local DB note: `bun db:migrate -- <name>` requires PostgreSQL running at `localhost:5432`. If the database is down, Prisma cannot generate a migration from a live shadow database, so fall back to writing the migration SQL manually and leave final migration validation until the DB is available.
- Prisma permissions note: if a Prisma command needs host/Docker/network access that the sandbox cannot use, pause and ask me to run it manually rather than retrying inside the sandbox. This especially applies to migration and other DB-connected Prisma commands.
- React Native testing note: `SectionList` virtualizes rows, so off-screen items may not exist in the test tree. In tests, filter/search first or scroll before asserting/pressing deep list rows.
- Spellbook testing note: prepared/unprepared toggles are in the spell row accordion actions (`character-spell-prepare-*`), so tests should open the row (`character-spell-row-*`) before pressing prepare/unprepare.
- GraphQL codegen note: `mobile-app/codegen.yml` scans `app/**/*.tsx`, `components/**/*.tsx`, and `graphql/**/*.ts`. If you add GraphQL documents elsewhere, expand the config first so generated operation types stay in sync.
- Expo TypeScript note: if you add platform-specific files such as `Component.native.tsx` and `Component.web.tsx`, keep `mobile-app/tsconfig.json` `compilerOptions.moduleSuffixes` aligned so TypeScript resolves the same module variants that Expo/Metro does.
- Character creation reference-data note: the server create mutation resolves class/subclass rows by SRD `srdIndex`, not display labels, so mobile create-flow option values must stay aligned with the seeded SRD reference data. Do not offer races, backgrounds, classes, or subclasses that the current seed data cannot resolve.
