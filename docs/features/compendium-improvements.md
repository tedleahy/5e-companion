# Compendium follow-up improvements

Browse-only polish from the first category launch. These items have been implemented and do not expand the scope into custom-content CRUD.

## Visual fidelity

- Race detail jump pills are in-page navigation controls. They scroll to Traits, Languages, Life & build, and Subraces.
- Subrace details use a parent → subrace inheritance diagram so the relationship reads faster than a fact grid.

## Test coverage

- Language category tests cover Standard/Exotic filtering, same-script peer selection (including when search would hide the peer), and `?value=` arrival.
- Race and subrace category tests cover `?value=` arrival and the cross-category pushes (`races` ↔ `subraces`).

## Data correctness

- Same-script peers require a recorded script. Null or blank script metadata means “unwritten / unknown”, not a shared script group. The rule lives in `shared/compendium/languageScript.ts` so the resolver and the screen cannot drift.
- `abilitySummary` and `prerequisiteSummary` are nullable rather than carrying sentinel text, so empty-state wording belongs to whichever sentence renders it.

## Review follow-ups

A review of the first launch found and fixed:

- Background starting-equipment choice groups rendered a doubled prefix (“Choose: Choose 1: 1× Holy Symbols”). The renderer now owns the single prefix, and the test fixture is built from what `backgroundSeedPayload` actually emits.
- Language and background details printed the same paragraph twice. The language hero now carries the typical-speakers lede from the design; the background hero omits a summary, since SRD backgrounds have no narrative description.
- The suggested-characteristics disclosure rendered an empty “0 personality traits · 0 ideals …” shell for backgrounds with no prompts.
- `featDescriptionParts` removed the lead paragraph by value, dropping every identical copy; it now splits by position.
- Selecting a subrace parent and then hiding SRD rows stranded the user on an empty list; an unavailable parent falls back to All.
- Same-script peer jumps used to clear the user's search and filters, because the shell resolved the open detail from filtered rows.
- Races ↔ subraces cross-links used `push`, growing the stack without bound.
- The five screens shared ~180 lines of duplicated shell, now `useCompendiumBrowse`.
- The presentation modules holding that branchy logic had no direct tests.
