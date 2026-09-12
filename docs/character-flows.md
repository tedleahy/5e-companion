# Character creation and level-up flows

## Goal

Help players build and advance characters without enforcing one interpretation
of the rules. The app recommends the normal SRD choices, applies automatic
changes, and warns about unusual selections. Players can always choose a
custom value, skip a choice, or save despite a rules warning.

Database integrity and malformed input are still errors. A disagreement with
the D&D rules is not.

## One advancement flow

Character creation and level-up use the same advancement flow.

To create a character at level five, the app creates the level-one state and
then processes levels two through five in order. Leveling an existing
level-five character runs the same flow for level six. This keeps subclass,
feature, ability-score, hit-point, and spell decisions in their normal order.

The MVP guides single-class characters from levels 1 through 20. Multiclass
guidance is deferred, but players can represent multiclass or house-rule
characters through manual editing.

## Guidance, not enforcement

For each rules-based decision, the interface offers:

- the options supplied by the selected content
- an explanation of the normal rule and required choice count
- a custom option stored directly on the character without requiring a
  homebrew catalog record
- a way to skip the decision
- a warning when the result differs from the normal rule

Warnings never disable saving. Examples include choosing too many skills,
selecting a spell outside the class list, skipping a subclass, or failing a
listed prerequisite.

The app should not add campaign-wide house-rule settings for the first
version. Manual choices are the escape hatch. Add reusable campaign rules only
if players repeatedly make the same overrides.

## Character creation

1. Enter basic details, pick a token colour, select the rules version, and
   choose a starting level.
2. Choose a class. Use it to explain useful ability scores and later choices.
3. Choose a race and subrace when applicable.
4. Choose a background.
5. Set ability scores using the standard array or manual entry.
6. Process each class level from one to the chosen starting level.
7. Review the completed character and any warnings.
8. Confirm and save the character.

Each class level can include:

- automatic features and proficiency changes
- subclass selection
- feature choices
- ability-score increases or a manually selected feat
- hit-point increases using the fixed value, a roll, or manual entry
- spell additions, replacements, and preparation choices
- new or increased class resources

Level one also handles starting proficiencies, languages, equipment, and other
grants from the class, race, and background.

Changing an earlier answer marks dependent answers for review. The app does
not silently discard them. Advancement reconciles generated proficiencies,
languages, features, spell access paths, resources, and items by deterministic
grant keys. The review step shows additions, removals, and affected in-play
state before the player confirms.

## Character display

All of the current user's characters should be visible in a list. There should be a button to create a new character on that page.

Users should be able to tap a character to view its character details, similar to viewing a paper character sheet.

## Level-up

1. Start from the character's current saved state.
2. Show the automatic changes for the next level.
3. Ask only the questions introduced at that level.
4. Show the resulting character and any warnings.
5. Apply all changes together when the player confirms.

The player can leave the flow and resume later. An unfinished level-up must
not partly change the active character.

## Drafts and saved results

The flow stores an editable draft while it is in progress, in its own record
rather than on the character. Confirming the draft writes the actual chosen
values to the character, reconciles its advancement-managed rows, increments
the character lock version, and deletes the draft in one transaction.

A creation draft has no character attached; the character row is written only
when the player confirms, so a half-built character never appears in the
character list. A level-up draft points at the character being advanced but
never writes to it before confirmation, which is what keeps an unfinished
level-up from partly changing an active character. Cancelling either one is a
plain delete.

Characters store the player's selections and in-play state, but they do not
freeze a copy of every catalog rule. The sheet derives mechanics and generated
content from the current catalog, so an upstream import may change descriptions,
derived values, and generated actions on an existing character. It must not
replace selected catalog ids, saved names, manual values, or in-play state.
Where useful, a result records which class, race, background, feature, or manual
choice supplied it so the sheet can explain its origin.

## Reading catalog rules

The flow reads the normalized JSONB held by classes, subclasses, features,
races, backgrounds, and related catalog records. The importer converts source
references into an exact source key, content type, and external key rather than
retaining API URLs. Homebrew editors use the same reference shape. A picker may
show names, source names, and authors, but names never identify a target.

The user can select content from official sources, their own sources, and
sources explicitly shared with them. Saving a reference checks current read
access; the reference does not grant access. If a target later becomes
unavailable, the flow shows its saved display label, reports an unresolved
reference, and offers manual input. It never redirects to same-named content.

Every interpreted grant receives a deterministic key based on its owning
selection and normalized rule path. A manual result receives a generated key.
When the player rejects a generated result, the character stores a suppression
for that key so resuming or rerunning advancement does not add it back. The
review can restore a suppressed grant explicitly. Creation drafts keep these
suppressions provisionally in draft state and write them after creating the
Character; level-up drafts stage changes until confirmation.

The first implementation only needs to understand rule shapes present in the
SRD data used by the flow. Unknown or malformed shapes produce a visible
warning and a manual input instead of silently dropping the choice.

Guided creation does not require generic Choice, Requirement, or Grant tables.
Normalize a rule only when the application needs to query it independently or
the JSONB interpreter becomes measurably difficult to maintain.

## MVP scope

Included:

- SRD 2014 content
- single-class characters starting at any level from 1 through 20
- fixed grants and bounded choices
- race, subrace, background, class, and subclass guidance
- ability scores, hit points, proficiencies, equipment, features, and spells
- resumable drafts
- manual choices and non-blocking warnings at every step
- the same advancement logic for creation and later level-up

Deferred:

- guided multiclassing
- rules validation for arbitrary homebrew structures
- campaign or DM rule presets
- catalog revision pinning or frozen per-character rules snapshots
- build optimization or suggested character builds

Homebrew content can participate when it uses a rule shape the flow already
understands. Otherwise the app displays its text and asks the player to enter
the result manually.

## Completion checks

- A player can create an SRD character at levels 1, 5, and 20.
- A player can level an existing character using the same advancement logic.
- Automatic grants and normal choice counts match the imported SRD data.
- Two same-named records in different content sources always resolve to the
  selected source and record.
- Replacing an earlier race, class, or background reconciles generated rows
  without removing results still supplied by another origin.
- Manual rows survive reconciliation, and explicit suppression decisions remain
  effective until the player restores those grants.
- Every rules warning has an override or manual path.
- Canceling a draft leaves the saved character unchanged.
- Confirming a draft applies all of its changes together.
- Later catalog imports may change derived rules but do not rewrite saved
  choices, manual values, or in-play state.
