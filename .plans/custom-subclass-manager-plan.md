# Custom Subclass Manager Implementation Plan

## Goal

Implement a new authenticated rail tab where users can create, edit, filter, and remove reusable custom subclasses. Use `subclass-manager.html` as the interaction prototype, but prioritize the existing Expo app conventions, `fantasyTokens`, React Native Paper components, Apollo patterns, and current subclass selection contracts.

The feature should make custom subclasses first-class reusable reference data:

- Custom subclasses created in the manager appear in character creation and level-up subclass selection.
- Custom subclasses created inline during character creation or level-up appear in the manager.
- Deleted subclasses stop appearing in future pickers, while existing characters keep their visible subclass name.

## Existing Context

Relevant current behavior:

- `Subclass` already supports user-owned custom rows through `ownerUserId`.
- `availableSubclasses(classIds)` already returns SRD rows plus current-user custom rows.
- Character creation and level-up can create custom subclasses inline through `CustomSubclassInput`.
- Client subclass picker values currently use `srdIndex` for SRD rows and DB `id` for custom rows. Preserve this.
- Navigation is defined by `mobile-app/components/navigation/navigationConstants.ts` and rendered by `ExpandedDrawer` and `CollapsedRail`.
- Main rail routes live under `mobile-app/app/(rail)/`.

Prototype behavior to preserve:

- Page header: "Custom Subclasses" / "Subclass Manager" / supporting subtitle.
- Parchment list panel with "Your Subclasses" and an add action.
- Horizontal class filter chips: All + every SRD class.
- List rows: icon/initial, name, parent class, clamped description, edit/delete actions.
- Empty state when no rows match.
- Create/edit form in a dark modal or bottom sheet with fields for subclass name, parent class, and description.
- Save disabled until name and class are present.
- Delete confirmation explains existing-character impact.

## Design Translation

Do not copy the prototype CSS literally. Translate it into app-native patterns:

- Use `RailScreenShell` for the route shell.
- Use existing page header styling from `characters.tsx` and `spells.tsx`.
- Use `fantasyTokens` for colors, spacing, radii, typography, and motion. Avoid new inline hex values unless adding a token is clearly justified.
- Use parchment cards for list content, matching character-sheet and level-up card language.
- Use `FilterChipGroup` style language, but the manager needs a horizontal single-select chip row. Either create a small local `SubclassClassFilterChips` component or add a reusable single-select variant if another area will use it.
- Use `ConfirmDialog` for delete confirmation.
- For create/edit, prefer a React Native Paper `Portal` modal or a bottom-sheet component following `AddSpellSheet`/`LevelUpWizardSheet` styling. The prototype is bottom-sheet-like; implement as a modal sheet on phone and a centered/larger panel on tablet/web if simpler and consistent.
- Use Paper `TextInput` or the existing `TextField` style. Support multiline description with a character counter.
- Use `Ionicons` or existing icon conventions rather than embedding custom SVG. Current nav uses emoji strings, so a wand/sparkles emoji is acceptable if consistent with the rail style.

## Backend Plan

### 1. Add Soft Delete to `Subclass`

The current `CharacterClass.subclassRef` relation uses `onDelete: SetNull`. Hard-deleting a subclass would remove the existing character's subclass display. To match the prototype copy, add a soft-delete column:

```prisma
model Subclass {
  // existing fields...
  archivedAt DateTime?

  @@index([archivedAt])
}
```

Then:

- Filter `archivedAt: null` from all future-selection queries.
- Keep archived rows resolvable through existing `CharacterClass.subclassId` relations.
- Do not archive SRD rows; only current-user custom rows.

Migration/codegen sequence:

1. `bun db:migrate -- add_subclass_archived_at`
2. `bun db:generate`

If local Postgres is unavailable, write the SQL migration under `server/prisma/migrations/` and validate later.

### 2. Extend GraphQL Schema

Add manager-specific types and mutations in `server/schema.graphql`:

```graphql
type CustomSubclass {
    id: ID!
    value: String!
    classId: String!
    className: String!
    name: String!
    description: [String!]!
    features: [AvailableSubclassFeature!]!
    characterUsageCount: Int!
}

input ManagedCustomSubclassInput {
    classId: String!
    name: String!
    description: String!
}

type Query {
    customSubclasses(classIds: [String!]): [CustomSubclass!]!
}

type Mutation {
    createCustomSubclass(input: ManagedCustomSubclassInput!): CustomSubclass!
    updateCustomSubclass(id: ID!, input: ManagedCustomSubclassInput!): CustomSubclass!
    archiveCustomSubclass(id: ID!): Boolean!
}
```

Naming note: `CustomSubclassInput` already exists for character creation. Do not redefine it. Use a distinct manager input name like `ManagedCustomSubclassInput`.

`characterUsageCount` lets the delete confirm be more honest, e.g. "2 characters using it will keep the name." If this adds too much scope, omit it and use generic copy, but still implement soft delete.

After schema changes:

1. `bun server:codegen`
2. `bun app:codegen`

### 3. Implement Resolver Helpers

Add helpers near `server/resolvers/character/subclassReferences.ts` or split to `server/resolvers/character/customSubclassMutations.ts` if the file gets crowded.

Required rules:

- Every resolver must call `requireUser(ctx)`.
- Scope all manager operations by `ownerUserId`.
- Resolve parent class by `Class.srdIndex`, not display name or DB id.
- Trim inputs server-side.
- Require non-empty `name`, `description`, and `classId`.
- Reject attempts to edit/archive SRD rows or another user's rows.
- Keep `description` stored as a one-element `String[]`, matching existing custom subclass creation.
- Keep `srdIndex: null` for custom subclasses.
- Set `sourceBook` to a stable custom label if existing code has one; otherwise leave null.

Suggested implementation details:

- `customSubclassesForUser(userId, classIds?)`: return only `{ ownerUserId: userId, archivedAt: null }`, optionally filtered by `classRef.srdIndex in classIds`.
- Include `classRef`, `features` where `kind: SUBCLASS_FEATURE`, and `_count.characterClasses` or a separate count for usage.
- Sort by class name, then subclass name.
- `createCustomSubclass`: find parent `Class` by `srdIndex`; create row.
- `updateCustomSubclass`: `findFirst({ where: { id, ownerUserId: userId, archivedAt: null } })`; validate target class; update name, classId, description.
- `archiveCustomSubclass`: `update({ archivedAt: new Date() })` on owned active custom rows only.

Duplicate handling:

- The existing inline path finds an owned custom subclass by `(ownerUserId, classId, name)` and updates its description. For the manager, prefer the same semantic rule: reject duplicate active name per class for the same user, or update the existing row only when editing that same row.
- Without a DB unique constraint, enforce this in resolver logic. If future data integrity becomes important, add a partial unique index by hand for active rows, but Prisma cannot express partial unique indexes directly.

### 4. Update Existing Subclass Queries

Update `availableSubclassesForUser` and `loadVisibleSubclassReferences`:

- `availableSubclassesForUser`: include SRD rows and current-user rows where `archivedAt: null`.
- `loadVisibleSubclassReferences`: keep accepting SRD indices and custom IDs. For new submissions, do not allow archived custom subclasses as selectable values, unless the value is already attached to the edited character and the save flow needs to preserve it. Check current save behavior before deciding.
- `findOrCreateOwnedCustomSubclass`: ignore archived rows when matching by name; otherwise recreating a deleted name could unexpectedly revive a row.

### 5. Backend Tests

Extend Bun resolver tests:

- `customSubclasses` requires auth and scopes by `ownerUserId`.
- `customSubclasses` returns only active custom rows, not SRD rows and not archived rows.
- `createCustomSubclass` resolves class by `srdIndex` and creates an owned subclass.
- `updateCustomSubclass` rejects blank fields, SRD rows, archived rows, and other users' rows.
- `archiveCustomSubclass` sets `archivedAt` and does not delete the DB row.
- `availableSubclasses` excludes archived custom rows.
- Existing characters with archived subclass refs still return `subclassName` through field resolvers.

## Mobile Plan

### 1. Add Navigation Destination

Update `mobile-app/components/navigation/navigationConstants.ts`:

- Add `NAV_DESTINATIONS.subclasses = '/subclasses'`.
- Add `DRAWER_SCREEN_NAMES.subclasses = 'subclasses'`.
- Add drawer screen `{ name: 'subclasses', title: 'Custom Subclasses' }`.
- Add a library nav item:
  - label: `Subclasses`
  - icon: use a simple existing convention, e.g. `✨` or `🪄`
  - collapsed label: `Open custom subclasses`
- Update `isNavigationDestinationActive()` for `/subclasses`.

`mobile-app/app/(rail)/_layout.tsx` maps `DRAWER_SCREENS`, so adding the screen config should mount the route automatically once the file exists.

Update navigation tests:

- `ExpandedDrawer.test.tsx` expects "Subclasses".
- `CollapsedRail.test.tsx` expects the new collapsed item.
- Add active-state coverage for `/subclasses`.

Verification:

- Inspect `navigationConstants.ts` and confirm `/subclasses` appears in `NAV_DESTINATIONS`, `DRAWER_SCREEN_NAMES`, `DRAWER_SCREENS`, and `LIBRARY_NAV_ITEMS`.
- Confirm `isNavigationDestinationActive('/subclasses', NAV_DESTINATIONS.subclasses)` returns true and does not mark unrelated routes active.
- Run the navigation tests that cover `ExpandedDrawer` and `CollapsedRail`; they should pass with assertions for the new menu item and active state.
- Launch the app or use a route test to confirm the expanded drawer and collapsed rail both navigate to `/subclasses`.

### 2. Add GraphQL Documents

Add operations in `mobile-app/graphql/characterSheet.operations.ts` or a new `mobile-app/graphql/customSubclass.operations.ts`. If using a new file under `graphql/`, codegen already scans it.

Suggested docs:

```graphql
query CustomSubclasses($classIds: [String!]) { ... }
mutation CreateCustomSubclass($input: ManagedCustomSubclassInput!) { ... }
mutation UpdateCustomSubclass($id: ID!, $input: ManagedCustomSubclassInput!) { ... }
mutation ArchiveCustomSubclass($id: ID!) { ... }
```

Return fields should match the manager row plus enough data to update `availableSubclasses` cache:

- `id`
- `value`
- `classId`
- `className`
- `name`
- `description`
- `features { id name description level }`
- `characterUsageCount`

Cache approach:

- After create/update/archive, refetch `CustomSubclasses`.
- Also refetch or invalidate `AvailableSubclasses` if the user may immediately go into creation/level-up. The simplest reliable option is `client.refetchQueries({ include: [GET_AVAILABLE_SUBCLASSES, GET_CUSTOM_SUBCLASSES] })` where available, or explicit `refetch` from the screen and let creation/level-up fetch fresh on mount.
- Avoid complex normalized cache surgery until performance demands it.

Verification:

- Run `bun app:codegen` and confirm generated types exist for all new query and mutation documents.
- Confirm every document requests the fields the manager renders, including `id`, `value`, `classId`, `className`, `name`, `description`, `features`, and `characterUsageCount` when supported by the schema.
- Confirm no GraphQL documents are placed outside codegen's scanned paths unless `mobile-app/codegen.yml` is updated.
- In the screen or hook using these documents, confirm mutations refetch or invalidate both the manager list and available-subclass data so creation/level-up pickers do not show stale options.

### 3. Create Screen Route

Add `mobile-app/app/(rail)/subclasses.tsx`.

Screen responsibilities:

- Guard auth with `useSessionGuard`, matching `characters.tsx`.
- Redirect to sign-in on unauthenticated GraphQL errors using `isUnauthenticatedError`.
- Query `customSubclasses`.
- Hold local state:
  - selected class filter (`'all' | classId`)
  - form visibility
  - editing row id or null
  - delete candidate or null
  - mutation pending state
  - form draft `{ name, classId, description }`
- Render loading, error, empty, and list states.
- Use `MainContentFrame` if the list becomes too wide on tablet/laptop.

Recommended structure:

```tsx
<RailScreenShell>
  <View style={styles.container}>
    <View style={styles.header}>...</View>
    <MainContentFrame style={styles.frame}>
      <SubclassManagerCard ... />
    </MainContentFrame>
    <CustomSubclassFormSheet ... />
    <ConfirmDialog ... />
  </View>
</RailScreenShell>
```

Verification:

- Confirm `mobile-app/app/(rail)/subclasses.tsx` exists and is automatically included by the `(rail)` drawer route.
- Render the route in a screen test and verify the authenticated loading state, GraphQL loading state, error state, empty state, and populated list state.
- Simulate an unauthenticated GraphQL error and confirm the route redirects to `/(auth)/sign-in`.
- Confirm the screen uses `RailScreenShell`, existing header typography patterns, and `MainContentFrame` or equivalent width constraints for larger viewports.
- Confirm all local UI state resets correctly when closing and reopening create/edit/delete flows.

### 4. Build Manager Components

Keep components small and colocated under `mobile-app/components/subclasses/`:

- `SubclassManagerCard.tsx`
  - parchment panel
  - header label and add button
  - class chip row
  - list or empty state
- `SubclassListRow.tsx`
  - displays name, class, clamped description
  - edit/delete icon buttons
  - accessibility labels
- `CustomSubclassFormSheet.tsx`
  - create/edit form
  - title changes between `Create Subclass` and `Edit Subclass`
  - name field max length 100
  - description field max length 5000 and counter
  - class picker grid using `CLASS_OPTIONS`
  - Save disabled unless `name.trim()` and `classId` are present; if backend requires description, also disable until description is present
- `SubclassClassFilterChips.tsx`
  - `All` plus `CLASS_OPTIONS`
  - single-select, horizontal scroll
- `subclassManager.types.ts` or helper functions if the generated GraphQL shape is awkward.

Use `CLASS_OPTIONS` from `mobile-app/lib/characterCreation/options.ts` for labels and values. This keeps class IDs aligned with seeded SRD `srdIndex` values and avoids inventing another class list. If a future backend class query exists, revisit this.

Verification:

- Confirm the new components live under `mobile-app/components/subclasses/` and are small enough that the screen remains orchestration-focused.
- Confirm class labels and values come from `CLASS_OPTIONS`; do not duplicate or relabel class IDs in component-local constants.
- Test `SubclassClassFilterChips` with all classes plus `All`, including single-select behavior and horizontal scrolling on narrow screens.
- Test or manually verify `CustomSubclassFormSheet` create and edit modes: title, prefilled values, max lengths, counter, disabled Save state, and pending/error handling.
- Confirm component styling uses `fantasyTokens` and existing primitives rather than prototype CSS values or new magic spacing/color constants.

### 5. UI Details

List row:

- Icon: use subclass option icon if available from `SUBCLASS_OPTIONS[classId]` only for SRD names? For custom manager rows, a consistent `✨` is enough.
- Name: `fantasyTokens.typography.bodyLarge` or card title depending density.
- Parent class: `fantasyTokens.typography.buttonLabel`, muted ink.
- Description: clamp to two lines using `numberOfLines={2}`.
- Edit/delete buttons: `Pressable` with `Ionicons` (`create-outline`, `trash-outline`) or text symbols if the app avoids icon dependencies here.

Empty state:

- When no custom subclasses exist: "No custom subclasses yet." and "Tap Add to create your first one."
- When a class filter has no rows: "No [Class] subclasses yet." and "Try another class or add one."

Form:

- Pre-fill values when editing.
- Reset draft on open-create and after successful save.
- Keep unsaved form state local. Do not add global state.
- On mutation error, show a `Snackbar` or inline error in the sheet.
- Dismiss keyboard on sheet backdrop/tap where practical, following `AddSpellSheet` patterns.

Delete:

- Confirm text should reflect soft archive behavior:
  - No usage count: `"Name" will be removed from future subclass picks. Existing characters that use it will keep their subclass name.`
  - With usage count: `"Name" will be removed from future picks. 2 existing characters will keep their subclass name.`
- Confirm action calls `archiveCustomSubclass`.

Verification:

- Review the rendered screen on phone-width and tablet/laptop-width viewports; no row actions, filter chips, or sheet content should overlap or clip.
- Confirm long names and descriptions wrap or clamp as intended, with descriptions limited to two visible lines in list rows.
- Confirm every interactive control has an accessibility role/label and stable `testID` where screen tests need it.
- Confirm the empty-state copy changes correctly between no subclasses at all and no subclasses for the selected class filter.
- Confirm create/edit mutation errors are visible to the user and do not close the sheet.
- Confirm the delete dialog copy matches the soft-archive behavior and the confirm button calls `archiveCustomSubclass`, not a hard-delete mutation.

### 6. Integration With Character Creation and Level-Up

After backend filtering is updated, existing `useAvailableSubclasses` should pick up manager-created rows automatically.

Verify these flows:

- Create subclass in manager, then open character creation at a class/subclass-unlock level. The new subclass appears under that class.
- Create subclass inline during character creation. It appears in the manager after the character is created and data refetches.
- Create subclass inline during level-up, save the sheet, then manager shows it.
- Archive a subclass. It disappears from manager list and future pickers, but characters already using it still show `subclassName`.

Potential issue:

- Character sheet save may submit the current `subclassId`. If an existing character uses an archived subclass and the user saves unrelated sheet edits, the server must not reject that existing archived reference. Check `loadVisibleSubclassReferences` and save flow carefully before filtering archived rows too aggressively.

Verification:

- Create a custom subclass in the manager, then verify it appears in character creation for the matching parent class and not for other classes.
- Create a custom subclass in the manager, then verify it appears in the level-up subclass selection step for the matching class unlock level.
- Create a subclass inline during character creation, complete the character, and verify the manager lists that subclass after data refetch.
- Create a subclass inline during level-up, save the character sheet, and verify the manager lists that subclass after data refetch.
- Archive a custom subclass and verify it disappears from the manager list and future subclass pickers.
- Open or save an existing character that already used the archived subclass and verify `subclassName` still displays and unrelated sheet saves do not fail.

## Documentation Updates

Update docs in the same implementation pass:

- `docs/mobile-app.md`
  - Add `(rail)/subclasses.tsx` to the route tree.
  - Mention the new rail destination.
- `docs/data-model.md`
  - Document `Subclass.archivedAt` and soft-delete behavior.
  - Clarify custom subclasses are user-owned reference rows and can be created from manager or inline flows.
- `docs/features/character-creation.md`
  - Note that the subclass picker includes manager-created custom subclasses.
- `docs/features/level-up-wizard.md`
  - Note the same for subclass selection.
- Optional: add `docs/features/custom-subclasses.md` if implementation grows beyond a small paragraph in existing docs.

## Test Plan

Run focused tests first, then required type checks.

Backend:

- Add/extend `server/resolvers/characterResolvers.queries.test.ts`.
- Add a new mutation test file if manager mutations are separated.
- Run `bun server:test`.

Mobile unit tests:

- Navigation tests for drawer/rail.
- Screen test under `mobile-app/app/(rail)/__tests__/subclasses.test.tsx` covering:
  - loading state
  - empty state
  - filter chip behavior
  - open create sheet
  - save disabled/enabled rules
  - edit prefill
  - delete confirm calls archive mutation
  - unauthenticated redirect
- Component tests for form/list components if the screen test becomes too large.
- Run `bun app:test subclasses` or the relevant substring, then broader `bun app:test` if feasible.

Codegen/type checks:

- `bun server:codegen`
- `bun app:codegen`
- `cd server && tsc --noEmit`
- `cd mobile-app && tsc --noEmit`

Per project rule, fix type errors in files touched by this feature and ignore unrelated pre-existing errors only if clearly outside the touched files.

## Suggested Implementation Order

1. Add `Subclass.archivedAt` migration and update generated Prisma client.
2. Add GraphQL schema fields and run server/app codegen.
3. Implement backend query/mutations and resolver tests.
4. Update `availableSubclassesForUser`, `loadVisibleSubclassReferences`, and inline custom-subclass matching for archived rows.
5. Add mobile GraphQL operations.
6. Add navigation constants and drawer/rail tests.
7. Build the `subclasses.tsx` route with basic query/list/empty/error states.
8. Add create/edit sheet and mutations.
9. Add archive confirmation and mutation handling.
10. Verify integration with character creation and level-up.
11. Update docs.
12. Run focused tests, codegen, and both TypeScript checks.

## Edge Cases to Handle

- Blank or whitespace-only fields.
- Description length over 5000 characters.
- Name over 100 characters.
- Duplicate active custom subclass name for the same class/user.
- Editing a subclass and changing its parent class while characters already use it.
  - Recommended behavior: allow it only if no characters use the subclass, or warn clearly. Safer first version: if `characterUsageCount > 0`, disable changing parent class during edit and explain why.
- Archiving an already archived subclass.
- Network/mutation errors.
- Refetching data after mutation without leaving stale rows visible.
- Long subclass names and descriptions on small screens.
- Tablet/laptop widths.
- Existing characters with archived subclass references.

## Open Product Decisions

These should be confirmed before implementation if possible, but the plan has safe defaults:

- Should editing the parent class be allowed for subclasses already used by characters?
  - Safe default: no; lock parent class when `characterUsageCount > 0`.
- Should description be required?
  - Existing level-up custom subclass validation requires a description. Safe default: require description for manager saves too, even though the prototype only disables save on name + class.
- Should archived subclasses be restorable?
  - Safe default: no restore UI in this first version. Keep the DB row for character display only.
- Should manager-created subclasses support feature definitions?
  - Prototype only includes name/class/description. Safe default: no feature editor in v1; features can still be created through existing level-up custom-feature flows.
