# App Flow & New Screens — Implementation Plan

This document describes the implementation of the post-login app flow, including the empty state screen, characters list screen, and character creation wizard. Hand this document to Codex along with the following HTML design references:

- `empty-state.html` — empty state screen
- `characters-list.html` — My Characters list
- `character-creation.html` — 6-step creation wizard

---

## Flow Overview

```
Login / Sign Up
      │
      ├─ user has 0 characters ──→ Empty State ──→ Creation Wizard ──→ Character Sheet
      │
      └─ user has ≥ 1 character ──→ My Characters ──→ (tap card) ──→ Character Sheet
                                          │
                                          └─ (tap FAB "+") ──→ Creation Wizard ──→ Character Sheet
```

The routing decision after login is made by checking the user's character count from the database before navigating.

---

## File Structure

```
app/
  (auth)/
    login.tsx                         ← existing, unchanged
  (app)/
    _layout.tsx                       ← checks auth + character count, redirects
    index.tsx                         ← redirects to /characters (entry point)
    characters/
      index.tsx                       ← My Characters list (or empty state)
      create/
        _layout.tsx                   ← wizard shell (progress bar, step chrome)
        index.tsx                     ← step 1: Identity
        race.tsx                      ← step 2: Race
        class.tsx                     ← step 3: Class & Level
        abilities.tsx                 ← step 4: Ability Scores
        background.tsx                ← step 5: Background, Alignment & Personality
        skills.tsx                    ← step 6: Skills
        review.tsx                    ← step 7: Review & confirm
  (drawer)/
    ...                               ← existing drawer layout, unchanged

components/
  characters/
    CharacterCard.tsx                 ← large full-width character card
    EmptyState.tsx                    ← atmospheric empty state
  wizard/
    WizardShell.tsx                   ← progress bar, step indicator, back/next chrome
    OptionGrid.tsx                    ← reusable 2-col option picker (race, class, bg)
    AlignmentGrid.tsx                 ← 3×3 alignment picker with skip
    AbilityBlock.tsx                  ← single ability score +/− control
    ProficiencyItem.tsx               ← single skill row with checkbox

store/ (or context/)
  characterDraft.ts                   ← zustand/context store for wizard in-progress state
```

---

## Design Tokens

All screens share the existing token set. No new tokens are needed. Reference `theme.ts`:

```ts
// Already defined — use these consistently
bg: '#0d0906'
cardBg: '#f0e0bc'
parchment: '#f5e6c8'
ink: '#1a0f00'
inkLight: '#3d2b1f'
crimson: '#8b1a1a'
gold: '#c9922a'
divider: 'rgba(139,90,43,0.3)'
inputBg: 'rgba(240,224,188,0.06)'
inputBorder: 'rgba(201,146,42,0.2)'
```

---

## Step 1 — Auth Gate & Redirect Logic

After login, determine where to send the user. This should happen in `(app)/_layout.tsx` before rendering any screen.

```tsx
// app/(app)/_layout.tsx
import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { router } from 'expo-router';
import { useAuth } from '@/store/auth';
import { useCharacters } from '@/store/characters';

export default function AppLayout() {
  const { user } = useAuth();
  const { characters, loading } = useCharacters(user?.id);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    // Redirect is handled per-screen; just ensure auth is valid here
  }, [user, loading]);

  if (loading) return null; // or a splash/loading screen

  return <Slot />;
}
```

```tsx
// app/(app)/characters/index.tsx
import { useCharacters } from '@/store/characters';

export default function CharactersScreen() {
  const { characters } = useCharacters();

  if (characters.length === 0) {
    return <EmptyState />;
  }

  return <CharactersList characters={characters} />;
}
```

The same screen handles both states — no separate route for the empty state. This avoids redirect loops and keeps the URL stable at `/characters`.

---

## Step 2 — Empty State Screen

Reference: `empty-state.html`

The empty state is a full-screen atmospheric view rendered when `characters.length === 0`. It is not a separate route — it's a conditional render inside `characters/index.tsx`.

### EmptyState Component

```tsx
// components/characters/EmptyState.tsx
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';

export function EmptyState() {
  return (
    <View style={styles.container}>
      {/* Illustration area — robed wizard figure with rotating rune ring */}
      {/* See empty-state.html for the SVG design; implement as a react-native-svg component */}
      <WizardIllustration />

      {/* Text content */}
      <View style={styles.textWrap}>
        <OrnamentDivider />
        <Text style={styles.heading}>Your legend{'\n'}has yet to begin.</Text>
        <Text style={styles.flavour}>
          "Every great tale starts with a single name{'\n'}scratched into the pages of fate."
        </Text>
        <Pressable style={styles.ctaBtn} onPress={() => router.push('/characters/create')}>
          <Text style={styles.ctaIcon}>✦</Text>
          <Text style={styles.ctaText}>Create your first character</Text>
        </Pressable>
        <Text style={styles.hint}>Character Codex · Ready when you are</Text>
      </View>
    </View>
  );
}
```

**Illustration notes:**
- Use `react-native-svg` for the wizard figure and rune circle
- The rune ring rotates infinitely using `Animated.loop` + `Animated.timing` on a rotation value, or `useAnimatedStyle` from Reanimated
- Gold particles floating upward: small `Animated.Value` opacity/translateY loops, staggered with `useEffect` + `Animated.delay`
- The radial glow behind the figure is a plain `View` with `borderRadius: 999` and a radial-ish background using a centered shadow or a `react-native-linear-gradient` radial approximation

---

## Step 3 — My Characters Screen

Reference: `characters-list.html`

```tsx
// components/characters/CharacterCard.tsx
```

Each card displays:
- A **coloured band** at the top (6px height, class-specific gradient). Map class → gradient colours:
  ```ts
  const classBand: Record<string, string[]> = {
    wizard:    ['#4a1a6b', '#8b3ab4', '#c9922a'],
    fighter:   ['#6b1a1a', '#b43a3a', '#c9922a'],
    rogue:     ['#1a2a1a', '#2a4a2a', '#5a8a3a'],
    cleric:    ['#1a1a4a', '#3a3ab4', '#c9922a'],
    // etc. — default to a neutral gold gradient for unknown classes
    default:   ['#2a1a08', '#6b4a1a', '#c9922a'],
  };
  ```
  Implement using `expo-linear-gradient` horizontally across the band.

- **Avatar** — 56×56 rounded square. For now use a class emoji or icon as placeholder. Later this can be a character portrait image.
- **Name** in Cinzel Bold, class + race in Crimson Text italic below
- **Level badge** — crimson pill
- **Conditions row** — only rendered if `character.conditions.length > 0`. Shows condition chips (see design).
- **Stats row** — HP (with current/max), AC, attack bonus, initiative. Four equal columns with dividers.
- **HP bar** — filled proportionally to `hp.current / hp.max`
- **Footer** — "last active" timestamp on left, "View Sheet →" on right

**Tapping a card** navigates to `/(drawer)/character/[id]`

### FAB

A `+` button fixed to bottom-right. Navigates to `/characters/create`.

```tsx
<Pressable style={styles.fab} onPress={() => router.push('/characters/create')}>
  <Text style={styles.fabIcon}>+</Text>
</Pressable>
```

Position with `position: 'absolute', bottom: 32, right: 22` inside the screen's root view.

---

## Step 4 — Character Creation Wizard

Reference: `character-creation.html` (fully interactive — step through it to see all 6 steps)

### Routing Structure

The wizard uses a nested stack inside `characters/create/`. Each step is its own screen. This gives you native back-gesture support and URL addressability.

```
/characters/create          → step 1: Identity
/characters/create/race     → step 2: Race
/characters/create/class    → step 3: Class & Level
/characters/create/abilities→ step 4: Ability Scores
/characters/create/background→step 5: Background, Alignment & Personality
/characters/create/skills   → step 6: Skills
/characters/create/review   → step 7: Review
```

### Wizard Shell

A persistent layout wraps all wizard screens and renders:
- **Back button** (hidden on step 1)
- **Step indicator** ("Step 1 of 6")
- **Progress bar** (fills proportionally as steps advance)
- **Step dots** (7 dots; active dot is wider pill, completed dots are dimmer)
- **Next / Create button** at the bottom

```tsx
// app/characters/create/_layout.tsx
import { Stack } from 'expo-router';
import { WizardShell } from '@/components/wizard/WizardShell';

export default function WizardLayout() {
  return (
    <WizardShell>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </WizardShell>
  );
}
```

`WizardShell` reads the current route via `usePathname()` to derive the current step index and renders the chrome accordingly.

```ts
const stepRoutes = [
  '/characters/create',
  '/characters/create/race',
  '/characters/create/class',
  '/characters/create/abilities',
  '/characters/create/background',
  '/characters/create/skills',
  '/characters/create/review',
];
```

### Draft State

Use a simple Zustand store (or React context) to accumulate form data as the user moves through steps. Do **not** commit to the database until the final "Create Character" button is tapped on the review screen.

```ts
// store/characterDraft.ts
import { create } from 'zustand';

interface CharacterDraft {
  // Step 1
  name: string;
  playerName: string;
  campaign: string;
  // Step 2
  race: string;
  subrace?: string;
  // Step 3
  class: string;
  level: number;
  // Step 4
  abilityScores: {
    strength: number; dexterity: number; constitution: number;
    intelligence: number; wisdom: number; charisma: number;
  };
  // Step 5
  background: string;
  alignment: string | null;  // null = skipped
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  // Step 6
  skillProficiencies: string[];
}

const defaultDraft: CharacterDraft = {
  name: '', playerName: '', campaign: '',
  race: '', class: '', level: 1,
  abilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  background: '', alignment: null,
  personalityTraits: '', ideals: '', bonds: '', flaws: '',
  skillProficiencies: [],
};

export const useCharacterDraft = create<CharacterDraft & {
  set: (patch: Partial<CharacterDraft>) => void;
  reset: () => void;
}>((setState) => ({
  ...defaultDraft,
  set: (patch) => setState((s) => ({ ...s, ...patch })),
  reset: () => setState(defaultDraft),
}));
```

Call `draft.reset()` when the wizard is cancelled or after a successful creation.

---

## Step 5 — Wizard Steps in Detail

### Step 1 — Identity (`index.tsx`)

Three text inputs: Character Name (required), Player Name (optional), Campaign (optional).

Validation: block Next if name is empty. Show a subtle inline error message under the name field.

### Step 2 — Race (`race.tsx`)

2-column `OptionGrid` of race cards. Each card: icon, name, stat bonus hint. Tapping selects it (single-select within the grid).

Races to include: Elf, Human, Dwarf, Halfling, Dragonborn, Tiefling, Gnome, Half-Orc, Half-Elf, Aasimar. Match icons and bonus text from the HTML design.

```tsx
function OptionGrid({ options, selected, onSelect }) {
  // renders a 2-col grid of tappable cards
  // selected card gets gold border + gold text
}
```

### Step 3 — Class & Level (`class.tsx`)

2-column `OptionGrid` for class (12 options). Below that, a `+/−` stepper for starting level (1–20, default 1). Show a hint: "Most campaigns start at level 1. Check with your DM."

### Step 4 — Ability Scores (`abilities.tsx`)

A 2×3 grid of `AbilityBlock` components. Each block has:
- Ability name label
- `−` button · score value · `+` button (score clamped 1–20)
- Live modifier display below (`Math.floor((score - 10) / 2)`, formatted as `+N` or `−N`)

A "🎲 Roll 4d6 drop lowest" button at the top rerandomises all six scores.

```ts
function roll4d6() {
  const rolls = [1,2,3,4].map(() => Math.ceil(Math.random() * 6));
  return rolls.reduce((a, b) => a + b, 0) - Math.min(...rolls);
}
```

### Step 5 — Background, Alignment & Personality (`background.tsx`)

Three sections:

**Background** — 2-col `OptionGrid`: Sage, Soldier, Noble, Outlander, Entertainer, Acolyte.

**Alignment** — The section header row has the label on the left and a "Skip" tappable text on the right.
- Default state: 3×3 grid of `AlignmentCell` components (single-select)
- Skipped state: the grid is hidden and replaced by a muted placeholder card ("Not using alignment / You can set this later")
- An "Undo" link in the placeholder restores the grid
- `draft.alignment` is `null` when skipped, a string like `"Lawful Neutral"` when selected

**Personality** — four `TextArea` fields: Personality Traits, Ideals, Bonds, Flaws. All optional.

### Step 6 — Skills (`skills.tsx`)

A scrollable list of all 12 skills, each as a `ProficiencyItem` row:
- Circular checkbox on left (hollow → filled gold on select)
- Skill name
- Ability abbreviation on right

Skills and their abilities:
```ts
const skills = [
  { name: 'Acrobatics', ability: 'DEX' },
  { name: 'Animal Handling', ability: 'WIS' },
  { name: 'Arcana', ability: 'INT' },
  { name: 'Athletics', ability: 'STR' },
  { name: 'Deception', ability: 'CHA' },
  { name: 'History', ability: 'INT' },
  { name: 'Insight', ability: 'WIS' },
  { name: 'Intimidation', ability: 'CHA' },
  { name: 'Investigation', ability: 'INT' },
  { name: 'Medicine', ability: 'WIS' },
  { name: 'Nature', ability: 'INT' },
  { name: 'Perception', ability: 'WIS' },
  { name: 'Performance', ability: 'CHA' },
  { name: 'Persuasion', ability: 'CHA' },
  { name: 'Religion', ability: 'INT' },
  { name: 'Sleight of Hand', ability: 'DEX' },
  { name: 'Stealth', ability: 'DEX' },
  { name: 'Survival', ability: 'WIS' },
];
```

No hard cap enforced in the UI — class-appropriate limits are noted as a hint only. The character sheet lets users manage proficiencies after creation.

### Step 7 — Review (`review.tsx`)

Read-only summary cards grouped into: Identity, Ability Scores, Skills. Each group is a parchment `View` with key-value rows.

- Alignment shows as greyed italic "Not set" if skipped
- A muted note at the bottom: *"Spells, equipment, features and the rest can all be filled in from your character sheet after creation."*

**Create button** on this step:
1. Calls `createCharacter(draft)` — writes the character to the database
2. Calls `draft.reset()`
3. Navigates to `/(drawer)/character/[newCharacterId]`
4. Shows a loading state on the button while the write is in progress
5. On error, shows an inline error message and keeps the user on the review screen

---

## Step 6 — Database Write

On wizard completion, create the character record. The minimal shape to write at creation time:

```ts
interface NewCharacter {
  userId: string;
  name: string;
  playerName?: string;
  campaign?: string;
  race: string;
  class: string;
  level: number;
  abilityScores: AbilityScores;
  background: string;
  alignment: string | null;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  skillProficiencies: string[];

  // Derived at creation, can be edited later
  hp: { current: number; max: number; temp: number };
  ac: number;

  // Empty collections — populated later via the character sheet
  conditions: [];
  spells: [];
  inventory: [];
  features: [];
  currency: { cp: 0; sp: 0; ep: 0; gp: 0; pp: 0 };
}
```

**Derived values at creation:**
- `hp.max` = class hit die + CON modifier. Base hit die per class:
  ```ts
  const hitDie: Record<string, number> = {
    barbarian: 12, fighter: 10, paladin: 10, ranger: 10,
    bard: 8, cleric: 8, druid: 8, monk: 8, rogue: 8, warlock: 8,
    sorcerer: 6, wizard: 6,
  };
  // hp.max at level 1 = hitDie[class] + CON modifier
  ```
- `hp.current` = `hp.max` at creation
- `ac` = 10 + DEX modifier (unarmoured default — user updates after adding equipment)

---

## Step 7 — Cancellation & Navigation Edge Cases

- **Cancel button** (visible on all wizard steps): show a confirmation alert ("Abandon character creation? Your progress will be lost."). On confirm, call `draft.reset()` and navigate back to `/characters`.
- **Hardware back / swipe back**: treat the same as the wizard's own Back button — go to the previous step. Do **not** exit the wizard without confirmation if the user is past step 1.
- **Deep linking into a wizard step**: redirect to `/characters/create` (step 1) if `draft.name` is empty, to prevent arriving mid-wizard with no state.

---

## Implementation Order

1. Set up `characterDraft` store
2. Build `WizardShell` with progress bar, dots, step indicator, back/next buttons
3. Scaffold all wizard step screens as empty `<View>` placeholders so navigation works end-to-end
4. Implement step screens in order (1 → 7), testing draft state after each
5. Implement `createCharacter` write and post-creation navigation
6. Build `CharacterCard` component
7. Build `CharactersList` screen and wire up to database
8. Build `EmptyState` component with illustration
9. Implement auth gate redirect logic in `(app)/_layout.tsx`
10. Test full flow: login → empty state → create → character sheet → back to list → create second character
