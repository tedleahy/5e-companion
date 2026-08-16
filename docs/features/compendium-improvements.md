# Compendium follow-up improvements

These are follow-up opportunities for the browse-only Compendium screens. They are not prerequisites for the current category launch and do not expand the scope into custom-content CRUD.

## Visual fidelity

- Make the race detail jump pills real in-page navigation controls, or present them as plain summary pills if they are intentionally non-interactive. The current design language suggests that “Traits”, “Languages”, “Life & build”, and “Subraces” are jump links.
- Give subrace details a clearer parent → subrace lineage treatment. The current fact grid communicates the values, but the design prototype’s inheritance diagram communicates the relationship faster.

## Test coverage

- Add category-level assertions for Standard/Exotic language filtering, same-script peer selection, and cross-category deep-link arrival. The shared shell has coverage, but the category tests should also prove their own filter and navigation wiring.

## Data correctness

- Do not group languages with a `null` script as same-script peers unless that is intentional. “Unwritten / unknown” describes missing script metadata, not necessarily a shared script.
