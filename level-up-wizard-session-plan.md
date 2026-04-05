# Level-Up Wizard Session Plan

This file is the working delivery plan for implementing the feature described in `level-up-wizard-implementation-plan.md`, using `level-up-wizard-prototype.html` as the visual reference.

Use this file at the start of each new Codex session together with:
- `level-up-wizard-implementation-plan.md`
- `level-up-wizard-prototype.html`

## Implementation approach

Implement the feature in small, shippable chunks. After each chunk:
1. Codex implements the chunk.
2. Automated tests are run where practical.
3. Manual testing is done before moving on.
4. This file is updated with task status and any additional relevant info.

The aim is to keep every chunk independently reviewable and to avoid landing a large amount of unverified wizard logic at once.

## Project-specific decisions

These decisions are based on the current codebase, not just the feature spec.

- The wizard should be integrated into the existing character sheet route at `mobile-app/app/(rail)/character/[id].tsx`.
- Reuse the existing edit-mode model. Confirming a level-up should update the local character-sheet draft first, so the user still presses the existing `Done` action to persist the overall edit session.
- Prefer a dedicated local hook such as `useLevelUpWizard` over introducing Zustand. The current character sheet is driven by route-local hooks, and adding a global store just for this flow would be a step away from the existing architecture.
- Reuse existing sheet motion and overlay patterns from the add-spell sheet where sensible, but do not force an early abstraction if it slows down delivery.
- Reuse existing server-side multiclass and spell-slot derivation logic where possible. `server/resolvers/character/multiclassRules.ts` already contains important rules that should not be reimplemented differently in the mobile layer.
- The current `saveCharacterSheet` mutation does not persist class allocation changes, subclasses, spell-slot recalculation, or spellbook-level-up effects. A dedicated API/persistence chunk is required before the full flow can be considered complete.

## Current status

- Completed: Chunks 1-6
- Next recommended chunk: Chunk 7 `API and persistence foundation for level-up data`
- Current end-to-end state:
  - The wizard supports choose-class, hit points, ASI/feat, summary, and confirm into the local edit draft.
  - Confirming a level-up updates the character sheet immediately while staying in edit mode.
  - `Done` still only persists the fields supported by the existing `saveCharacterSheet` mutation.

## Delivery chunks

### Chunk 1: Wizard shell in the character sheet [Completed]

Scope:
- Add the `Level Up` button to the character sheet header in edit mode only.
- Open and close a new level-up bottom sheet from the character sheet route.
- Match the prototype’s overall shell structure:
  - grip handle
  - parchment sheet body
  - title, subtitle, step label
  - footer with `Back` and `Next`
- Use placeholder content for the body at this stage.

Likely files:
- `mobile-app/app/(rail)/character/[id].tsx`
- `mobile-app/components/character-sheet/CharacterSheetHeader.tsx`
- new level-up wizard shell components under `mobile-app/components/character-sheet/level-up/`
- `mobile-app/theme/fantasyTheme.ts`

Automated verification:
- Add or update a character-sheet route test covering:
  - button only visible in edit mode
  - tapping opens the sheet
  - dismiss closes the sheet

Manual test:
- Open a character sheet.
- Enter edit mode and confirm the `Level Up` button appears in the header.
- Exit edit mode and confirm the button disappears.
- Open the sheet and verify the shell visually matches the prototype direction.
- Close it via backdrop tap or close control if present.

Stop after this chunk when:
- The sheet opens reliably and is visually anchored in the right place.
- No wizard logic beyond simple open/close is implemented yet.

### Chunk 2: Wizard controller, step registry, and navigation [Completed]

Scope:
- Introduce a local wizard state hook and data model.
- Implement the step registry and dynamic step assembly.
- Wire progress label and progress segments to the assembled step list.
- Implement `Back`, `Next`, and final-step button state changes.
- Use simple placeholder step bodies for all possible steps first.

Key goal:
- Prove the wizard can assemble and navigate variable-length flows before building real step UIs.

Likely files:
- new `useLevelUpWizard` hook
- new step/type helpers under `mobile-app/lib/character-level-up/`
- wizard shell and progress components

Automated verification:
- Unit tests for step assembly helpers.
- Route/component test covering dynamic step count and navigation.

Manual test:
- Open the wizard and confirm the step count, current-step label, and progress bar update as you move forward/back.
- Verify the final button changes to confirm styling on the last step.
- Verify scrolling resets to top when moving between steps.

Stop after this chunk when:
- Navigation works across placeholder steps.
- Step list recalculation is supported in the controller, even if only mocked initially.

### Chunk 3: Step 1 `Choose Class` [Completed]

Scope:
- Build the default single-class view from the prototype.
- Add the expanded multiclass picker state.
- Show all SRD classes in the expanded picker.
- Implement multiclass prerequisite warnings as informational, not blocking.
- Recalculate the step list immediately when the selected class changes.

Notes:
- This chunk should keep the current class as the default selection.
- The expanded picker should reset cleanly back to the default view.

Automated verification:
- Unit tests for prerequisite checks and class-selection state transitions.
- Component test covering:
  - default single-class view
  - expanded picker
  - warning rendering
  - `Next` enabled/disabled rules

Manual test:
- Open the wizard on a single-class character and verify the default view is streamlined.
- Expand into multiclass mode and select different classes.
- Confirm warnings appear when prerequisites are not met, but `Next` still works.
- Switch back to the default view and verify selection resets to the current class.

Stop after this chunk when:
- Step 1 is feature-complete and drives the rest of the wizard state correctly.

### Chunk 4: Step 2 `Hit Points` [Completed]

Scope:
- Build the hit-die step UI.
- Implement roll and average selection.
- Enforce the min-1 HP gain rule.
- Show the HP gained breakdown panel after a roll or average pick.
- A lightweight animation is enough here; the polished Reanimated version can wait.

Automated verification:
- Unit tests for HP gain calculation.
- Component test covering roll, reroll, average, and min-1 behaviour.

Manual test:
- Level up with several classes that use different hit dice.
- Confirm the displayed die matches the selected class.
- Roll repeatedly and verify the result changes.
- Use average and verify the correct value is shown.
- Confirm low-CON scenarios still give at least 1 HP.

Stop after this chunk when:
- HP gain is captured in wizard state and can be shown later in summary.

### Chunk 5: Step 3 `ASI / Feat` [Completed]

Scope:
- Build the ASI vs feat choice cards from the prototype.
- Implement the ASI allocator with:
  - 2 points total
  - max +2 per ability
  - no score above 20
- Implement the custom feat entry form and optional +1 ability increase selector.
- Feed the resulting choice into wizard state.

Automated verification:
- Unit tests for ASI allocation rules.
- Component tests for:
  - switching between ASI and feat
  - disabled `+` and `-` controls
  - points remaining counter

Manual test:
- Verify ASI only appears at eligible class levels.
- Spend points across one or two abilities and confirm the counter updates correctly.
- Confirm ability scores at 20 cannot be raised.
- Switch to feat mode and verify the entered values persist while in that mode.

Stop after this chunk when:
- The wizard captures all core data needed for the first meaningful summary.

### Chunk 6: Summary step and local draft application [Completed]

Scope:
- Build the summary step UI using currently implemented data:
  - class/level change
  - HP gained
  - ASI or feat
- Implement confirm behaviour that applies level-up results to the local edit draft only.
- Do not attempt final persistence yet if the API path is not ready.

Important:
- This is the first end-to-end checkpoint.
- At this stage the user should be able to walk through a basic level-up and see the character sheet update underneath while still in edit mode.

Automated verification:
- Unit tests for draft-application helpers.
- Route test covering confirm and visible character-sheet changes.

Manual test:
- Complete a simple same-class level-up with HP and ASI/feat.
- Confirm the sheet updates immediately after confirm while staying in edit mode.
- Verify cancelling edit mode still discards the draft as normal.
- Verify pressing `Done` only persists what the current save mutation supports.

Stop after this chunk when:
- The mobile flow is coherent for the implemented steps.
- Any missing persistence gaps are clearly identified by real behaviour.

Implementation notes from completion:
- The summary step now renders:
  - class/level change
  - HP change
  - ASI details or feat details
- Confirm applies the level-up into the route-local character-sheet draft, then closes the sheet.
- The local draft now carries `level` and `classes` in addition to the previously editable fields so the header/class summary can update immediately after confirm.
- Feat mode currently adds a local feature row with `source='Feat'`, and an optional feat ability increase is applied to draft ability scores immediately.
- This is intentionally ahead of persistence: `mapCharacterSheetDraftToSaveInput(...)` still does not send level/class changes, so local level-up state is not fully saved by pressing `Done` yet.
- Automated coverage now includes:
  - pure draft-application tests
  - route coverage for confirm updating visible character-sheet state
- Known follow-up note:
  - the hit-points step animation produces React Native Animated `act(...)` warnings in Jest; tests pass, but this is a cleanup candidate if the warnings start obscuring failures.

### Chunk 7: API and persistence foundation for level-up data

Scope:
- Extend the save path or add a dedicated level-up mutation so the backend can persist:
  - class level changes and new multiclasses
  - subclass selection
  - recalculated spell slots
  - level-up-created features/feats
  - any other level-up state already applied locally
- Reuse existing server rules and derivation helpers instead of duplicating logic.
- Update mobile GraphQL types and hooks to use the new persistence path.

Why this is separate:
- The current `SaveCharacterSheetInput` is too limited for a full level-up confirm.
- This needs to be solved before the remaining advanced steps can be called complete.

Automated verification:
- Server resolver tests for the new mutation/input path.
- Mobile integration test for successful persistence and refetch/cache update.

Manual test:
- Perform a basic level-up, press confirm, then `Done`.
- Leave and reopen the character sheet.
- Verify class level, HP, features, and any other supported changes persisted.

Stop after this chunk when:
- The feature has a reliable persistence contract.

### Chunk 8: Subclass selection and new features

Scope:
- Implement Step 4 `Subclass Selection`.
- Implement Step 5 `New Class Features`.
- Decide the data source:
  - prefer existing seeded server reference data if it can be exposed cheaply
  - otherwise add a local typed data module for the wizard and keep it narrowly scoped
- Support the custom-subclass branch and the extra custom-feature entry flow.

Automated verification:
- Unit tests for subclass-choice-level detection and feature lookup.
- Component tests for subclass selection and feature rendering.

Manual test:
- Test a class that gains a subclass at level-up.
- Choose the SRD subclass and verify the correct later steps appear.
- Choose a custom subclass and verify the custom-feature prompt appears where expected.

Stop after this chunk when:
- Subclass selection and feature-display flows are stable for standard class progression.

### Chunk 9: Spellcasting updates

Scope:
- Implement Step 6 `Spellcasting Updates`.
- Cover:
  - slot comparison UI
  - spells-known / prepared-caster messaging
  - cantrip unlocks
  - wizard learn-2 flow
  - add-spell sheet integration for eligible spells only
- Reuse existing spellbook mutations/UI patterns where practical.

Notes:
- This chunk should lean on existing server multiclass and slot derivation logic.
- Keep filtering rules explicit so the add-spell sheet only offers legal selections for the current step.

Automated verification:
- Unit tests for spellcasting progression helpers.
- Component tests for each caster category:
  - wizard
  - known-spells caster
  - prepared caster
  - warlock
  - multiclass slot comparison

Manual test:
- Test at least:
  - wizard level-up with new spell selections
  - bard/sorcerer/ranger/warlock known-spell increase
  - cleric/druid/paladin prepared-spell message
  - multiclass caster slot recalculation

Stop after this chunk when:
- Spellcasting changes can be previewed, selected, summarised, and persisted.

### Chunk 10: Multiclass proficiencies and class resources

Scope:
- Implement Step 7 `Multiclass Proficiencies`.
- Implement Step 8 `Class Resource Updates`.
- Cover the base resource updates first:
  - Barbarian rage changes
  - Monk ki / martial arts / movement
  - Rogue sneak attack
  - Sorcery points
  - Warlock invocation count
- Add skill-choice UI where multiclass rules require it.

Automated verification:
- Unit tests for proficiency and resource progression helpers.
- Component tests for multiclass proficiency pickers and resource summary cards.

Manual test:
- Multiclass into at least one class with a skill choice.
- Confirm proficiencies appear in the wizard and are applied to the character on confirm.
- Level up a barbarian, monk, rogue, sorcerer, and warlock test character to verify resource changes.

Stop after this chunk when:
- The wizard covers the main rules-driven non-spell side effects of levelling.

### Chunk 11: Advanced pickers and edge-case rules

Scope:
- Implement:
  - warlock invocation selection and swap flow
  - sorcerer metamagic selection
  - warlock mystic arcanum spell selection
  - level-20 cap handling
  - final multiclass spell-slot edge cases
- Finish any remaining summary sections that depend on these choices.

Automated verification:
- Targeted unit tests for the advanced rule helpers.
- Component tests for each advanced picker.

Manual test:
- Verify advanced warlock and sorcerer level-up cases.
- Verify the wizard does not allow levelling beyond 20 total character levels.
- Verify summary output reflects these advanced choices.

Stop after this chunk when:
- All rule branches in the implementation plan are represented in the wizard.

### Chunk 12: Polish, cancellation, and final test sweep

Scope:
- Refine visuals to better match the HTML prototype.
- Upgrade die animation if needed.
- Add cancel/discard confirmation when dismissing a dirty wizard.
- Tighten accessibility labels, disabled states, and empty/error messaging.
- Add or expand tests across the full wizard.

Automated verification:
- Run the relevant mobile and server test suites for touched areas.
- Add regression coverage for any bugs found during manual testing.

Manual test:
- Run a full acceptance pass across:
  - same-class martial character
  - same-class full caster
  - same-class prepared caster
  - same-class warlock
  - new multiclass character
  - subclass unlock level
  - ASI level
  - level 20 edge case

Stop after this chunk when:
- The feature is ready for normal development review rather than step-by-step prototyping.

## Suggested session workflow

At the start of each new session:
1. Provide this file plus the implementation plan and HTML prototype.
2. State the next chunk number to implement.
3. Ask Codex to stop after code changes and verification for that chunk.
4. Manually test before moving to the next chunk.

Suggested prompt pattern:

```md
Implement Chunk N from level-up-wizard-session-plan.md.
Use level-up-wizard-implementation-plan.md and level-up-wizard-prototype.html as the spec.
Make the code changes, run the relevant tests, and then stop for manual testing.
```

## Risks to keep in mind

- The original implementation plan assumes a new wizard store, but the current app is route-local and draft-based. Keep the implementation aligned with the existing architecture unless a later chunk proves that insufficient.
- Spellcasting and multiclass rules already exist in server logic. Duplicating them in the mobile layer creates drift risk.
- Persistence is the largest architectural gap. Do not leave it until the very end.
- The add-spell sheet is a strong reuse candidate, but its current API may need light refactoring to support level-up-specific eligibility filters cleanly.
- Some steps depend on seeded reference data already present on the server. Prefer exposing and reusing that data rather than maintaining duplicate rule tables in multiple places.
