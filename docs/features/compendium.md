# Compendium

## Summary

The Compendium consolidates library browsing under one rail destination. Its hub contains eight categories: Classes, Subclasses, Spells, Races, Subraces, Backgrounds, Feats, and Languages. Traits remain embedded in their owning Classes, Races, and Subraces rather than becoming a standalone category.

Reference mockup: [`../mockups/compendium-mockup.html`](../mockups/compendium-mockup.html). The mockup demonstrates the shared fantasy styling and representative Classes manager; the implemented first phase enables Subclasses and Spells instead.

## Current behaviour

- The rail and expanded drawer expose **Compendium** (`📚`) at `/compendium` instead of separate Subclasses and Spells destinations.
- Every `/compendium/*` route keeps the Compendium rail item selected.
- The responsive hub displays all eight category cards. Subclasses and Spells are enabled; the remaining six are visibly marked as coming soon.
- Hub counts come from the authenticated `compendiumCounts` GraphQL aggregate, avoiding full content-list transfers. The hub refreshes cached totals from the network, and custom subclass mutations refetch the aggregate before returning to it.
- `/compendium/subclasses` retains the existing merged SRD/custom subclass manager and create/edit/archive flow.
- `/compendium/spells` retains the existing paginated spell search and filter interface.
- Category screens use a shared header and return to the hub with **Back to Compendium**.
- The obsolete `/subclasses` and `/spells` list routes have no redirects because the app has not been released.

## Future category managers

Add category managers only as their backend data and custom-content operations become available. Reuse established components where behaviour genuinely overlaps, but do not force Spells and Subclasses into one config-driven abstraction: their search, pagination, filters, and editing flows differ materially.

Draft fields for future managers:

| Type | Fields |
| --- | --- |
| Classes | name, hit die, primary ability, saving throw proficiencies, description, repeatable features |
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
- Compendium aggregate operation: `mobile-app/graphql/compendium.operations.ts`
- Spell browsing: `mobile-app/components/SpellList.tsx` and `mobile-app/components/SpellFilterDrawer.tsx`
- Aggregate counts: `server/resolvers/compendiumResolver.ts` and `Query.compendiumCounts`

## Out of scope for the first phase

- Custom-content tables and CRUD for the six future categories.
- A generic manager abstraction before another category demonstrates a concrete shared flow.
- Separate full-page detail routes beyond the existing spell detail screen.
