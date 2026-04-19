# Level-Up Wizard Manual Acceptance Test Checklist

Use this checklist to verify end-to-end functionality on a simulator/device.

**How to use:** For each scenario, enter edit mode on the character sheet, tap `Level Up`, complete the flow, confirm, then press `Done` to persist. Reload the sheet to verify persistence.

---

## Scenario 1: Same-class martial (e.g. Fighter 4 → 5)

- [ ] `Level Up` button visible in edit mode only
- [ ] Wizard opens with parchment styling matching prototype
- [ ] **Step 1 Choose Class**: current class shown with hit die info (e.g. "Level 4 → 5 · d10 Hit Die")
- [ ] **Step 2 Hit Points**: roll d10, reroll works, average button works, min 1 HP enforced for low-CON
- [ ] **Step 5 New Features**: Extra Attack appears in feature list
- [ ] **Step 9 Summary**: shows class/level change, HP gained, new feature
- [ ] Confirm updates sheet immediately (still in edit mode)
- [ ] Press `Done` → level, HP max, features persist after reload

**Notes:**

---

## Scenario 2: Same-class full caster (e.g. Wizard 3 → 4)

- [ ] **Step 3 ASI/Feat**: appears at level 4; allocate 2 points; +2 cap per ability; score ≤ 20 enforced
- [ ] Switch to feat mode; custom feat entry; optional +1 ability selector works
- [ ] **Step 6 Spellcasting**: wizard learn-2 flow; Add Spell sheet filtered to wizard spells of legal level
- [ ] Cantrip unlock (if applicable) appears
- [ ] Slot comparison shows old → new
- [ ] Summary lists ASI/feat + selected spells
- [ ] Confirm + Done: persisted spells appear in spellbook

**Notes:**

---

## Scenario 3: Same-class prepared caster (e.g. Cleric 2 → 3)

- [ ] **Step 6**: shows prepared-caster messaging (no forced selection)
- [ ] Slot comparison displays correctly
- [ ] Prepared limit updated on character sheet after Done

**Notes:**

---

## Scenario 4: Same-class warlock (e.g. Warlock 10 → 11)

- [ ] **Step 8 Class Resources**: pact slot changes, invocation count
- [ ] **Mystic Arcanum picker** appears at level 11 — cannot be skipped (Next blocked until selection)
- [ ] Add Spell sheet opens filtered to warlock + exact arcanum spell level (6th)
- [ ] Repeat for 12→13 (7th), 14→15 (8th), 16→17 (9th)
- [ ] **Invocation swap flow**: pick one existing invocation to swap out + one to swap in
- [ ] Summary shows: invocation gains, swaps, metamagic (N/A for warlock), arcanum
- [ ] Done: arcanum spell row appears with full SRD description; swap reflected in features

**Notes:**

---

## Scenario 5: New multiclass character (e.g. Fighter 3 → adding Wizard 1)

- [ ] Expand multiclass picker shows all SRD classes
- [ ] Prerequisite warnings informational, not blocking
- [ ] Switching back to default view resets to current class
- [ ] Step list recalculates when class changes
- [ ] **Step 7 Multiclass Proficiencies**: armour/weapon/tool proficiencies read-only; skill chips interactive if applicable
- [ ] Next blocked until required skill picks complete
- [ ] Summary + Done: new class row persists, proficiencies in traits, spell slots recalculated

**Notes:**

---

## Scenario 6: Subclass unlock level (e.g. Fighter 2 → 3)

- [ ] **Step 4 Subclass Selection**: SRD subclass options visible
- [ ] Custom subclass branch: name + description entry
- [ ] Custom subclass features prompt appears where expected
- [ ] After Done: custom subclass persists and reappears if chosen again
- [ ] Subsequent level-ups show subclass features in Step 5

**Notes:**

---

## Scenario 7: ASI level (any class at 4/8/12/16/19)

- [ ] ASI/feat step only shown at eligible levels
- [ ] Points counter: 2 total, updates on +/-
- [ ] Disabled +/- at boundaries (0 remaining, score 20)
- [ ] Feat mode preserves entered values while in that mode

**Notes:**

---

## Scenario 8: Level-20 edge case

- [ ] Character at total level 20: `Level Up` button hidden in header
- [ ] If forced open: in-flow guard blocks progression
- [ ] Attempting to level past 20 not possible through any path

**Notes:**

---

## Cancellation & Dismiss Polish

- [ ] Close button on clean wizard: dismisses immediately
- [ ] Close button on dirty wizard: shows "Discard level-up changes?" alert
- [ ] Backdrop tap: same discard-confirm policy when dirty
- [ ] Swipe-down dismiss: same discard-confirm policy when dirty
- [ ] Back button past Step 1: same discard behaviour
- [ ] Keep Editing: wizard stays open, state preserved
- [ ] Discard: wizard closes, no changes applied

**Notes:**

---

## Accessibility & Polish

- [ ] Prerequisite warnings have ⚠ icon and announce as alerts
- [ ] OptionPickerList: screen reader says "Unselect" when selected
- [ ] Selection status ("selected", "unavailable") announced
- [ ] Read more/Show less has accessibilityRole + expanded state
- [ ] Visuals match `level-up-wizard-prototype.html` on phone + tablet widths

**Notes:**

---

## Persistence Regression

After Done for each scenario:

- [ ] Exit edit mode → values remain
- [ ] Close and reopen character sheet → values persist
- [ ] Class rows, HP, features, spells, slots, hit dice all correct
- [ ] Already-spent hit dice / slot usage preserved across level-up (not reset)

**Notes:**

---

## Additional Findings / Bugs Found

Document any issues discovered during manual testing here. Include:
- Scenario being tested
- Expected behaviour
- Actual behaviour
- Steps to reproduce

| Bug # | Scenario | Description | Status |
|-------|----------|-------------|--------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

*Checklist created from level-up-wizard-remaining-work-session-plan.md Session R6 acceptance scenarios.*
