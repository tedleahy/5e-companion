# Compendium follow-up improvements

Browse-only polish from the first category launch. These items have been implemented and do not expand the scope into custom-content CRUD.

## Visual fidelity

- Race detail jump pills are in-page navigation controls. They scroll to Traits, Languages, Life & build, and Subraces.
- Subrace details use a parent → subrace inheritance diagram so the relationship reads faster than a fact grid.

## Test coverage

- Language category tests cover Standard/Exotic filtering, same-script peer selection (including when search would hide the peer), and `?value=` arrival.
- Race and subrace category tests cover `?value=` arrival and the cross-category pushes (`races` ↔ `subraces`).

## Data correctness

- Same-script peers require a recorded script. Null or blank script metadata means “unwritten / unknown”, not a shared script group.
