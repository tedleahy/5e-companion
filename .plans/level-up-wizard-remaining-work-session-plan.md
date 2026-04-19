# Level-Up Wizard Remaining Work Session Plan

This plan breaks the remaining level-up wizard work into small, reviewable sessions that can be run in separate agent runs.

Use this plan alongside:
- `level-up-wizard-session-plan.md`
- `level-up-wizard-implementation-plan.md`
- `level-up-wizard-prototype.html`

## Goal

Finish the remaining gaps so the level-up wizard matches the implementation plan/prototype expectations and is ready for final review.

## Remaining gaps to close

- Ensure advanced warlock choices (especially Mystic Arcanum) cannot be skipped due to step-assembly conditions.
- Make warlock invocation swap behaviour real (not UI-only text entry).
- Replace Mystic Arcanum free-text entry with Add Spell picker integration filtered to legal spells.
- Complete cancellation/dismiss polish (including back-from-step-1 behaviour and swipe-down parity).
- Close prototype/accessibility polish gaps and run a full regression sweep.

---

## Session R1: Step-assembly and level-cap hardening [Done]

Scope:
- Fix step-assembly so `class_resources` appears whenever advanced class choices are required, even if baseline resource values do not change.
- Add an in-flow guard for the level-20 cap (defensive check in wizard flow, not just entry-point hiding).
- Add/expand regression tests for warlock levels 11/13/15/17 to ensure Mystic Arcanum cannot be skipped.

Likely files:
- `mobile-app/lib/characterLevelUp/stepAssembly.ts`
- `mobile-app/lib/characterLevelUp/advancedClassChoices.ts`
- `mobile-app/hooks/useLevelUpWizard.ts`
- `mobile-app/app/(rail)/__tests__/character-sheet.level-up.test.tsx`
- `mobile-app/lib/__tests__/characterLevelUpStepAssembly.test.ts`

Automated verification:
- `yarn test characterLevelUpStepAssembly.test.ts`
- `yarn test characterLevelUpAdvancedClassChoices.test.ts`
- `yarn test character-sheet.level-up.test.tsx`

Manual test:
- Level a warlock at 10->11 and confirm class resources step appears and blocks continue until arcanum selection is made.
- Verify level-20 character cannot progress level-up even if sheet open is forced.

Stop when:
- Advanced warlock pickers are guaranteed reachable/required by step flow.
- Level-cap behaviour is guarded in-flow and covered by tests.

---

## Session R2: Invocation swap implementation (real data flow) [Done]

Scope:
- Replace free-text invocation swap inputs with structured selection:
  - pick one existing invocation to swap out
  - pick one legal replacement invocation (SRD/custom)
- Ensure swap is represented in summary and applied to draft features correctly.
- Ensure swap survives `Done` persistence through existing save path.

Likely files:
- `mobile-app/components/character-sheet/level-up/LevelUpInvocationSwapSection.tsx`
- `mobile-app/components/character-sheet/level-up/LevelUpClassResourcesStep.tsx`
- `mobile-app/hooks/useLevelUpWizard.ts`
- `mobile-app/lib/characterLevelUp/advancedClassChoices.ts`
- `mobile-app/lib/characterLevelUp/draftApplication.ts`
- `mobile-app/components/character-sheet/level-up/LevelUpSummaryStep.tsx`
- `mobile-app/components/character-sheet/level-up/__tests__/LevelUpClassResourcesStep.test.tsx`
- `mobile-app/lib/__tests__/characterLevelUpDraftApplication.test.ts`
- `mobile-app/app/(rail)/__tests__/character-sheet.level-up.test.tsx`

Automated verification:
- `yarn test LevelUpClassResourcesStep.test.tsx`
- `yarn test characterLevelUpDraftApplication.test.ts`
- `yarn test character-sheet.level-up.test.tsx`

Manual test:
- Warlock level-up with swap path: choose swap-out, choose swap-in, confirm, press Done, reload sheet, verify resulting invocation feature rows.

Stop when:
- Swap affects persisted character data, not just local visual state.
- Summary and tests reflect swap-out + swap-in semantics.

---

## Session R3: Mystic Arcanum Add Spell integration [Done]

Scope:
- Replace `LevelUpMysticArcanumPicker` text field with Add Spell sheet integration.
- Enforce filters for warlock class and exact arcanum spell level.
- Keep selection-limit of one and prevent invalid picks.
- Ensure selected spell appears in summary and draft features with stable naming.

Likely files:
- `mobile-app/components/character-sheet/level-up/LevelUpMysticArcanumPicker.tsx`
- `mobile-app/components/character-sheet/level-up/LevelUpClassResourcesStep.tsx`
- `mobile-app/hooks/useLevelUpWizard.ts`
- `mobile-app/components/character-sheet/level-up/__tests__/LevelUpClassResourcesStep.test.tsx`
- `mobile-app/app/(rail)/__tests__/character-sheet.level-up.test.tsx`

Automated verification:
- `yarn test LevelUpClassResourcesStep.test.tsx`
- `yarn test character-sheet.level-up.test.tsx`

Manual test:
- Warlock 10->11, 12->13, 14->15, and 16->17; verify only legal arcanum-level spells can be selected.

Stop when:
- Mystic Arcanum uses the same spell selection UX pattern as other spell picks.
- Illegal/empty choices are blocked consistently.

---

## Session R4: Cancellation and dismiss parity polish [Done]

Scope:
- Add swipe-down dismiss parity for the sheet (or migrate to existing shared bottom-sheet primitive if that is cleaner).
- Ensure all dismiss paths share one discard-confirm policy.

Likely files:
- `mobile-app/components/character-sheet/level-up/LevelUpWizardSheet.tsx`
- `mobile-app/app/(rail)/character/[id].tsx`
- `mobile-app/app/(rail)/__tests__/character-sheet.level-up.test.tsx`

Automated verification:
- `yarn test character-sheet.level-up.test.tsx`

Manual test:
- Verify close button, backdrop tap, and swipe-down all show the same discard behaviour when dirty.
- Verify clean wizard dismisses immediately via all paths.

Stop when:
- Dismiss UX matches plan requirements for all close routes.

### Completion notes
Changes:
1. Created useLevelUpWizardSheetMotion.ts - A new hook that handles:
   - Animated sheet entry/exit with translateY
   - Animated backdrop fade with opacity
   - Swipe-down pan gesture using react-native-gesture-handler
   - Scroll position tracking for drag-to-dismiss behavior
   - Test environment detection to skip animations for reliable tests
2. Updated LevelUpWizardSheet.tsx:
   - Integrated the motion hook for animations
   - Wrapped sheet in GestureDetector for swipe-down support
   - Unified all dismiss paths (close button, backdrop press, swipe-down) to use requestSheetClose
   - All dismiss paths now delegate to the parent's onClose handler which already handles dirty-check confirmation
3. Added tests:
   - New test for backdrop dismiss behavior on dirty wizard
   - Verified that backdrop and close button share the same discard-confirm policy

---

## Session R5: Prototype + accessibility polish [Done]

Scope:
- Align remaining visual details with prototype (button placement/label treatment, choose-class card details, warning affordance/copy).
- Tighten accessibility labels/states for step controls and pickers.
- Review empty/error messaging where needed.

Likely files:
- `mobile-app/components/character-sheet/CharacterSheetHeader.tsx`
- `mobile-app/components/character-sheet/level-up/LevelUpWizardStepBody.tsx`
- `mobile-app/components/character-sheet/level-up/LevelUpWizardSheet.tsx`
- `mobile-app/components/character-sheet/level-up/*.tsx` (as needed)
- `mobile-app/app/(rail)/__tests__/character-sheet.level-up.test.tsx`

Automated verification:
- `yarn test character-sheet.level-up.test.tsx`
- Run targeted component tests touched by changes

Manual test:
- Compare screen-by-screen against `level-up-wizard-prototype.html` on both phone and tablet widths.

Stop when:
- UI deltas are intentional and documented, not accidental.
- Accessibility labels/states are coherent across the flow.

### Completion Notes
Changes:
1. Updated LevelUpWizardStepBody.tsx:
   - Added hit die info to current class card (e.g., "Level 10 -> 11 · d6 Hit Die")
   - Added warning icon (⚠) and accessibilityRole="alert" to prerequisite warnings
   - Added proper accessibility label that announces the warning content
2. Updated OptionPickerList.tsx:
   - Improved accessibility labels to say "Unselect" when option is selected
   - Include selection status ("selected", "unavailable") in accessibilityLabel
   - Added accessibilityRole and accessibilityState.expanded to Read more/Show less buttons
   - Added descriptive labels for the expand/collapse actions

---

## Session R6: Final regression and readiness pass [Done]

### Completion notes

Changes:
1. Fixed failing backend test in `server/resolvers/characterResolvers.restMutations.test.ts`:
   - Added missing `classRef` and `isStartingClass` properties to the `characterClassFindManyMock` test data
   - The `longRest` resolver expects these fields when mapping class rows for hit dice recovery

Automated verification results:
- `yarn test character-sheet.level-up.test.tsx` - 62 tests passed
- `yarn test LevelUpClassResourcesStep.test.tsx` - 33 tests passed
- `yarn test characterLevelUpSpellcasting.test.ts` - 5 tests passed
- `yarn test characterLevelUpAdvancedClassChoices.test.ts` - 79 tests passed
- `yarn test characterLevelUpDraftApplication.test.ts` - 8 tests passed
- `bun test server/resolvers/characterResolvers.saveCharacterSheetMutation.test.ts` - 7 tests passed
- `bun test server/resolvers/characterResolvers.restMutations.test.ts` - 7 tests passed (previously failing)

All level-up wizard related tests are now passing.

---

## Session R6: Final regression and readiness pass [Done - see above]

Scope:
- Run end-to-end acceptance scenarios from the original chunk-12 checklist.
- Run broader automated suites for touched mobile and server areas.
- Add regression tests for any bugs found during acceptance.
- Update `level-up-wizard-session-plan.md` status to reflect completion.

Acceptance scenarios:
- same-class martial
- same-class full caster
- same-class prepared caster
- same-class warlock
- new multiclass character
- subclass unlock
- ASI level
- level-20 edge case

Automated verification:
- `yarn test character-sheet.level-up.test.tsx`
- `yarn test LevelUpClassResourcesStep.test.tsx`
- `yarn test characterLevelUpSpellcasting.test.ts`
- `yarn test characterLevelUpAdvancedClassChoices.test.ts`
- `yarn test characterLevelUpDraftApplication.test.ts`
- `bun test server/resolvers/characterResolvers.saveCharacterSheetMutation.test.ts`

Stop when:
- No known level-up wizard gaps remain.
- Session plan and tests document the final expected behaviour.

---

## Suggested prompt per session

```md
Implement Session RX from level-up-wizard-remaining-work-session-plan.md.
Use level-up-wizard-session-plan.md, level-up-wizard-implementation-plan.md, and level-up-wizard-prototype.html as spec context.
Make code changes, run relevant tests, and stop for manual testing.
```
