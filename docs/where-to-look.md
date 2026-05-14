# Where to Look

Task → file map. Scan for your task, then open the file(s) in the right column. Where a flow is non-trivial, there's a deeper doc linked.

## Navigation and layout

| Task | Files |
| --- | --- |
| Change the root providers (Apollo, Paper, fonts, safe area) | [`@/home/ted/projects/5e-companion/mobile-app/app/_layout.tsx:1-158`](../mobile-app/app/_layout.tsx) |
| Add a main app destination | `mobile-app/app/(rail)/<new>.tsx` + add to `components/navigation/navigationConstants.ts` (`DRAWER_SCREENS` + optional nav item) |
| Change the drawer vs rail behaviour | [`@/home/ted/projects/5e-companion/mobile-app/app/(rail)/_layout.tsx:1-49`](../mobile-app/app/(rail)/_layout.tsx) + `components/navigation/` |
| Add an unauthenticated screen | `mobile-app/app/(auth)/<name>.tsx` |
| Change route animations | `Stack.Screen` entries in [`@/home/ted/projects/5e-companion/mobile-app/app/_layout.tsx:117-134`](../mobile-app/app/_layout.tsx) |

## Authentication

| Task | Files |
| --- | --- |
| Change how the mobile app signs in / out | `mobile-app/app/(auth)/sign-in.tsx`, `sign-up.tsx`, `@/home/ted/projects/5e-companion/mobile-app/lib/supabase.ts` |
| Change how the mobile app persists the session | [`@/home/ted/projects/5e-companion/mobile-app/lib/supabase.ts:56-95`](../mobile-app/lib/supabase.ts) (native vs web storage) |
| Redirect-on-no-session behaviour | Root gate in [`@/home/ted/projects/5e-companion/mobile-app/app/_layout.tsx`](../mobile-app/app/_layout.tsx) + focused checks in [`@/home/ted/projects/5e-companion/mobile-app/hooks/useSessionGuard.ts`](../mobile-app/hooks/useSessionGuard.ts) |
| Attach JWT to GraphQL requests | [`@/home/ted/projects/5e-companion/mobile-app/app/apolloClient.ts:8-18`](../mobile-app/app/apolloClient.ts) |
| Verify JWT server-side | [`@/home/ted/projects/5e-companion/server/lib/auth.ts:1-20`](../server/lib/auth.ts) |

Deep dive: [`features/auth.md`](./features/auth.md).

## Spells

| Task | Files |
| --- | --- |
| Change spell-list UI | `mobile-app/app/(rail)/spells.tsx`, `mobile-app/components/SpellList.tsx`, `components/spell-list/` |
| Add a spell filter (client) | [`@/home/ted/projects/5e-companion/mobile-app/lib/spellFilters.ts`](../mobile-app/lib/spellFilters.ts), `components/SpellFilterDrawer.tsx` |
| Add a spell filter (server) | [`@/home/ted/projects/5e-companion/server/lib/spellFilters.ts`](../server/lib/spellFilters.ts), update `SpellFilter` input in `server/schema.graphql`, extend [`@/home/ted/projects/5e-companion/server/resolvers/spellsResolver.ts`](../server/resolvers/spellsResolver.ts) if needed |
| Change the fields exposed on a spell | `server/schema.graphql` (`Spell` type), [`@/home/ted/projects/5e-companion/server/lib/spellSelect.ts`](../server/lib/spellSelect.ts), and the Prisma model at [`@/home/ted/projects/5e-companion/server/prisma/schema.prisma:37-70`](../server/prisma/schema.prisma) |
| Seed a new custom spell | `server/prisma/seeds/seedCustomSpells.ts` |
| Change the spell detail page | `mobile-app/app/spells/[id].tsx` + `components/character-sheet/spells/SpellDetailModal.tsx` |

Deep dive: [`features/spells.md`](./features/spells.md).

## Character roster and sheet

| Task | Files |
| --- | --- |
| Change the character roster | `mobile-app/app/(rail)/characters.tsx`, `components/characters/` |
| Change the character sheet screen | `mobile-app/app/(rail)/character/[id].tsx`, `components/character-sheet/` |
| Change a sheet tab | `components/character-sheet/<AbilitiesTab|FeaturesTab|GearTab|SpellsTab|TraitsTab>.tsx` |
| Change HP / death saves / hit dice UI | `VitalsCard.tsx`, `DeathSavesCard.tsx`, `QuickStatsCard.tsx` under `components/character-sheet/` |
| Change spellbook card | `components/character-sheet/spells/SpellbookCard.tsx` (+ the rest of `components/character-sheet/spells/`) |
| Change skill proficiency handling | `components/character-sheet/AbilityScoresAndSkillsCard.tsx` + `components/character-sheet/skills/` |
| Save sheet logic | [`@/home/ted/projects/5e-companion/server/resolvers/character/saveCharacterSheetMutation.ts`](../server/resolvers/character/saveCharacterSheetMutation.ts) + `reconcileSheetCollection.ts` |
| Short / long rest | [`@/home/ted/projects/5e-companion/server/resolvers/character/restMutations.ts`](../server/resolvers/character/restMutations.ts) |
| Learn / forget / prepare spells or use a slot | [`@/home/ted/projects/5e-companion/server/resolvers/character/spellbookMutations.ts`](../server/resolvers/character/spellbookMutations.ts) |
| Change derived `Character.*` fields (level, spellcastingProfiles, spellSlots) | [`@/home/ted/projects/5e-companion/server/resolvers/character/fieldResolvers.ts`](../server/resolvers/character/fieldResolvers.ts) + `multiclassRules.ts` |

## Character creation

| Task | Files |
| --- | --- |
| Change a step screen | `mobile-app/app/characters/create/<index|class|abilities|background|skills|review>.tsx` (`race.tsx` is only a redirect to identity) |
| Change the wizard shell (progress, back/cancel, continue gating) | `mobile-app/components/wizard/WizardShell.tsx` |
| Change draft state shape | `mobile-app/store/characterDraft.tsx` + `mobile-app/lib/characterCreation/` |
| Change server create behaviour | [`@/home/ted/projects/5e-companion/server/resolvers/character/lifecycleMutations.ts`](../server/resolvers/character/lifecycleMutations.ts) + `multiclassRules.ts` + `subclassReferences.ts` |

Deep dive: [`features/character-creation.md`](./features/character-creation.md) (cross-references the existing `CHARACTER_CREATION_FLOW.md`).

## Level-up

| Task | Files |
| --- | --- |
| Change the wizard orchestration | `mobile-app/hooks/useLevelUpWizard.ts` |
| Change step assembly / order | `mobile-app/lib/characterLevelUp/stepAssembly.ts` |
| Change a step UI | `mobile-app/components/character-sheet/level-up/LevelUp<Step>.tsx` |
| Change step rules (spellcasting, ASI, invocations, …) | `mobile-app/lib/characterLevelUp/<spellcasting|asiOrFeat|advancedClassChoices|subclassFeatures|…>.ts` |
| Change how draft state applies to the sheet | `mobile-app/lib/characterLevelUp/draftApplication.ts` |

Deep dive: [`features/level-up-wizard.md`](./features/level-up-wizard.md).

## Data model / schema

| Task | Files |
| --- | --- |
| Add or change a DB table | [`@/home/ted/projects/5e-companion/server/prisma/schema.prisma`](../server/prisma/schema.prisma) → `bun db:migrate -- <name>` → `bun db:generate` |
| Add SRD seed data | `server/prisma/seeds/*.ts` |
| Change the GraphQL schema | [`@/home/ted/projects/5e-companion/server/schema.graphql`](../server/schema.graphql) + `bun server:codegen` + `bun app:codegen` |
| Adjust Prisma-to-GraphQL type mapping | `server/codegen.yml` |

## CI / tooling

| Task | Files |
| --- | --- |
| Change unit-test CI | `.github/workflows/unit-tests.yml` |
| Change lint CI | `.github/workflows/lint.yml` |
| Change e2e CI | `.github/workflows/e2e.yml` + `mobile-app/playwright.config.ts` + `mobile-app/e2e/` |
| Change mobile lint config | `mobile-app/eslint.config.js` |
| Change Jest setup | `mobile-app/jest.config.js`, `mobile-app/jest-setup.ts` |

## Dev env

| Task | Files |
| --- | --- |
| Spin up local Postgres | `server/docker-compose.yml` (`docker compose up` in `server/`) |
| Configure local Supabase | `supabase/config.toml` + `bun e2e:up` |
| Change mobile env vars | `mobile-app/.env` (`EXPO_PUBLIC_*`) |
| Change server env vars | `server/.env` |
