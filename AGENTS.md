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

General instructions
- The main goal in making this app is learning React Native and GraphQL. Explain new concepts relating to these technologies. You can assume React web knowledge and REST API knowledge, but assume no knowledge of graphql or native-specific things. So when you tell me how to do something graphql or react native specific, use it as a teaching opportunity.
- If you encounter any particular pain points when executing tasks, reflect on them afterwards and make changes to this file to help you navigate the same issues more quickly in future.
- Shell/testing note: quote paths that contain route-group parentheses (for example `app/(tabs)/...`) when using `zsh` commands, and prefer broad Jest patterns (for example `yarn test character-sheet.test.tsx`) over literal `app/(tabs)/...` paths to avoid glob/pattern mismatches.
- React Native testing note: `SectionList` virtualizes rows, so off-screen items may not exist in the test tree. In tests, filter/search first or scroll before asserting/pressing deep list rows.
- GraphQL codegen note: `mobile-app/codegen.yml` currently scans `app/**/*.tsx` documents only. GraphQL operations in `mobile-app/graphql/*.ts` will not auto-refresh operation result/variables types unless moved into scanned files or the config is expanded.
- Prisma migration note: if `bun db:migrate` fails in local dev (for example DB not running), you can still generate a migration SQL script by diffing schemas: `prisma migrate diff --from-schema /tmp/old_schema.prisma --to-schema prisma/schema.prisma --script > prisma/migrations/<timestamp>_<name>/migration.sql`.
