# Compendium

## Summary

The Compendium consolidates library browsing under one rail destination. Its hub contains eight categories: Classes, Subclasses, Spells, Races, Subraces, Backgrounds, Feats, and Languages. Traits remain embedded in their owning Classes, Races, and Subraces rather than becoming a standalone category.

Reference mockup: [`../mockups/compendium-mockup.html`](../mockups/compendium-mockup.html).

## Current behaviour

- The rail and expanded drawer expose **Compendium** (`📚`) at `/compendium` instead of separate Subclasses and Spells destinations.
- Every `/compendium/*` route keeps the Compendium rail item selected.
- The responsive hub displays all eight category cards. Classes, Subclasses, and Spells are enabled; the remaining five are visibly marked as coming soon.
- Hub counts come from the authenticated `compendiumCounts` GraphQL aggregate, avoiding full content-list transfers. The hub refreshes cached totals from the network, and custom subclass mutations refetch the aggregate before returning to it.
- `/compendium/subclasses` retains the existing merged SRD/custom subclass manager and create/edit/archive flow.
- `/compendium/classes` browses merged SRD and current-user custom classes. Its detail view includes core rules, proficiencies, equipment, level progression, features, and the explicit spell list.
- `/compendium/classes/new` and `/compendium/classes/[id]/edit` are full-screen six-stage editors. Standard casters can configure each level's prepared-spell base and whether to add the spellcasting ability modifier. A class used by a character exposes the server lock reason and permits only description and existing feature name/text changes.
- Archiving a class also archives its owned subclasses. Archived definitions disappear from future pickers but remain valid on an existing character during sheet saves.
- `/compendium/spells` retains the existing paginated spell search and filter interface.
- Category screens use a shared header and return to the hub with **Back to Compendium**.
- The obsolete `/subclasses` and `/spells` list routes have no redirects because the app has not been released.

## Future category managers

Add category managers only as their backend data and custom-content operations become available. Reuse established components where behaviour genuinely overlaps, but do not force Spells and Subclasses into one config-driven abstraction: their search, pagination, filters, and editing flows differ materially.

Draft fields for future managers:

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
- Spell browsing: `mobile-app/components/SpellList.tsx` and `mobile-app/components/SpellFilterDrawer.tsx`
- Aggregate counts: `server/resolvers/compendiumResolver.ts` and `Query.compendiumCounts`

## Out of scope for the first phase

- Custom-content tables and CRUD for the five future categories.
- A generic manager abstraction before another category demonstrates a concrete shared flow.
- Separate full-page detail routes beyond the existing spell detail screen.
