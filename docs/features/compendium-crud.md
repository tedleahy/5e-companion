# Compendium custom-content CRUD

## Summary

Every migrated Compendium category is browse-only. `CompendiumCollection` is a read shell: its props cover heading, filters, collection data, empty state, row renderers, and detail rendering, and nothing else ([`compendium-collection.types.ts:51-64`](../../mobile-app/components/compendium/compendium-collection.types.ts)).

The goal is to generalise it into a read-write shell so any category can create, update, and delete custom records, and to migrate `/compendium/subclasses` onto it as the first caller. Subclasses is the natural first case because its manager already implements every affordance the shell needs, in parallel.

This supersedes the guidance in [`compendium.md`](./compendium.md) that Subclasses should not be forced into the collection shell. That guidance still holds for Spells, whose pagination and filter model genuinely differ.

## Why subclasses first

`/compendium/subclasses` is the only category that has not been migrated *and* already has CRUD, so it exercises the full extension surface. It is also the screen with the visible defects:

- It is the only Compendium category behind an asynchronous session check. `useSessionGuard()` gates both queries with `skip: !hasValidSession` (`mobile-app/app/(rail)/compendium/subclasses.tsx:112`, and lines 137 and 149), so the fetch is serialised behind a Supabase round-trip rather than starting on first render like `useCompendiumBrowse` does.
- Three of its early returns replace the whole screen, including `CompendiumScreenHeader` (`mobile-app/app/(rail)/compendium/subclasses.tsx:322`, 331, and 335). One of them is a bare `return null`. During the shared-axis-Z page transition the subtree swaps spinner → blank → spinner → layout, which reads as a flicker interrupting the animation.
- `SubclassManagerCard` is a parallel implementation of the collection shell — its own expanded-row state, empty state, filter chips, and a full-width `Animated.timing` detail slide driven by `hiddenDetailTranslateX = Math.max(1, windowWidth)` ([`SubclassManagerCard.tsx:68-69`](../../mobile-app/components/subclasses/SubclassManagerCard.tsx)). That is the lateral slide the shared shell has already moved away from.

Migrating removes all three as a side effect.

## Gaps to close

**No `compendiumSubclasses` query.** Every migrated category has a dedicated type and resolver; subclasses instead merges `availableSubclasses` (borrowed from the character-sheet operations) and `customSubclasses` ([`schema.graphql:881-882`](../../server/schema.graphql)) client-side to attach `characterUsageCount`, `canChangeClass`, and `cannotChangeClassReason` (`mobile-app/app/(rail)/compendium/subclasses.tsx:179-201`). `useCompendiumBrowse` accepts a single `document` and `select`, so it cannot consume that shape. `CompendiumSubrace` ([`schema.graphql:98`](../../server/schema.graphql)) already carries `characterUsageCount` from a Prisma `_count`, and `compendiumSubraces` ([`compendiumResolver.ts:300`](../../server/resolvers/compendiumResolver.ts)) is a direct template.

**No write affordances in the shell.** Subclasses needs a floating add action hidden while a detail is open, per-row edit and delete controls ([`SubclassListRow.tsx:113-157`](../../mobile-app/components/subclasses/SubclassListRow.tsx)), a form sheet, a confirmation dialog, and an error snackbar. `row.extra` exists but is a display slot — `race-compendium.tsx:59` uses it for a tablet-only column — and the shell exposes no detail-visibility callback, which `SubclassManagerCard` provides today via `onDetailVisibilityChange`.

## Shell extension

Add optional, additive props to `CompendiumCollection` so all eight existing callers keep working untouched:

- A **floating action** slot, rendered by the shell and hidden automatically while a detail is open. The shell already knows whether a detail is open, so the `onDetailVisibilityChange` round-trip through the screen disappears.
- **Row actions** in `CompendiumCollectionRowRenderers` ([`compendium-collection.types.ts:44-49`](../../mobile-app/components/compendium/compendium-collection.types.ts)), distinct from the existing display-only `extra`, so edit and delete controls get consistent placement, hit targets, and accessibility labels across categories rather than being reinvented per screen.
- **Overlay** slot for the form sheet, confirmation dialog, and snackbar, so those render above the card with consistent z-ordering.

Screens keep owning their own mutations, draft state, and validation. The shell owns placement and visibility only — it should not learn what a subclass is.

## Phases

1. **Backend — done.** `CompendiumSubclass` and `compendiumSubclasses` carry `classId`, `className`, `selectionLevel`, `features`, `characterUsageCount`, `canChangeClass`, and `cannotChangeClassReason`. Two details differ from the other browse resolvers: subclasses are the first category with archiving, so visibility is `(SRD or caller-owned and unarchived) and parent class unarchived` rather than `visibleReferenceWhere`; and `characterUsageCount` is scoped to the caller's characters, which matters here because SRD subclasses are shared across users. The re-parenting rule lives in `classChangeAvailability` in `server/resolvers/character/subclassReferences.ts`, shared with the custom-subclass manager so the message cannot drift. No client document yet — that lands with the screen in phase 3.
2. **Shell extension.** Add the three slots above with their own tests. No caller changes.
3. **Screen rewrite.** Move the screen to `components/compendium/subclass-compendium.tsx` so the route becomes a thin wrapper like the other categories, built on `useCompendiumBrowse` + `CompendiumCollection` and modelled on [`subrace-compendium.tsx`](../../mobile-app/components/compendium/subrace-compendium.tsx), whose exclusive parent-race filter is the closest analogue to the class filter. Reuse `ExclusiveFilterChips` and delete `SubclassManagerCard` and `SubclassClassFilterChips`. Keep `CustomSubclassFormSheet`, `CustomSubclassFeatureCard`, and `customSubclassFormDraft.ts` unchanged. The session guard, the three full-screen returns, and the client-side join all go.
4. **Tests.** Rewrite the browse-shaped tests against the shared shell; re-point CRUD selectors that currently reach through `SubclassManagerCard`.

## Test impact

`app/(rail)/__tests__/subclasses.test.tsx` is 814 lines across 22 tests. Roughly eight are browse-shaped (expand and collapse, class filter, SRD switch, empty states, loading placeholder) and are rewritten against the shell. The other fourteen are CRUD-shaped (create, edit, feature rows, class locking, archive, refetch, auth redirect) and should survive with selector changes. For scale, `subrace-compendium.test.tsx` covers a migrated category in 106 lines.

## Afterwards

Custom classes is the second CRUD caller: `class-compendium.tsx` has its own loading returns and still uses the old `SlideInRight` detail transition. It should move onto the extended shell next, reusing the same slots. The five browse-only categories have no custom-content tables yet, so CRUD for them is a data-model change first, not a UI one.
