# Character Creation Flow

Reference doc for agents and developers working on character creation bugs/features.

When making changes to the character creation flow, please update this document to reflect the changes.

## Architecture Overview

The character creation wizard is an Expo Router nested layout at `mobile-app/app/characters/create/`. It uses a **React Context** (`CharacterDraftProvider`) to hold all in-progress state, wrapped in a **WizardShell** component that provides navigation chrome (progress bar, back/cancel/continue buttons).

```
_layout.tsx
  └─ CharacterDraftProvider        ← React Context holding the draft
       └─ WizardShell              ← header (progress bar, step dots, back/cancel), footer (CTA button)
            └─ <Stack />           ← Expo Router stack (slide_from_right animation)
                 ├─ index.tsx      ← Step 1: Identity (name + race)
                 ├─ race.tsx       ← (redirect to identity — kept for Expo Router)
                 ├─ class.tsx      ← Step 2: Class selection (level stepper, single-class default, multiclass opt-in)
                 ├─ abilities.tsx  ← Step 3: Ability scores
                 ├─ background.tsx ← Step 4: Background, alignment, personality
                 ├─ skills.tsx     ← Step 5: Skill proficiencies
                 └─ review.tsx     ← Step 6: Review + create
```

## Key Files

### Screen files (`app/characters/create/`)

| File | Step | Description |
|---|---|---|
| `index.tsx` | 1 - Identity | Character name (text input) and race selection via `OptionGrid` from `RACE_OPTIONS` |
| `race.tsx` | — | Redirect to identity step. Kept in place so Expo Router doesn't break if navigated to directly |
| `class.tsx` | 2 - Class | Level stepper (1-20), single-class selection via `OptionGrid` by default. Inline subclass picker when unlocked. For characters level 2+, offers a "Choose additional classes" prompt to enter multiclass mode with full allocation UI |
| `abilities.tsx` | 3 - Abilities | Toggle between Roll (4d6 drop lowest) and Point Buy modes. Also handles ASI (Ability Score Increase) allocation for higher levels |
| `background.tsx` | 4 - Background | Background selection (`OptionGrid`), alignment (3x3 grid), and personality trait text fields (traits, ideals, bonds, flaws) |
| `skills.tsx` | 5 - Skills | Saving throws (display-only, from starting class), background skills (locked), class skill picks (capped by `pick` count). Long-press for expertise toggle |
| `review.tsx` | 6 - Review | Read-only summary of all choices. Each section is tappable to jump back to its step for editing. "Create Character" triggers the GraphQL mutation |

### State management

| File | Purpose |
|---|---|
| `store/characterDraft.tsx` | `CharacterDraftProvider` context + `useCharacterDraft()` hook. Holds the full `CharacterDraft` type. Provides `updateDraft()` (partial merge), `setAbilityScore()`, `setAllAbilityScores()`, `toggleSkillProficiency()`, `toggleExpertise()`, `resetDraft()`, `hasDraftData()` |

### Wizard infrastructure

| File | Purpose |
|---|---|
| `components/wizard/WizardShell.tsx` | Wraps all steps. Manages navigation (back/next/cancel), progress bar, step dots. Calls `isCreateCharacterStepComplete()` to gate the Continue button. On the last step, calls `buildCreateCharacterInput()` then fires `CREATE_CHARACTER` GraphQL mutation. On success, navigates to `/character/{id}` |
| `lib/characterCreation/routes.ts` | Defines `CREATE_CHARACTER_ROUTES` constant (typed `Href` values), `getCreateCharacterStepRoutes()` (returns ordered route array — race is excluded from step order), and `deriveCreateCharacterStepIndex()` (maps pathname to step index) |
| `lib/characterCreation/stepCompletion.ts` | `isCreateCharacterStepComplete(route, draft)` — per-step validation that gates the Continue button. Identity requires a name and race, class requires full validation, background requires a selection. Abilities, skills, and review always pass |

### Business logic (`lib/characterCreation/`)

| File | Purpose |
|---|---|
| `multiclass.ts` | Core multiclass logic. Types: `CharacterClassDraft`, `CharacterClassDraftValidation`. Functions for creating/sanitising class rows, computing remaining levels, checking subclass unlock, sorting for display, normalising starting class ID, formatting labels, and full validation (`validateCharacterClassDraft`) |
| `options.ts` | Static data: `RACE_OPTIONS`, `CLASS_OPTIONS`, `BACKGROUND_OPTIONS`, `SUBCLASS_OPTIONS`, `ALIGNMENT_OPTIONS`. All use the `OptionItem` shape (`value`, `label`, `icon`, `hint?`) |
| `classRules.ts` | Static D&D rule data: `HIT_DIE_MAP`, armour/weapon proficiencies, `BACKGROUND_SKILL_PROFICIENCIES`, `CLASS_SKILL_OPTIONS` (with `pick` count), `CLASS_SAVING_THROWS`, `CLASS_SPELLCASTING_ABILITY_MAP`, `CLASS_ABILITY_PRIORITY`, `SUBCLASS_UNLOCK_LEVEL_BY_CLASS` |
| `abilityRules.ts` | Point buy cost table, ASI level thresholds, `roll4d6DropLowest()`, `rollAllAbilityScores()`, `suggestAbilityScores()` (reorders rolled scores by class priority), `asiPointsForLevel()`, `proficiencyBonusForLevel()` |
| `raceRules.ts` | `RACE_ABILITY_BONUSES`, `RACE_SPEED_MAP`, `applyRacialBonuses()` |
| `buildCreateCharacterInput.ts` | Converts `CharacterDraft` to `CreateCharacterInput` for the GraphQL mutation. Applies ASI + racial bonuses to ability scores, computes AC/initiative/speed, builds skill proficiency map with expertise levels |

### Reusable wizard components (`components/wizard/`)

| Component | Used by |
|---|---|
| `OptionGrid` | Identity (race), class (single-class mode + subclass), background selection |
| `AlignmentGrid` | Background step (3x3 alignment picker) |
| `ClassAllocationRow` | Class step multiclass mode (one row per class: level stepper, remove button, subclass picker, starting class radio) |
| `RollAbilityMode` | Abilities step (roll mode: 4d6 drop lowest, drag to reorder, suggest button) |
| `PointBuyAbilityMode` | Abilities step (point buy mode: increment/decrement within budget) |
| `AbilityBlock` | Used by both ability modes to render a single ability score |
| `ProficiencyItem` | Skills step (toggleable skill row with expertise long-press) |

## CharacterDraft Shape

```typescript
type CharacterDraft = {
    name: string;
    race: string;                           // e.g. "Elf", "Human"
    classes: CharacterClassDraft[];          // array of { classId, subclassId, level }
    startingClassId: string;                 // which class is the "starting class"
    level: number;                           // total character level (1-20)
    abilityScores: Record<AbilityKey, number>;
    background: string;                      // e.g. "Acolyte"
    alignment: string | null;                // e.g. "Chaotic Good"
    personalityTraits: string;
    ideals: string;
    bonds: string;
    flaws: string;
    skillProficiencies: SkillKey[];
    asiAllocations: Record<AbilityKey, number>;  // ASI points distributed
    expertiseSkills: SkillKey[];                  // skills with double proficiency
    abilityMode: 'roll' | 'pointBuy';
};
```

Default draft starts with level 1, all scores 10, roll mode, empty everything else.

## Single-Class / Multiclass System

The class step defaults to **single-class mode**: the user picks one class from a tile grid, and it automatically receives all of the character's levels.

For characters level 2+, a prompt appears below the selected class offering to "Choose additional classes". Pressing it enters **multiclass mode**, which shows:

- An allocation summary card (total levels, remaining to allocate)
- `ClassAllocationRow` components for each class
- An "Add another class" grid of available classes
- A "Use a single class" button at the top to return to single-class mode (keeps the starting class, gives it all levels)

Multiclass rules:
- Each class is a row with `classId`, `subclassId`, and `level`
- Total allocated levels across all class rows must equal the character's total level
- Each class can only appear once (no duplicates)
- `startingClassId` determines which class grants saving throws and starting proficiencies
- When there's only one class row, it's automatically the starting class
- When multiclassing, a radio selector appears to pick the starting class
- Subclass selection unlocks per-class at specific levels (defined in `SUBCLASS_UNLOCK_LEVEL_BY_CLASS` — cleric/sorcerer/warlock at 1, druid/wizard at 2, everything else at 3)
- `sanitiseCharacterClassRow()` auto-clears invalid subclass selections when class or level changes
- `normaliseStartingClassId()` ensures the starting class ID stays valid when classes are added/removed
- Decreasing level below 2 while in multiclass mode auto-switches back to single-class mode
- Removing classes until only one remains auto-switches back to single-class mode
- Currently only SRD subclasses are available (one per class)

## Step Completion / Validation

The WizardShell's Continue button is disabled until `isCreateCharacterStepComplete()` returns true:

| Step | Gate |
|---|---|
| Identity | `name.trim().length > 0 && race !== ''` |
| Class | `validateCharacterClassDraft().isValid` — checks: at least one class, no empty/duplicate rows, levels fully allocated, valid subclass selections, starting class set, level-1 characters must have exactly one class |
| Abilities | Always passes |
| Background | `background !== ''` |
| Skills | Always passes |
| Review | Always passes |

## Submission Flow

1. User taps "Create Character" on the review step
2. `WizardShell.handleNext()` calls `buildCreateCharacterInput(draft)`:
   - Applies ASI allocations + racial bonuses to ability scores
   - Computes AC (10 + DEX mod), initiative (DEX mod), speed (from race)
   - Builds full skill proficiency map (None/Proficient/Expert)
   - Includes personality traits only if any are filled
   - Sorts and sanitises class rows
3. Fires `CREATE_CHARACTER` GraphQL mutation with the input
4. Refetches `GET_CURRENT_USER_CHARACTER_ROSTER`
5. On success: resets draft, navigates to `/character/{newId}`
6. On error: displays error message in the footer area

## Cancel Flow

- If `hasDraftData()` returns true (name, race, classes, background, skills, or non-default ability scores exist), shows a confirmation alert
- "Abandon" resets the draft and navigates to `/characters`
- If no data has been entered, navigates immediately without confirmation

## Supported Content (SRD-only)

- **Races**: Elf, Human, Dwarf, Halfling, Dragonborn, Tiefling, Gnome, Half-Orc, Half-Elf
- **Classes**: Wizard, Fighter, Rogue, Cleric, Druid, Bard, Sorcerer, Warlock, Ranger, Paladin, Monk, Barbarian
- **Subclasses**: One per class (e.g. Champion Fighter, Thief Rogue, Life Domain Cleric)
- **Backgrounds**: Acolyte only (but `BACKGROUND_SKILL_PROFICIENCIES` has data for Sage, Soldier, Noble, Outlander, Entertainer too)
- **Alignments**: Standard 3x3 grid (Lawful/Neutral/Chaotic x Good/Neutral/Evil)

## Gotchas and Non-obvious Behaviour

- **Level changes on step 2 affect class allocation**: in single-class mode, changing the level automatically updates the single class row's level. In multiclass mode, changing the level only updates `draft.level` — the allocation summary shows remaining levels.
- **Multiclass skill proficiencies are server-derived**: the skills step only shows starting class skill options. Extra proficiencies from multiclassing are computed server-side.
- **`normaliseStartingClassId` runs in `updateDraft`**: the draft context auto-normalises the starting class ID whenever `classes` or `startingClassId` are patched, not just in the class step.
- **Subclass is cleared automatically**: `sanitiseCharacterClassRow` wipes the subclass if the class level drops below the unlock threshold or the subclass option becomes invalid.
- **Review step allows direct navigation**: each section in the review step is a `Pressable` that pushes to the corresponding step route, allowing non-linear editing.
- **Race values are title-case strings** (e.g. `"Elf"`, `"Half-Orc"`), while **class values are lowercase** (e.g. `"wizard"`, `"fighter"`).
- **Background skills overlap with class skills**: the skills step filters out background-granted skills from the class skill picker to avoid double-counting.
- **Ability score computation**: both the review screen and the mutation builder apply ASI allocations + racial bonuses to produce final scores. If you add a new place that displays final scores, make sure to apply both (see `review.tsx` or `buildCreateCharacterInput.ts` for the pattern).
