# Level-Up Wizard — Implementation Plan

## Overview

A multi-step bottom sheet wizard that guides the user through levelling up their character by exactly one level. The button appears **only in edit mode**, positioned in the header alongside DONE/CANCEL. On tap, it opens a bottom-sheet at ~82% screen height containing a stepped wizard flow.

The wizard dynamically assembles its steps based on the character's class(es), new level, and whether they're multiclassing — only relevant steps are shown.

Interactive designs can be found in level-up-wizard-prototype.html. Follow them closely but try to reuse existing components, style constants, etc wherever possible.

---

## 1. UI Placement

### Level Up Button

- **Location:** Character sheet header, left side, visible only when `isEditing === true`
- **Style:** Claret background, parchment text, uppercase. Matches the visual weight of DONE/CANCEL on the right.
- **Label:** "⬆ LEVEL UP"
- **Behaviour:** Opens the Level-Up Wizard bottom sheet. The character sheet edit mode continues underneath (the sheet overlays it).

### Bottom Sheet Container

- **Component:** bottom sheet with snap point at 82% - reuse existing bottom sheet component, refactoring if needed
- **Background:** parchment

### Internal Layout

```
┌─────────────────────────────────┐
│          [grip handle]          │
│                                 │
│  Level Up                       │
│  Advance {name} to Level {n+1} │
│  Step X of Y — {step name}     │
│  [═══════●────────────────────] │ ← progress bar
│─────────────────────────────────│
│                                 │
│  {scrollable step content}      │
│                                 │
│                                 │
│─────────────────────────────────│
│  [BACK]              [NEXT]     │ ← footer
└─────────────────────────────────┘
```

### Progress Bar

- One segment per active step
- Completed steps: crimson
- Current step: gold
- Upcoming steps: #d4c9b4
- Step label above: 14px, uppercase, e.g. "Step 2 of 6 — Hit Points"

### Footer Navigation

- **BACK:** Outlined button, disabled on first step
- **NEXT:** Claret filled button
- **On final step:** NEXT becomes "CONFIRM LEVEL UP" with green (`#2d6a4f`) background
    - Add new green color to fantasy tokens constant in mobile-app/theme/fantasyTheme.ts

---

## 2. Step Assembly Logic

Not every step applies to every level-up. The wizard dynamically builds its step list based on:

```typescript
type WizardStep =
  | 'choose_class'
  | 'hit_points'
  | 'asi_or_feat'
  | 'subclass_selection'
  | 'new_features'
  | 'spellcasting_updates'
  | 'multiclass_proficiencies'
  | 'class_resources'
  | 'summary';

function buildStepList(character, selectedClass, newClassLevel): WizardStep[] {
  const steps: WizardStep[] = ['choose_class'];

  steps.push('hit_points');

  if (isAsiLevel(selectedClass, newClassLevel)) {
    steps.push('asi_or_feat');
  }

  if (isSubclassChoiceLevel(selectedClass, newClassLevel) && !hasSubclass(character, selectedClass)) {
    steps.push('subclass_selection');
  }

  if (getNewFeatures(selectedClass, newClassLevel, character.subclass).length > 0) {
    steps.push('new_features');
  }

  if (hasSpellcastingChanges(selectedClass, newClassLevel, character)) {
    steps.push('spellcasting_updates');
  }

  if (isNewMulticlass(character, selectedClass)) {
    steps.push('multiclass_proficiencies');
  }

  if (hasClassResourceChanges(selectedClass, newClassLevel)) {
    steps.push('class_resources');
  }

  steps.push('summary');

  return steps;
}
```

After the user selects a class in Step 1, the step list is recalculated (since picking a different class changes which steps are needed). The progress bar updates accordingly.

---

## 3. Step Specifications

### Step 1: Choose Class

**Always shown.**

#### Default State: Continue with Current Class

The step opens in a streamlined single-class view, since the vast majority of level-ups will continue in the character's existing class. This view shows:

- **Instructional text:** "You're adding a level to your current class. Tap Next to continue."
- **Current class card:** A single, centred, pre-selected card showing the class icon, name, current/new level (e.g. "Level 12 → 13"), and hit die. Non-interactive (visually selected, but not tappable).
- **Divider:** "— or —" separator
- **Multiclass prompt:** "Want to gain a level in a different class instead?"
- **Multiclass button:** Outlined button: "Choose a Class to Multiclass" — opens the expanded picker

The NEXT button is enabled immediately in this view (Wizard is the default selection).

#### Expanded State: Multiclass Picker

Tapping the multiclass button transitions the step content to show:

- **Back link:** "← Back to Wizard" — returns to the default single-class view and resets the selection to the current class
- **Instructional text:** "Choose a new class to multiclass into. This will add a level in the selected class instead of {CurrentClass}."
- **Class grid:** 2-column grid of all 12 SRD classes (including the current class, in case they want to re-select it), each showing an icon, name, and hit die
- **No class is pre-selected** — the NEXT button is disabled until the user picks one

The transition between states is immediate (no animation needed). The "← Back to Wizard" link re-enables NEXT and resets `selectedClass` to the character's current class.

#### Class List (SRD)

| Class     | Hit Die | Multiclass Prerequisites        |
|-----------|---------|----------------------------------|
| Barbarian | d12     | STR 13                           |
| Bard      | d8      | CHA 13                           |
| Cleric    | d8      | WIS 13                           |
| Druid     | d8      | WIS 13                           |
| Fighter   | d10     | STR 13 or DEX 13                 |
| Monk      | d8      | DEX 13 and WIS 13                |
| Paladin   | d10     | STR 13 and CHA 13                |
| Ranger    | d10     | DEX 13 and WIS 13                |
| Rogue     | d8      | DEX 13                           |
| Sorcerer  | d6      | CHA 13                           |
| Warlock   | d8      | CHA 13                           |
| Wizard    | d6      | INT 13                           |

#### Multiclass Prerequisite Check

When the user selects a class different from their current class:
1. Check prerequisites for **leaving** the current class (the character must meet the current class's multiclass prereqs)
2. Check prerequisites for **entering** the new class
3. If either fails, show a warning box (amber background, ⚠ icon) explaining which ability score(s) are too low
4. Allow proceeding anyway (DM override) — the warning is informational, not blocking

#### On Selection Change

Recalculate and rebuild the step list. The progress bar and step count update immediately.

#### Data Requirements

- Character's current class(es) and level(s)
- Character's ability scores (for prereq checks)

---

### Step 2: Hit Points

**Always shown.**

#### Layout

- **Die visual:** Large centred box (120×120) showing the hit die type initially (e.g. "d6"), becomes the rolled number after rolling
- **Die label:** Small badge on the die box showing "d6" / "d8" / etc.
- **Roll button:** Claret, "ROLL HIT DIE" — primary action
- **Average link:** Below the button, underlined text "or take the average (N)"
- **HP calculation panel:** Appears after rolling/choosing average. Shows:
  - Hit Die Roll: {value}
  - Constitution Modifier: +{conMod}
  - **HP Gained: +{total}**

#### Hit Die by Class

| Class     | Die | Average |
|-----------|-----|---------|
| Barbarian | d12 | 7       |
| Bard      | d8  | 5       |
| Cleric    | d8  | 5       |
| Druid     | d8  | 5       |
| Fighter   | d10 | 6       |
| Monk      | d8  | 5       |
| Paladin   | d10 | 6       |
| Ranger    | d10 | 6       |
| Rogue     | d8  | 5       |
| Sorcerer  | d6  | 4       |
| Warlock   | d8  | 5       |
| Wizard    | d6  | 4       |

#### Roll Animation

1. Button tap triggers a 0.5s animation on the die box (scale + rotation keyframes)
2. During animation, the number rapidly cycles through random values
3. Settles on final value; die box border turns claret
4. Button text changes to "RE-ROLL"
5. HP calculation panel fades in below

#### Min-1 Rule

If the rolled value + CON modifier is less than 1, the total HP gained is 1 (you always gain at least 1 HP per level).

#### Data Requirements

- Selected class (from Step 1) → determines hit die
- Character's CON modifier

---

### Step 3: Ability Score Improvement / Feat

**Shown only at ASI levels.**

#### ASI Levels by Class

| Class     | ASI at Levels             |
|-----------|---------------------------|
| Barbarian | 4, 8, 12, 16, 19         |
| Bard      | 4, 8, 12, 16, 19         |
| Cleric    | 4, 8, 12, 16, 19         |
| Druid     | 4, 8, 12, 16, 19         |
| Fighter   | 4, 6, 8, 12, 14, 16, 19  |
| Monk      | 4, 8, 12, 16, 19         |
| Paladin   | 4, 8, 12, 16, 19         |
| Ranger    | 4, 8, 12, 16, 19         |
| Rogue     | 4, 8, 10, 12, 16, 19     |
| Sorcerer  | 4, 8, 12, 16, 19         |
| Warlock   | 4, 8, 12, 16, 19         |
| Wizard    | 4, 8, 12, 16, 19         |

#### Layout — Choice

Two side-by-side cards at the top:
- **Ability Scores** (icon: 📊) — "+2 to one score, or +1 to two scores"
- **Feat** (icon: ⭐) — "Gain a new feat and its benefits"

Tapping one reveals its panel below and hides the other.

#### ASI Panel

- **Points remaining counter:** Centred, shows "2 points remaining" (decrements as user assigns)
- **Ability score rows:** One per ability (STR, DEX, CON, INT, WIS, CHA), each showing:
  - Ability name (Cinzel, uppercase)
  - Current score
  - − / + buttons
  - Increase value (e.g. "+1") shown between buttons when assigned
- **Constraints:**
  - Max 2 points total
  - Max +2 to a single score
  - Cannot exceed 20 (+ button disabled for scores already at 20 or that would go above)
  - Cannot go below 0 increase (− button disabled when increase is 0)

#### Feat Panel

- **Feat name input:** Gold-bordered text field, placeholder "Feat name (e.g. War Caster)"
- **Description textarea:** Gold-bordered, placeholder "Describe the feat's benefits..."
- **Optional ability increase:** Dropdown selector for feats that grant +1 to an ability (e.g. Resilient). Options: "No ability increase", STR +1, DEX +1, CON +1, INT +1, WIS +1, CHA +1
- The SRD only includes one feat (Grappler), so all feats are effectively user-entered custom content. No pre-populated feat list.

#### Data Requirements

- Character's ability scores (for display and cap enforcement)
- Selected class + new class level (to determine if this step shows)

---

### Step 4: Subclass Selection

**Shown only when the new class level is a subclass-choice level AND the character doesn't already have a subclass for this class.**

#### Subclass Choice Levels

| Class     | Subclass At | SRD Subclass           |
|-----------|-------------|------------------------|
| Barbarian | 3           | Path of the Berserker  |
| Bard      | 3           | College of Lore        |
| Cleric    | 1           | Life Domain            |
| Druid     | 2           | Circle of the Land     |
| Fighter   | 3           | Champion               |
| Monk      | 3           | Way of the Open Hand   |
| Paladin   | 3           | Oath of Devotion       |
| Ranger    | 3           | Hunter                 |
| Rogue     | 3           | Thief                  |
| Sorcerer  | 1           | Draconic Bloodline     |
| Warlock   | 1           | The Fiend              |
| Wizard    | 2           | School of Evocation    |

#### Layout

- **Instructional text:** "Choose your {Subclass Category Name} for {Class}."
  - Category names: Primal Path, Bard College, Divine Domain, Druid Circle, Martial Archetype, Monastic Tradition, Sacred Oath, Ranger Archetype, Roguish Archetype, Sorcerous Origin, Otherworldly Patron, Arcane Tradition
- **SRD subclass card:** Shows the name, an "SRD" badge, and a brief description
- **Custom subclass card:** "Custom Subclass" option with a text input for the name

#### Brief SRD Subclass Descriptions

These are short summaries (not full feature text) to help the user identify the option:

- **Path of the Berserker:** Frenzy in battle, gaining extra attacks at the cost of exhaustion.
- **College of Lore:** Master of knowledge, gaining Cutting Words and additional magical secrets.
- **Life Domain:** Divine healer whose spells restore extra hit points.
- **Circle of the Land:** Draw on the magic of the environment to recover spells and gain bonus spells.
- **Champion:** Improved critical hits and remarkable athleticism.
- **Way of the Open Hand:** Master of martial arts combat techniques.
- **Oath of Devotion:** Devoted to the ideals of justice, virtue, and order.
- **Hunter:** Specialist in fighting the great threats of the wilds.
- **Thief:** Master of stealth, agility, and using objects with exceptional cunning.
- **Draconic Bloodline:** Innate magic from draconic ancestry grants resilience and elemental power.
- **The Fiend:** Pact with a fiend grants dark powers and fiery magic.
- **School of Evocation:** Master of powerful energy spells, shaped to avoid allies.

#### Data Requirements

- Selected class + new class level
- Whether the character already has a subclass for this class

---

### Step 5: New Class Features

**Shown when the new level grants any class or subclass features.**

#### Layout

- **Instructional text:** "The following features are gained at {Class} level {N}."
- **Feature cards:** Read-only cards for each new feature, showing:
  - Feature name with a green "NEW" badge
  - Source line (e.g. "Evocation Wizard 6")
  - Description text
  - Left border accent in claret

#### Feature Data Source

Features come from the SRD class/subclass tables. The app needs a data file mapping:

```typescript
type ClassFeature = {
  name: string;
  level: number;
  className: string;
  subclassName?: string; // undefined = base class feature
  description: string;
};
```

For **custom subclasses**, this step shows:
- Any base class features that apply at this level (still from SRD data)
- A prompt: "Add any features granted by your subclass at this level" with an "+ ADD FEATURE" button that opens name + description fields

#### Full SRD Class Feature Table

This is the comprehensive data that needs to be encoded. Key features by class and level:

**Barbarian**
| Level | Features |
|-------|----------|
| 1 | Rage, Unarmoured Defence |
| 2 | Reckless Attack, Danger Sense |
| 3 | Primal Path |
| 4 | ASI |
| 5 | Extra Attack, Fast Movement |
| 6 | Path feature |
| 7 | Feral Instinct |
| 8 | ASI |
| 9 | Brutal Critical (1 die) |
| 10 | Path feature |
| 11 | Relentless Rage |
| 12 | ASI |
| 13 | Brutal Critical (2 dice) |
| 14 | Path feature |
| 15 | Persistent Rage |
| 16 | ASI |
| 17 | Brutal Critical (3 dice) |
| 18 | Indomitable Might |
| 19 | ASI |
| 20 | Primal Champion |

**Bard**
| Level | Features |
|-------|----------|
| 1 | Spellcasting, Bardic Inspiration (d6) |
| 2 | Jack of All Trades, Song of Rest (d6) |
| 3 | Bard College, Expertise |
| 4 | ASI |
| 5 | Bardic Inspiration (d8), Font of Inspiration |
| 6 | Countercharm, College feature |
| 7 | — |
| 8 | ASI |
| 9 | Song of Rest (d8) |
| 10 | Bardic Inspiration (d10), Expertise, Magical Secrets |
| 11 | — |
| 12 | ASI |
| 13 | Song of Rest (d10) |
| 14 | Magical Secrets, College feature |
| 15 | Bardic Inspiration (d12) |
| 16 | ASI |
| 17 | Song of Rest (d12) |
| 18 | Magical Secrets |
| 19 | ASI |
| 20 | Superior Inspiration |

**Cleric**
| Level | Features |
|-------|----------|
| 1 | Spellcasting, Divine Domain |
| 2 | Channel Divinity (1/rest), Domain feature |
| 3 | — |
| 4 | ASI |
| 5 | Destroy Undead (CR 1/2) |
| 6 | Channel Divinity (2/rest), Domain feature |
| 7 | — |
| 8 | ASI, Destroy Undead (CR 1), Domain feature |
| 9 | — |
| 10 | Divine Intervention |
| 11 | Destroy Undead (CR 2) |
| 12 | ASI |
| 13 | — |
| 14 | Destroy Undead (CR 3) |
| 15 | — |
| 16 | ASI |
| 17 | Destroy Undead (CR 4), Domain feature |
| 18 | Channel Divinity (3/rest) |
| 19 | ASI |
| 20 | Divine Intervention improvement |

**Druid**
| Level | Features |
|-------|----------|
| 1 | Druidic, Spellcasting |
| 2 | Wild Shape, Druid Circle |
| 3 | — |
| 4 | ASI, Wild Shape improvement |
| 5 | — |
| 6 | Circle feature |
| 7 | — |
| 8 | ASI, Wild Shape improvement |
| 9 | — |
| 10 | Circle feature |
| 11 | — |
| 12 | ASI |
| 13 | — |
| 14 | Circle feature |
| 15 | — |
| 16 | ASI |
| 17 | — |
| 18 | Timeless Body, Beast Spells |
| 19 | ASI |
| 20 | Archdruid |

**Fighter**
| Level | Features |
|-------|----------|
| 1 | Fighting Style, Second Wind |
| 2 | Action Surge (1 use) |
| 3 | Martial Archetype |
| 4 | ASI |
| 5 | Extra Attack |
| 6 | ASI |
| 7 | Archetype feature |
| 8 | ASI |
| 9 | Indomitable (1 use) |
| 10 | Archetype feature |
| 11 | Extra Attack (2) |
| 12 | ASI |
| 13 | Indomitable (2 uses) |
| 14 | ASI |
| 15 | Archetype feature |
| 16 | ASI |
| 17 | Action Surge (2 uses), Indomitable (3 uses) |
| 18 | Archetype feature |
| 19 | ASI |
| 20 | Extra Attack (3) |

**Monk**
| Level | Features |
|-------|----------|
| 1 | Unarmoured Defence, Martial Arts |
| 2 | Ki, Unarmoured Movement |
| 3 | Monastic Tradition, Deflect Missiles |
| 4 | ASI, Slow Fall |
| 5 | Extra Attack, Stunning Strike |
| 6 | Ki-Empowered Strikes, Tradition feature |
| 7 | Evasion, Stillness of Mind |
| 8 | ASI |
| 9 | Unarmoured Movement improvement |
| 10 | Purity of Body |
| 11 | Tradition feature |
| 12 | ASI |
| 13 | Tongue of the Sun and Moon |
| 14 | Diamond Soul |
| 15 | Timeless Body |
| 16 | ASI |
| 17 | Tradition feature |
| 18 | Empty Body |
| 19 | ASI |
| 20 | Perfect Self |

**Paladin**
| Level | Features |
|-------|----------|
| 1 | Divine Sense, Lay on Hands |
| 2 | Fighting Style, Spellcasting, Divine Smite |
| 3 | Divine Health, Sacred Oath |
| 4 | ASI |
| 5 | Extra Attack |
| 6 | Aura of Protection |
| 7 | Oath feature |
| 8 | ASI |
| 9 | — |
| 10 | Aura of Courage |
| 11 | Improved Divine Smite |
| 12 | ASI |
| 13 | — |
| 14 | Cleansing Touch |
| 15 | Oath feature |
| 16 | ASI |
| 17 | — |
| 18 | Aura improvements (30 ft) |
| 19 | ASI |
| 20 | Oath feature |

**Ranger**
| Level | Features |
|-------|----------|
| 1 | Favoured Enemy, Natural Explorer |
| 2 | Fighting Style, Spellcasting |
| 3 | Ranger Archetype, Primeval Awareness |
| 4 | ASI |
| 5 | Extra Attack |
| 6 | Favoured Enemy improvement, Natural Explorer improvement |
| 7 | Archetype feature |
| 8 | ASI, Land's Stride |
| 9 | — |
| 10 | Natural Explorer improvement, Hide in Plain Sight |
| 11 | Archetype feature |
| 12 | ASI |
| 13 | — |
| 14 | Favoured Enemy improvement, Vanish |
| 15 | Archetype feature |
| 16 | ASI |
| 17 | — |
| 18 | Feral Senses |
| 19 | ASI |
| 20 | Foe Slayer |

**Rogue**
| Level | Features |
|-------|----------|
| 1 | Expertise, Sneak Attack (1d6), Thieves' Cant |
| 2 | Cunning Action |
| 3 | Roguish Archetype |
| 4 | ASI |
| 5 | Uncanny Dodge |
| 6 | Expertise |
| 7 | Evasion |
| 8 | ASI |
| 9 | Archetype feature |
| 10 | ASI |
| 11 | Reliable Talent |
| 12 | ASI |
| 13 | Archetype feature |
| 14 | Blindsense |
| 15 | Slippery Mind |
| 16 | ASI |
| 17 | Archetype feature |
| 18 | Elusive |
| 19 | ASI |
| 20 | Stroke of Luck |

**Sorcerer**
| Level | Features |
|-------|----------|
| 1 | Spellcasting, Sorcerous Origin |
| 2 | Font of Magic |
| 3 | Metamagic |
| 4 | ASI |
| 5 | — |
| 6 | Origin feature |
| 7 | — |
| 8 | ASI |
| 9 | — |
| 10 | Metamagic |
| 11 | — |
| 12 | ASI |
| 13 | — |
| 14 | Origin feature |
| 15 | — |
| 16 | ASI |
| 17 | Metamagic |
| 18 | Origin feature |
| 19 | ASI |
| 20 | Sorcerous Restoration |

**Warlock**
| Level | Features |
|-------|----------|
| 1 | Otherworldly Patron, Pact Magic |
| 2 | Eldritch Invocations |
| 3 | Pact Boon |
| 4 | ASI |
| 5 | — |
| 6 | Patron feature |
| 7 | — |
| 8 | ASI |
| 9 | — |
| 10 | Patron feature |
| 11 | Mystic Arcanum (6th level) |
| 12 | ASI |
| 13 | Mystic Arcanum (7th level) |
| 14 | Patron feature |
| 15 | Mystic Arcanum (8th level) |
| 16 | ASI |
| 17 | Mystic Arcanum (9th level) |
| 18 | — |
| 19 | ASI |
| 20 | Eldritch Master |

**Wizard**
| Level | Features |
|-------|----------|
| 1 | Spellcasting, Arcane Recovery |
| 2 | Arcane Tradition |
| 3 | — |
| 4 | ASI |
| 5 | — |
| 6 | Tradition feature |
| 7 | — |
| 8 | ASI |
| 9 | — |
| 10 | Tradition feature |
| 11 | — |
| 12 | ASI |
| 13 | — |
| 14 | Tradition feature |
| 15 | — |
| 16 | ASI |
| 17 | — |
| 18 | Spell Mastery |
| 19 | ASI |
| 20 | Signature Spells |

---

### Step 6: Spellcasting Updates

**Shown when the new level changes spell slots, spells known, cantrips, or unlocks a new spell level.**

#### Sub-sections (all conditional)

**A) Spell Slot Changes**

Show a row of slot-level cards with before → after values. Highlight changed levels with a gold border. Data comes from the spell slot progression tables:

Full casters (Bard, Cleric, Druid, Sorcerer, Wizard) share the same slot table:

| Level | 1st | 2nd | 3rd | 4th | 5th | 6th | 7th | 8th | 9th |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 1     | 2   | —   | —   | —   | —   | —   | —   | —   | —   |
| 2     | 3   | —   | —   | —   | —   | —   | —   | —   | —   |
| 3     | 4   | 2   | —   | —   | —   | —   | —   | —   | —   |
| 4     | 4   | 3   | —   | —   | —   | —   | —   | —   | —   |
| 5     | 4   | 3   | 2   | —   | —   | —   | —   | —   | —   |
| 6     | 4   | 3   | 3   | —   | —   | —   | —   | —   | —   |
| 7     | 4   | 3   | 3   | 1   | —   | —   | —   | —   | —   |
| 8     | 4   | 3   | 3   | 2   | —   | —   | —   | —   | —   |
| 9     | 4   | 3   | 3   | 3   | 1   | —   | —   | —   | —   |
| 10    | 4   | 3   | 3   | 3   | 2   | —   | —   | —   | —   |
| 11    | 4   | 3   | 3   | 3   | 2   | 1   | —   | —   | —   |
| 12    | 4   | 3   | 3   | 3   | 2   | 1   | —   | —   | —   |
| 13    | 4   | 3   | 3   | 3   | 2   | 1   | 1   | —   | —   |
| 14    | 4   | 3   | 3   | 3   | 2   | 1   | 1   | —   | —   |
| 15    | 4   | 3   | 3   | 3   | 2   | 1   | 1   | 1   | —   |
| 16    | 4   | 3   | 3   | 3   | 2   | 1   | 1   | 1   | —   |
| 17    | 4   | 3   | 3   | 3   | 2   | 1   | 1   | 1   | 1   |
| 18    | 4   | 3   | 3   | 3   | 3   | 1   | 1   | 1   | 1   |
| 19    | 4   | 3   | 3   | 3   | 3   | 2   | 1   | 1   | 1   |
| 20    | 4   | 3   | 3   | 3   | 3   | 2   | 2   | 1   | 1   |

Half casters (Paladin, Ranger) use the same table but offset — their effective caster level = floor(class level / 2). They get slots starting at class level 2.

Third casters (Fighter/Eldritch Knight, Rogue/Arcane Trickster — both non-SRD subclasses) use effective level = floor(class level / 3). Since these aren't SRD subclasses, handle as custom subclass edge case.

**Warlock Pact Magic** is separate from the normal spell slot table:

| Level | Slots | Slot Level |
|-------|-------|------------|
| 1     | 1     | 1st        |
| 2     | 2     | 1st        |
| 3     | 2     | 2nd        |
| 4     | 2     | 2nd        |
| 5     | 2     | 3rd        |
| 6     | 2     | 3rd        |
| 7     | 2     | 4th        |
| 8     | 2     | 4th        |
| 9     | 2     | 5th        |
| 10    | 2     | 5th        |
| 11    | 3     | 5th        |
| 12    | 3     | 5th        |
| 13-16 | 3     | 5th        |
| 17    | 4     | 5th        |
| 18-20 | 4     | 5th        |

**Multiclass spell slot calculation:** Use the combined caster level formula:
- Full caster levels count as 1×
- Half caster levels (Paladin, Ranger) count as ½× (round down)
- Third caster levels (EK, AT) count as ⅓× (round down)
- Warlock levels **do not** count — Pact Magic is tracked separately
- Look up the combined level in the full caster spell slot table above

**B) Spells Known / Learnable**

This varies by class type:

**Wizard (learns spells to spellbook):**
- Gains 2 new spells per wizard level
- Can be of any level the wizard can cast
- Button: "+ Choose 2 New Spells" → opens the existing Add Spell bottom sheet, filtered to Wizard spells of eligible levels
- Counter below: "X of 2 spells selected"

**Bard, Ranger, Sorcerer, Warlock (spells known):**

Spells known by level:

| Level | Bard | Ranger | Sorcerer | Warlock |
|-------|------|--------|----------|---------|
| 1     | 4    | —      | 2        | 2       |
| 2     | 5    | 2      | 3        | 3       |
| 3     | 6    | 3      | 4        | 4       |
| 4     | 7    | 3      | 5        | 5       |
| 5     | 8    | 4      | 6        | 6       |
| 6     | 9    | 4      | 7        | 7       |
| 7     | 10   | 5      | 8        | 8       |
| 8     | 11   | 5      | 9        | 9       |
| 9     | 12   | 6      | 10       | 10      |
| 10    | 14   | 6      | 11       | 10      |
| 11    | 15   | 7      | 12       | 11      |
| 12    | 15   | 7      | 12       | 11      |
| 13    | 16   | 8      | 13       | 12      |
| 14    | 18   | 8      | 13       | 12      |
| 15    | 19   | 9      | 14       | 13      |
| 16    | 19   | 9      | 14       | 13      |
| 17    | 20   | 10     | 15       | 14      |
| 18    | 22   | 10     | 15       | 14      |
| 19    | 22   | 11     | 15       | 15      |
| 20    | 22   | 11     | 15       | 15      |

If spells known increased:
- Show "Spells Known: {old} → {new}" with count difference
- Button to open Add Spell sheet, filtered to appropriate class and eligible levels
- Also offer **spell swap**: "You may also replace one known spell with another of eligible level" with a remove-then-add flow

**Cleric, Druid, Paladin (prepared casters):**
- No forced spell selection — they prepare from their full list each day
- Show informational text: "Your maximum prepared spells is now {ability mod + class level}. You can update your prepared spells from the Spells tab."

**C) New Cantrips**

Cantrips known by level:

| Level | Bard | Cleric | Druid | Sorcerer | Warlock | Wizard |
|-------|------|--------|-------|----------|---------|--------|
| 1     | 2    | 3      | 2     | 4        | 2       | 3      |
| 4     | 3    | 4      | 3     | 5        | 3       | 4      |
| 10    | 4    | 5      | 4     | 6        | 4       | 5      |

If cantrips known increased at this level, show "+ Choose 1 New Cantrip" button → opens Add Spell filtered to cantrips.

#### Data Requirements

- Selected class, new class level, all class levels (for multiclass slot calculation)
- Character's existing spells (to show how many are already known)
- Current spell slots (for before/after comparison)

---

### Step 7: Multiclass Proficiencies

**Shown only when multiclassing into a new class for the first time.**

#### Layout

- **Instructional text:** "Multiclassing into {Class} grants the following proficiencies:"
- **Proficiency list:** Read-only list showing what's gained
- **Skill picker:** For classes that grant a skill choice, show a selector from the class's skill list

#### Multiclass Proficiency Gains

| Class     | Proficiencies Gained                                       |
|-----------|------------------------------------------------------------|
| Barbarian | Shields, simple weapons, martial weapons                   |
| Bard      | Light armour, one skill of your choice, one musical instrument |
| Cleric    | Light armour, medium armour, shields                       |
| Druid     | Light armour, medium armour, shields                       |
| Fighter   | Light armour, medium armour, shields, simple weapons, martial weapons |
| Monk      | Simple weapons, shortswords                                |
| Paladin   | Light armour, medium armour, shields, simple weapons, martial weapons |
| Ranger    | Light armour, medium armour, shields, simple weapons, martial weapons, one skill |
| Rogue     | Light armour, one skill                                    |
| Warlock   | Light armour, simple weapons                               |
| Wizard    | —                                                          |

#### Skill Choice Lists

When "one skill" is available, the options come from the class's skill list:

- **Bard:** Any skill
- **Ranger:** Animal Handling, Athletics, Insight, Investigation, Nature, Perception, Stealth, Survival
- **Rogue:** Acrobatics, Athletics, Deception, Insight, Intimidation, Investigation, Perception, Performance, Persuasion, Sleight of Hand, Stealth

These proficiencies are automatically added to the Traits tab's Proficiencies & Languages section on confirmation.

#### Data Requirements

- Character's current classes (to determine if this is a *new* multiclass)
- Selected class

---

### Step 8: Class Resource Updates

**Shown when class-specific tracked resources change at the new level.**

#### Layout

- **Resource change cards:** Each shows the resource name, old value → new value
- **For resources requiring selection (e.g. Warlock Invocations, Sorcerer Metamagic):** Include a picker

#### Class Resource Progressions

**Barbarian**

| Level | Rages | Rage Damage |
|-------|-------|-------------|
| 1     | 2     | +2          |
| 3     | 3     | +2          |
| 6     | 4     | +2          |
| 9     | 4     | +3          |
| 12    | 5     | +3          |
| 16    | 5     | +4          |
| 17    | 6     | +4          |
| 20    | ∞     | +4          |

**Monk**

| Level | Martial Arts | Ki Points | Unarmoured Movement |
|-------|-------------|-----------|---------------------|
| 1     | 1d4         | —         | —                   |
| 2     | 1d4         | 2         | +10 ft              |
| 3     | 1d4         | 3         | +10 ft              |
| 5     | 1d6         | 5         | +10 ft              |
| 6     | 1d6         | 6         | +15 ft              |
| 9     | 1d6         | 9         | +15 ft              |
| 10    | 1d6         | 10        | +20 ft              |
| 11    | 1d8         | 11        | +20 ft              |
| 14    | 1d8         | 14        | +25 ft              |
| 17    | 1d10        | 17        | +25 ft              |
| 18    | 1d10        | 18        | +30 ft              |

(Ki points = monk level, shown for clarity)

**Rogue — Sneak Attack**

Increases by 1d6 at every odd level: 1d6 at 1st, 2d6 at 3rd, 3d6 at 5th, etc. Formula: `ceil(rogueLevel / 2)`d6.

**Sorcerer — Sorcery Points**

Equal to sorcerer level. At levels 3, 10, and 17 they also gain a new Metamagic option (selection required from SRD list):

SRD Metamagic Options: Careful Spell, Distant Spell, Empowered Spell, Extended Spell, Heightened Spell, Quickened Spell, Subtle Spell, Twinned Spell

**Warlock — Eldritch Invocations**

| Level | Invocations Known |
|-------|-------------------|
| 2     | 2                 |
| 5     | 3                 |
| 7     | 4                 |
| 9     | 5                 |
| 12    | 6                 |
| 15    | 7                 |
| 18    | 8                 |

When invocations increase, present SRD invocation options (there are ~16 in the SRD) plus a custom entry option. Also allow swapping one existing invocation.

**Warlock — Mystic Arcanum**

At levels 11, 13, 15, 17: gain one spell of the corresponding level (6th, 7th, 8th, 9th) that can be cast once per long rest without a slot. Selection required — opens Add Spell filtered to that level.

#### Data Requirements

- Selected class + new class level
- Current resource values (for before/after display)

---

### Step 9: Summary & Confirm

**Always shown (final step).**

#### Layout

- **Level change banner:** Centred, large text: "{Class} {old level} → {Class} {new level}"
- **Summary sections:** One card per change category, each showing:
  - Label (Cinzel, uppercase, light colour)
  - Value with old → new highlighting

#### Summary Sections (all conditional)

1. **Hit Points:** "{old HP} → {new HP} (+{gained})"
2. **Ability Score Improvement / Feat:** Which scores changed, or feat name
3. **Subclass:** Name of chosen subclass (if selected this level)
4. **New Features:** Bulleted list of feature names
5. **Spell Slot Changes:** Any changed slot levels
6. **New Spells:** List of spells added
7. **New Cantrips:** List of cantrips added
8. **New Proficiencies:** List (multiclass only)
9. **Resource Changes:** Any updated values

#### Confirm Button

"CONFIRM LEVEL UP" — green (`#2d6a4f`) background. On tap:

1. Increment the character's class level
2. Update max HP
3. Apply ability score changes
4. Add new features to the Features tab
5. Update spell slots
6. Add new spells to the spell list
7. Add new proficiencies to Traits tab
8. Update class resources
9. Close the bottom sheet
10. The character sheet (still in edit mode) now reflects all changes

All mutations should be batched in a single Zustand store update / tRPC mutation to ensure atomicity.

#### Cancel

If the user dismisses the sheet (backdrop tap, swipe down, or BACK past Step 1), show a confirmation alert: "Discard level-up changes?" with Discard / Keep Editing options.

---

## 4. Data Architecture

### New Database/Store Requirements

```typescript
// Class features data file (static SRD content)
// This is a large static dataset - store as a JSON file in the app bundle
// or as a seed in the database

interface ClassFeatureData {
  className: string;
  level: number;
  featureName: string;
  description: string;
  subclassName?: string; // null = base class feature
}

interface SubclassData {
  className: string;
  subclassCategory: string; // e.g. "Arcane Tradition"
  subclassName: string;
  description: string; // brief summary
  isSrd: boolean;
}

// Spell slot tables (static)
interface SpellSlotTable {
  [level: number]: number[]; // array of 9 values for slots 1st-9th
}

// Class resource tables (static)
interface ClassResourceProgression {
  className: string;
  resourceName: string;
  progression: { [level: number]: string | number };
}
```

### Zustand Store Updates

Add to the character store:

```typescript
interface LevelUpWizardState {
  isOpen: boolean;
  currentStep: number;
  steps: WizardStep[];
  selectedClass: string;
  hpGained: number | null;
  asiChoices: { ability: string; increase: number }[];
  featChoice: { name: string; description: string; abilityIncrease?: string } | null;
  selectedSubclass: string | null;
  newSpells: string[];
  newCantrips: string[];
  skillChoices: string[];
  invocationChoices: string[];
  metamagicChoices: string[];
}
```

---

## 5. Implementation Order

### Phase 1: Core Wizard Shell
1. Add "Level Up" button to header (edit mode only)
2. Create the bottom sheet container with step navigation
3. Implement progress bar and BACK/NEXT/CONFIRM flow
4. Build the step assembly logic

### Phase 2: Basic Steps
5. Step 1: Class selection with multiclass prereq checks
6. Step 2: Hit Points with roll animation and average option
7. Step 3: ASI / Feat selection
8. Step 9: Summary view with confirm action

### Phase 3: Features & Spellcasting
9. Create the static SRD class features data file
10. Step 4: Subclass selection
11. Step 5: New class features display
12. Step 6: Spellcasting updates (slot comparison, Add Spell integration)

### Phase 4: Advanced Steps
13. Step 7: Multiclass proficiencies
14. Step 8: Class resource updates (Barbarian rage, Monk ki, etc.)
15. Warlock Invocations and Sorcerer Metamagic pickers
16. Warlock Mystic Arcanum selection

### Phase 5: Polish
17. Die roll animation refinement (Reanimated)
18. Cancel confirmation dialog
19. Edge cases: level 20 cap, multiclass spell slot calculation
20. Testing across all 12 classes at various levels

---

## 6. SRD Content Attribution

All pre-populated class features, subclass descriptions, spell slot tables, and other SRD content must include the CC-BY-4.0 attribution as required. This is already handled by the app's existing credits/legal screen, but ensure any new SRD text added in this feature follows the same pattern.

Content that is **not** in the SRD (non-SRD subclasses, most feats, Eldritch Knight/Arcane Trickster) is handled via user-entered custom fields, consistent with the existing legal approach.
