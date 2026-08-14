# Compendium

## Summary

The Compendium consolidates library browsing under one rail destination. Its hub contains eight categories: Classes, Subclasses, Spells, Races, Subraces, Backgrounds, Feats, and Languages. Traits remain embedded in their owning Classes, Races, and Subraces rather than becoming a standalone category.

Reference mockup: [`../mockups/compendium-mockup.html`](../mockups/compendium-mockup.html).

## Current behaviour

- The rail and expanded drawer expose **Compendium** (`📚`) at `/compendium` instead of separate Subclasses and Spells destinations.
- Every `/compendium/*` route keeps the Compendium rail item selected.
- The responsive hub displays all eight category cards. Classes, Subclasses, and Spells are enabled; the remaining five are visibly marked as coming soon.
- Hub counts come from the authenticated `compendiumCounts` GraphQL aggregate, avoiding full content-list transfers. The hub refreshes cached totals from the network, and custom subclass mutations refetch the aggregate before returning to it.
- Authenticated browse APIs now return complete, owner-scoped Race, Subrace, Background, Feat, and Language payloads for the forthcoming screens. Each row exposes `value: srdIndex ?? id`; promoted fields are typed at the GraphQL boundary, and usage counts include only the caller's characters. The mobile query documents exist, but the five hub cards remain disabled until their shared collection UI and routes land.
- `/compendium/subclasses` retains the existing merged SRD/custom subclass manager and create/edit/archive flow.
- `/compendium/classes` browses merged SRD and current-user custom classes. Its detail view includes core rules, proficiencies, equipment, level progression, features, and the explicit spell list. `customClasses` returns lightweight summaries for list/refetch use; full definitions load via `classDetails` (detail/edit) or `attachedClassDetails` (selected or character-attached customs during level-up). Starting-equipment definitions are reference metadata only and are not automatically written to character inventory. Shared custom-class payload limits cap name/description/emoji text, equipment and feature text/counts, proficiency rules, and spell-list size at both the API and editor.
- Creating or editing a custom class opens `CustomClassEditor` as a Portal-backed parchment bottom sheet (drag handle, backdrop, drag-to-dismiss) mounted from the `/compendium/classes` screen rather than a dedicated route — matching the level-up wizard shell. The floating add action opens it in create mode; the custom class detail view's **Edit class** opens it seeded from the already-loaded class details. It is a six-stage editor: Identity includes the class emoji shown by class pickers; the Proficiencies stage uses Starting/Multiclass tabs with per-category accordions (Armor, Weapons, Skills, Tools, Other): always-granted × chips plus an optional pick-N pool toggled per category. Enabled empty pools and disabled/restorable pools live in the draft, survive stage navigation, and block continuation until enabled pools have an option; restored pools receive an unused group ID. Multiclass ability prerequisites use OR within each group and AND between groups in both Review and level-up warnings. The stage uses a `proficiencies` reference query rather than free-text `srdIndex` syntax; the Equipment stage uses the same fixed-grant / choice-group pattern with name and quantity fields instead of a pipe-delimited DSL and labels starting gear as reference-only; the Progression stage uses a collapsible 1–20 level map (summary chip when collapsed; ASI / slots heatmap when open) to jump between levels, with a per-level detail panel for ASI, mode-aware spell-slot controls (nine-level stepper grid for `STANDARD`, slot level + count for `PACT_MAGIC`), and steppers for cantrips known, spells known, and prepared base (unset counts display as 0). Class-wide caster settings (spellcasting ability and whether prepared spells add the ability modifier) sit above the level map. Advancing exactly one level via the map automatically prefills an untouched next level when the previous level has spell slots or known/prepared counts (ASI is not copied), then shows a dismissible "Copied from level N" banner with Undo. Empty progression and non-caster level changes remain silent. Casters also get an explicit **Copy from previous level** action that overwrites the current level. The Features stage lists class features as level-badged cards (name, description, 1–20 level stepper) with an empty state and dashed add control, and for casters builds the class spell list with the shared `AddSpellSheet` picker (search/filter, no default class filter) and removable level-tagged selection pills rather than free-text spell IDs. The Review stage shows a sectioned summary (Identity, Proficiencies, Equipment, Progression, Features/Spells) with **Edit ›** jump-backs to each prior stage; when mechanics are locked it reminds that only descriptive fields will update. A class used by a character exposes the server lock reason and permits only the emoji, description, and existing feature name/text changes. A dirty draft prompts a discard confirmation on close (via handle drag, backdrop tap, Cancel, or hardware back). Opening the sheet starts a new editor session; equivalent `initial` object identities from parent rerenders do not wipe unsaved edits. Saving keeps the current detail selection and refetches class data. The API validates grouped proficiency/equipment choices (positive integer group/count, one consistent count per group, unique options, count ≤ options), rejects invalid Pact Magic rows and duplicate proficiency rules with domain errors, resolves proficiency refs only as global SRD (`ownerUserId: null`) or caller-owned custom IDs, and enforces race-safe per-owner case-insensitive uniqueness for active custom class names (and the same policy for active custom subclasses) via partial unique indexes.
- Archiving a class also archives its owned subclasses. Archived definitions disappear from future pickers but remain valid on an existing character during sheet saves. Active custom class and subclass names are unique per owner (case-insensitive) via a database partial unique index; concurrent duplicate creates surface as domain errors.
- `/compendium/spells` retains the existing paginated spell search and filter interface.
- Category screens use a shared F3 codex-bar header: a gold shortsword over a fixed **Back** caption (accessibility label still names the destination), centred eyebrow/title, and a matching empty right slot. Pressing it returns through protected history when available, with a hub replacement fallback for direct entry. Class and subclass detail chrome reuse the same control in claret (`ink`) on parchment. On phone layouts, `RailScreenShell` omits the compact hamburger on these top-level category routes so it does not cover the Back control; the Compendium hub and non-Compendium routes keep the hamburger, and tablet layouts keep the persistent collapsed rail.
- The obsolete `/subclasses` and `/spells` list routes have no redirects because the app has not been released.

## Future category managers

Browse-only list and detail for Races, Subraces, Backgrounds, Feats, and Languages is specified in [`../mockups/compendium-remaining-screens-plan.html`](../mockups/compendium-remaining-screens-plan.html). Schema promotion and typed browse APIs are complete; that brief remains the source of truth for the shared `CompendiumCollection` shell and design-faithful screens. Custom CRUD stays out of scope.

Do not force Spells and Subclasses into that collection shell: their search, pagination, filters, and editing flows differ materially.

Draft fields for those browse screens:

| Type | Fields |
| --- | --- |
| Races | name, size, speed, ability score increases, embedded traits, description |
| Subraces | name, parent race, ability score increases, embedded traits, description |
| Backgrounds | name, skill proficiencies, tool/language proficiencies, equipment, feature, description |
| Feats | name, prerequisite, description |
| Languages | name, script, typical speakers, description |

## Implementation map

- Hub and nested routes: `mobile-app/app/(rail)/compendium/`
- Shared Compendium UI: `mobile-app/components/compendium/`
- Navigation metadata: `mobile-app/components/navigation/navigationConstants.ts`
- Subclass operations: `mobile-app/graphql/customSubclass.operations.ts`
- Class operations and editor: `mobile-app/graphql/class.operations.ts` and `mobile-app/components/classes/`
- Compendium aggregate operation: `mobile-app/graphql/compendium.operations.ts`
- Browse operations: `mobile-app/graphql/{race,subrace,background,feat,language}.operations.ts`
- Spell browsing: `mobile-app/components/SpellList.tsx` and `mobile-app/components/SpellFilterDrawer.tsx`
- Browse queries and aggregate counts: `server/resolvers/compendiumResolver.ts`

## Out of scope for the first phase

- Custom-content tables and CRUD for the five future categories.
- A generic manager abstraction before another category demonstrates a concrete shared flow.
- Separate full-page detail routes beyond the existing spell detail screen.
