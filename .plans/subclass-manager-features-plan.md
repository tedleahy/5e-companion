# Subclass Manager Feature Editing Plan

Add subclass feature display for every subclass and extend the existing custom subclass form so non-SRD subclasses can add, edit, and remove reusable feature definitions.

## Confirmed Direction

- **Feature UI location:** inside the existing `CustomSubclassFormSheet` create/edit sheet.
- **Supported actions:** add, edit, and remove feature rows for custom subclasses.
- **SRD rule:** SRD subclasses and SRD feature definitions remain read-only.
- **Data model:** reuse existing `Feature` rows with `kind: SUBCLASS_FEATURE`, `ownerUserId`, `classId`, and `subclassId`.

## Current State

- **Already returned by API:** `availableSubclasses` and `customSubclasses` both include `features { id name description level }`.
- **Already persisted elsewhere:** character-sheet save can create custom subclass feature definitions through `findOrCreateOwnedCustomSubclassFeature`.
- **Missing manager behavior:** `SubclassListRow` only renders subclass description, and `ManagedCustomSubclassInput` only saves `classId`, `name`, and `description`.

## Implementation Plan

1. **Render feature lists in manager rows**
   - Update expanded `SubclassListRow` details to show attached features ordered by level/name.
   - Include level labels, feature names, descriptions, and an empty state such as “No subclass features yet.”
   - Keep compact rows focused on subclass name/class/description.

2. **Extend GraphQL schema and resolver input**
   - Add `ManagedCustomSubclassFeatureInput` with optional `id`, required `name`, `description`, and `level`.
   - Extend `ManagedCustomSubclassInput` with `features: [ManagedCustomSubclassFeatureInput!]`.
   - Update create/update mutations to reconcile owned feature definitions transactionally.
   - Validate trimmed fields, max lengths, positive integer levels, duplicate feature names at the same level, and ownership.
   - On update, delete/remove omitted owned custom feature rows for that subclass.

3. **Preserve ownership and class invariants**
   - Every resolver path continues to call `requireUser(ctx)` and scope by `ownerUserId`.
   - Parent class is resolved by class `srdIndex`.
   - Only owned, active custom subclasses can mutate feature rows.
   - If a subclass has feature rows, changing parent class remains blocked unless the feature list is emptied first; update copy/UI to make this clear.
   - Feature `sourceLabel` should match the existing pattern: `${subclassName} ${className} ${level}`.

4. **Add feature editing to the mobile form**
   - Extend `CustomSubclassFormDraft` with `features` draft rows.
   - Add repeatable feature cards inside `CustomSubclassFormSheet` with fields for level, name, and description.
   - Add controls for “Add Feature” and “Remove”.
   - Include feature rows in dirty-state comparison, validation, create variables, update variables, and edit prefill.
   - Use `fantasyTokens`; avoid inline colors/spacing except existing unavoidable patterns.

5. **Update generated types, tests, and docs**
   - Run `bun server:codegen` and `bun app:codegen` after schema changes.
   - Extend server resolver tests for create/update feature reconciliation, remove behavior, ownership rejection, and validation.
   - Extend mobile subclass screen tests for displaying SRD/custom features, adding/editing/removing feature draft rows, mutation variables, and locked class copy.
   - Update docs describing custom subclasses and manager-created feature definitions.

## Edge Cases

- **Blank feature fields:** reject or disable save when a feature row has missing name, description, or level.
- **Invalid level:** require an integer level >= 1.
- **Duplicate features:** reject duplicate `name + level` pairs within one subclass.
- **Class changes:** prevent class changes while saved feature definitions exist, matching existing server behavior.
- **Removed feature in use:** removing a reusable `Feature` row should not erase existing character feature text; existing `CharacterFeature` rows store their own name/source/description, while `featureId` can safely become null due to `onDelete: SetNull`.

## Verification

- **Focused backend:** `rtk bun server:test customSubclassManager` or the closest supported test substring.
- **Focused mobile:** `rtk bun app:test subclasses`.
- **Codegen:** `rtk bun server:codegen` and `rtk bun app:codegen`.
- **Required type checks:** `rtk bun tsc --noEmit` from `server/` and `mobile-app/`.

## Files Likely To Change Later

- `server/schema.graphql`
- `server/resolvers/character/customSubclassManager.ts`
- `server/resolvers/characterResolvers.ts` if exports change
- `server/resolvers/characterResolvers.customSubclassManager.test.ts`
- `server/resolvers/characterResolvers.testUtils.ts`
- `mobile-app/graphql/customSubclass.operations.ts`
- `mobile-app/components/subclasses/subclassManager.types.ts`
- `mobile-app/components/subclasses/CustomSubclassFormSheet.tsx`
- `mobile-app/components/subclasses/SubclassListRow.tsx`
- `mobile-app/app/(rail)/subclasses.tsx`
- `mobile-app/app/(rail)/__tests__/subclasses.test.tsx`
- Relevant docs under `docs/`

