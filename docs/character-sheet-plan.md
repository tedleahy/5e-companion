# Character sheet screen: data inventory and grouping

Planning for the character sheet mockups. The inventory below comes from
[data-model.md](data-model.md); the grouping is a proposal, not a decision.

## What the sheet has to show

Grouped by where it lives, because that determines whether the sheet reads it,
writes it, or derives it. "Derived" means the API computes it from the catalog
and the character, and `overrides` may replace it.

### Identity (Characters, CharacterClasses)

Name, token ink, alignment, rules version. Class list with
subclass and level per row, plus total level (derived, the sum of
CharacterClasses levels). Race, subrace, background, each a saved name that may
or may not resolve to a catalog row.

Experience points are not shown or used in the MVP; see Decided. The
`experience_points` column stays in the data model, nullable and unused.

### Vitals, the things that change every few minutes

- Current, maximum and temporary hit points
- Hit dice, one pool per class, as CharacterResources rows with `hit_die` in state
- Death save successes and failures, 0 to 3 each, only meaningful at 0 hit points
- Inspiration, a single boolean
- Armour class, initiative, speed. All derived, all overridable
- CharacterEffects: conditions, exhaustion with its level, concentration,
  and an active Wild Shape carrying its own hit points, armour class and speed.
  Each effect has a source, expiry triggers and remaining rounds

### Abilities and checks (Characters, CharacterProficiencies)

Six scores, their modifiers, and the proficiency bonus. Eighteen skills and six
saving throws, each with a rank of half, proficient or expertise, a derived
bonus, and possible rank or bonus overrides. Passive perception, investigation
and insight. Weapon, armour, tool and other proficiencies, which have a rank but
no bonus. Languages, which have neither.

### Actions (CharacterActions plus generated)

Most actions are generated at read time from spells, items and features. Only
wholly manual ones are stored. Each carries an attack bonus, damage and type,
range, save DC or display text. They want grouping by action, bonus action,
reaction, attack and other.

### Spellcasting (CharacterClasses, CharacterSpells, CharacterResources)

Per class: spellcasting ability, save DC, spell attack bonus, each derived or
overridden. Spell slots by level, Pact Magic and Mystic Arcanum uses, all
CharacterResources rows. Then the spell list itself: level, roles (known,
spellbook, always prepared, mastery, signature), today's `prepared` flag,
per-spell casting statistics, notes, and the catalog detail a player needs to
actually cast it.

One row is one access path, not one spell. The same spell can arrive from a
class, a race, an item and a manual addition, with different roles and different
save DCs. The sheet may group those under one heading but has to keep each path
editable.

### Resources (CharacterResources)

Hit dice, spell slots, Pact Magic, Rage, Ki, Wild Shape uses, Arcane Recovery,
item charges, manual pools. Each has a current value, an effective maximum, and
a `reset_on` of short rest, long rest, dawn or manual. That last field is what
lets the sheet offer rest buttons that recover the right rows.

### Features and traits (CharacterFeatures)

Class features, subclass features, racial traits, the background feature, feats
and manual entries, all in one list with names, descriptions and origins. Some
carry state, such as the beast forms a druid knows.

### Inventory (CharacterItems, Characters)

Items with quantity, equipped flag and slot, attunement, container nesting,
charges and notes. Attunement has a cap of three that the sheet should count.
Currency in five denominations. Weight and carrying capacity are derivable from
the catalog but no column exists for them yet.

### Narrative (Characters.profile, Characters.notes)

Age, height, appearance, personality traits, ideals, bonds, flaws, allies,
enemies, and free notes.

### Meta

Rules warnings, which are never blocking: current above maximum, missing ability
scores, odd choice counts. Unresolved catalog references, which show a saved
label and a manual path. Lock version conflicts when two devices edit at once.
An in-progress level-up draft. Origins, so every derived row can explain which
class, race or feat put it there.

## Proposed grouping

Split by what the player is doing, not by where the paper sheet prints it.

**Always visible.** Token, name, class and level line, hit point meter with
temporary hit points, armour class, initiative, speed, active conditions,
inspiration, concentration, and a rest control. This is the block journey 3
exists for, and it should never be more than zero taps away.

**Play.** Attacks and actions by type, the resource trackers, death saves when
at zero hit points. The tab you sit on during combat.

**Stats.** Abilities, saving throws, skills, passive scores, then the
proficiency and language lists.

**Spells.** Casting statistics per class, slot trackers, and the spell list by
level with preparation toggles. Hidden for characters with no spell access.

**Gear.** Items, containers, attunement count, currency.

**Character.** Features and traits, narrative profile, notes, level-up entry.

Deliberate duplication: slot trackers appear in Play and in Spells, hit dice in
the rest control and in Play. Both are cheaper than making a player change tabs
mid-turn.

## Groupings considered

- **One long scroll in paper-sheet order.** Familiar, and desktop can show it
  in three columns like the PDF. On a phone it is a very long scroll, and the
  paper order groups by print layout rather than by use.
- **Six tabs, no persistent header.** Simpler to build, but hit points and
  conditions vanish while you read a spell.
- **A pinnable panel deck.** Player chooses which blocks sit at the top.
  Powerful, more to design, and unclear defaults.

## Decided

All dated 12 September 2026.

- Navigation is a persistent header plus tabs. The two alternatives above are
  not being drawn.
- The first pass is phone only at 390 by 812. Desktop and tablet come after.
- One density treatment, not three, so the pass can carry the tab bar and spell
  detail options instead.
- A detail view is a full-screen push, not a bottom sheet or an in-place
  expansion. This covers detail screens only; it is not a ban on bottom sheets
  elsewhere.
- In-play values are always live. Persistent facts sit behind a per-section edit
  affordance, which this pass does not draw.
- The header shrinks from tall to a one-line bar on scroll, and it **animates**
  between the two continuously rather than snapping. This is one of two exceptions to the system's no-motion rule; the other is
  the dice roll. The mockup draws the two end states only.
- A form swap shows the form's numbers as the live ones, with the character's
  own on a line underneath.

- The tab bar is attached under the header and sticks with it. A bottom bar was
  drawn and dropped.
- Spell details are sheet led: one card per access path, with the rules text
  under a disclosure. A catalog-led version was drawn and dropped.
- The compact header drops the token and the meter and shows a hit point number.
  Vitals on the header plate sit on a sheet cutout, and header tokens carry a
  sheet ring.
- Every control has a hit area of at least 44 by 44. See Hit areas.
- Items and features carry a stored `position`, so players can reorder them.
  The data model gained the column on CharacterItems and CharacterFeatures, and
  level-up preserves it. 13 September 2026.
- Money changes per coin: each coin opens a gain or spend pad, and the app never
  converts between denominations. 13 September 2026.
- Edit can add a feature from the catalog or a custom one. Both get a manual
  origin, so level-up reconciliation leaves them alone. 13 September 2026.
- Adding a spell suggests the obvious access path as one editable summary.
  Casts it differently reveals the class or the spell's own ability, fixed
  numbers, role and uses. 13 September 2026.
- Add always opens its own screen and commits from that screen's footer, in view
  mode and inside Edit. Edit drafts stage only reordering and removal.
  13 September 2026.
- The level-up wizard is deferred again, alongside edit conflicts and desktop
  and tablet. 13 September 2026.
- The sheet menu holds Add a spell, shown only for a character without a
  Spells tab, Edit basic details and Delete character. It opens as a static bottom sheet that
  appears instantly, with no drag, and closes on a tap outside or its Close row.
  It is the system's one overlay shape; the conditions picker reuses it.
  13 September 2026.
- Adding a feature from the catalog searches class and subclass features and
  racial traits, the only feature catalogs the data model has. Feats and
  background features come through the custom form. 13 September 2026.
- The app does not use experience points in the MVP. Levelling up is manual:
  the player starts it whenever their table levels, and nothing prompts it.
- Detail screens offer Roll only where the app stores the result: hit dice, hit
  points and death saves, drinking a healing potion, and concentration saves,
  because a lost save ends the concentration anchor. Skills, saving
  throws and attacks show their numbers and the table rolls.
- Item details carry full item management: equip, attune, quantity, move
  between places and containers, and remove.
- Detail screens are drawn as a representative set, one frame per shape, not
  every variant.
- Unticking a prepared spell, and the reason behind an override, stay as the
  data model has them for now. The model does not change, and the sheet shows an
  override without a reason.

- Saving throws are proficient or not. Their detail offers None and Proficient
  only; half and expertise stay with skills and tools. 13 September 2026.
- Every value on the header plate opens its detail, whether or not it carries
  an override: the armour class ring and the initiative, speed and spell save
  tiles are all buttons. 13 September 2026.
- A character with a level-up draft keeps a normal row in the character list,
  with a Levelling up mark, and also appears in the draft tray with Resume.
  Only creation drafts are tray only, because they have no character yet.
  13 September 2026.
- Where the imported data differs from the printed SRD, the data is corrected
  in `srd-json-files` and the correction recorded in ATTRIBUTION.md, so the
  mockups and the app both follow the book. Two corrections so far: the
  warlock's invocations at level 6, and the disguise kit's tool category.
  13 September 2026.
- The two example characters are drawn mid-session so the rest screens have
  something to show: Brenna has spent one pact slot, and Alarra is at 38 of 52
  with one Channel Divinity and two hit dice spent. The character list agrees.
  13 September 2026.

- Conditions change from a bottom sheet. A dashed Condition control sits with
  the header marks, and tapping any condition mark opens the same sheet. It
  toggles live: a tap adds a condition with no end, and a second tap removes
  it. 13 September 2026.
- The condition just added offers an optional end: by hand, rounds counted down
  by hand, any rest, or a long rest. These are the data model's empty
  `expiry_triggers`, `remaining_rounds` ticking at the end of the character's
  own turn, `short_rest` with `long_rest`, and `long_rest`. A save that ends a
  condition stays by hand, because the model has no save trigger. Exhaustion is
  a level stepper in the same sheet, and a custom condition opens its own
  screen, as every Add does. 13 September 2026.
- Inspiration and concentration stay out of the conditions sheet; they are
  review finding 21. 13 September 2026.
- A character's concentration is a CharacterEffects anchor row with
  `is_concentration` set, one per character, written when a concentration spell
  is cast. The header's concentration mark, the compact header and the spell
  detail's concentration card all read the anchor. Ending it removes the anchor
  and every effect that shares its instance key. See Concentration under
  CharacterEffects in data-model.md. 13 September 2026.
- The conditions sheet is the status sheet. Inspiration sits at the top as a
  toggle, then the conditions grid, then exhaustion. Every mark on the plate
  opens it except concentration, and so does the Condition control. Unticking
  inspiration spends it. 13 September 2026.
- The concentration mark, on the tall and the compact header, opens the spell's
  detail. A concentration card in overprint ink leads it: duration at the level
  cast, what ends it, the target from the anchor's notes, and End
  concentration. Ending acts at once, because opening the detail is the
  deliberate step. 13 September 2026.
- Concentration prompts sit where it breaks. After damage, the hit point pad
  becomes a concentration save with its DC, Roll, Kept and Lost. While
  concentrating, the status sheet names the conditions that would end it.
  Casting another concentration spell warns on its detail, and its Cast button
  names what it ends. None of these block. 13 September 2026.
- At 0 hit points the hit point pad gains a Death save tab beside Damage and
  Heal. The vitals block and the header's death saves both open it.
  13 September 2026.
- A death save is recorded by Roll, or by one of four buttons for a roll made at
  the table: 1, 2 to 9, 10 to 19, and 20. Only the band matters, so nothing is
  typed, and the app applies the rules either way. The success and failure pips
  correct mistakes with the pip rule. Mark stable covers stabilising by someone
  else and fills the successes. 13 September 2026.
- Damage at 0 hit points is a death save failure, with a critical hit toggle for
  two. When the damage would kill, the pad says so and its button turns
  destructive and names the outcome. Damage of the maximum or more kills
  outright and is stored as three failures. 13 September 2026.
- Dropping to 0 adds Unconscious automatically, and it ends when hit points
  come back. A dead character's pad offers Bring back in place of Heal,
  defaulting to 1 hit point, which clears both counts. 13 September 2026.
- The hit point pad is the static bottom sheet, opened from the vitals on the
  tall header or the hit points on the compact one, so the player keeps their
  place. Its tabs, the concentration save and Bring back all live inside it.
  This replaces the earlier rule that the pad opens in the header.
  13 September 2026.
- The compact header shows the first name, one status mark, the hit points and
  armour class. The full name stays in the tall header. The hit points are a
  button, and temporary hit points are spelled out as "+5 temp", so colour no
  longer carries them alone. 13 September 2026.
- The compact status slot holds one mark in the design system's priority
  order: a condition before concentration. More than one condition reads
  "Poisoned +1". A condition opens the status sheet and concentration opens the
  spell. 13 September 2026.
- Rest stays out of the compact header. Rests happen between fights, when
  scrolling back to the tall header costs nothing. 13 September 2026.
- Roll and I rolled open one roll sheet. Each die is a big value square with
  its die size under the number. For I rolled, the player taps the face each
  die showed, and the app adds the modifier, so nothing is typed and no
  keyboard covers the sheet. The dice stay editable after an app roll. Up to
  four dice show separately; five or more collapse into one total entered on a
  number pad. 13 September 2026.
- The dice roll is the second motion exception. Each die jumps between fixed
  poses while its number flicks, stepped rather than smooth, with its rose
  shadow held still, then sinks onto the shadow to land. It takes about half a
  second, a tap skips it, reduced motion shows the result at once, and screen
  readers hear only the result. No other animation follows from this.
  13 September 2026.
- The roll's note says what confirming will do before it happens, allowing for
  caps, and for saves it names the outcome. The confirm button names the result
  and turns destructive when the result kills. 13 September 2026.
- There is no free re-roll. Re-roll appears only where a rule grants one, such
  as the halfling Lucky trait on a 1. 13 September 2026.
- Where a roll starts inside the hit point pad, as for death and concentration
  saves, the roll replaces the pad's content in place rather than opening a
  sheet over a sheet. 13 September 2026.
- A warning strip is a margin note: card colour with no tint, a solid 4px rule
  down its left edge in rose text colour, an outline warning icon, and a bold
  lead. Dashed borders mean adding or not real yet, the rose tint means a draft
  and nothing else, and a solid rose edge means a warning, so a warning can sit
  inside a block being edited without reading as part of the draft.
  13 September 2026.
- Notes are the exception to the Edit rule. The character's notes and each
  access path's note are fields you tap and type into, with no Edit button.
  They save after typing pauses and when the field loses focus, and a small
  line reads Saving, then Saved. Only a deliberate tap opens the keyboard, not
  a touch that starts a scroll. Edits from two devices at once follow the
  deferred edit-conflict work. 13 September 2026.
- A long note shows its first six lines with Show all, and opens fully while
  it has focus, so it never pushes the rest of a tab away. 13 September 2026.
- A spell note belongs to one way to cast, because CharacterSpells stores notes
  per access path. Each path card on the spell detail carries its own note
  field, and there is no spell-wide note. 13 September 2026.
- The origin line always sits inside a card. Where the rules text folds away
  behind a disclosure, the disclosure and the origin line share one bordered
  fold, so the origin never floats on bare paper. 13 September 2026.
- A pip row is one adjustable control: a spinbutton on web and an adjustable
  element on native. It is named by the resource and announces its value, such
  as "Pact magic, 1 of 2 left". Arrow keys or a screen reader swipe step it,
  Home spends every use and End restores them. The pips stay tap targets for
  touch, following the pip rule, but are not announced one by one.
  14 September 2026.
- Selected state lives in ARIA attributes. Switches that swap the content below
  are tabs with aria-selected: the sheet tabs, rest length, catalog or custom,
  the hit point pad's tabs and the coin switch. Single choices are radio groups
  with aria-checked: ranks, alignment, token colour, ability, uses and ends,
  gain or spend, and the list's filter chips. Multi-select toggles such as
  conditions keep aria-pressed. Arrow keys move a choice, with focus roving so
  Tab lands on the chosen item. Disclosures report aria-expanded.
  14 September 2026.
- A bottom sheet is modal. While it is open the screen behind is inert and focus
  cycles inside it. Escape, Close or a tap on the scrim closes it and returns
  focus to the control that opened it, which carries aria-haspopup and
  aria-expanded. 14 September 2026.
- A toggle row with a details chevron is two siblings, the toggle's label and
  the details button, so opening details never toggles the row.
  14 September 2026.
- The vitals block is named by its numbers, such as "31 of 44 hit points, 5
  temporary. Open the hit point pad". Meters and the temporary block are hidden
  from screen readers, because the text line carries the values.
  14 September 2026.
- Token colours are named by the theme: Blue, Rose and Purple in the default
  theme, shown under each swatch and used as its label. The character still
  stores the ink role. 14 September 2026.
- On the character list, a card's name is a link stretched over the card, and
  the desktop Open sheet is a link. Filter chips, buttons and links meet the 44
  tap area rule, and the search field is a real 44 tall. 14 September 2026.
- Names of features, feats, subclasses, invocations, spells and items are
  sentence case, keeping proper nouns: Dark One's own luck, Pact of the blade,
  Hunger of Hadar. 14 September 2026.
- UI copy uses second person for the player and third person for the
  character: "until you confirm", "when she drops a foe". Quoted rules text is
  left as printed. Short action summaries stay as verb phrases, such as "Move
  the curse to a new target". 14 September 2026.
- Open: the imported catalog names things in title case, as the SRD prints
  them, and automatic sentence casing cannot tell a proper noun like Hadar from
  an ordinary word. Either catalog rows gain a stored display name, or the
  importer applies a maintained list of proper nouns. Not decided.
- UI copy uses American spelling to match the catalog: armor class, color,
  gray, leveling. The plan, the review and the design system's prose stay in
  British English, because players never see them. The table is "the DM",
  never "the GM", and abbreviations drop their full stops. 14 September 2026.
- In the proficiencies and languages block, both add rows sit together at the
  foot, in view mode and in Edit, so neither looks tied to one group.
  14 September 2026.
- The conditions sheet is the menu's static sheet: a three-column grid of
  names with Custom in the last cell, the chosen condition's end under it, then
  exhaustion and Close. It stops below the header marks. A taller scrolling
  sheet with a summary per condition was drawn and dropped, because half its
  list sat below the fold and its handle bar read as draggable. 13 September
  2026.
- The one-overlay rule widens to one overlay shape. The static bottom sheet
  may hold a quick in-play picker, such as the status sheet or the hit point
  pad, as well as the sheet menu. Detail screens
  stay full-screen pushes, and anything that commits from a footer stays a
  pushed screen. 13 September 2026.
- The static bottom sheet is modal. A scrim dims the whole screen behind it,
  so the page reads as inert, and a tap on the scrim closes the sheet. The
  scrim is a derived token, `--scrim`, ink at 40%, so it follows the inks and a
  future dark set can derive its own. It appears instantly like the sheet. The
  sheet has no handle bar, because nothing drags. On web the sheet is a dialog
  with `aria-modal` and traps focus. 13 September 2026.
- A mark on an item-detail toggle stays only when it names something the title
  does not. Equipped and Attuned do not repeat themselves as marks. The slot
  lives on the Move row. 14 September 2026.
- Structural CSS holds size, gap and grid. Colour, fill and shadow stay under
  `.riso`, including row rules, pip and meter fills, and token backgrounds.
  Detail titles are 19px in CSS when they sit beside the back button. Text
  hierarchy uses the dim token, never opacity. 14 September 2026.

## Working rules for the drawing

- Tapping the hit point meter, or the hit points on the compact header, opens the
  heal and damage pad as the static bottom sheet.
- Spending a resource is a tap on a pip. A filled pip spends the last filled
  one, an empty pip restores the first empty one. Explicit plus and minus only
  for pools larger than about six.
- One rest control. It asks short or long, then lists what recovers before
  confirming, which `reset_on` makes possible.
- All 18 skills are always visible, proficient ones marked. No filter.
- Spells group by level. Access paths merge under one name, with a source mark
  when the same spell arrives twice.
- Origins appear as a dim "from" line in the detail view.
- Warnings get a mark on the affected value and a dismissible strip under the
  header.
- A find field in Spells and Gear only.
- No weight or encumbrance. There is no column for it.
- Draw a single-class character, with a multiclass header as a variant.
- The mockup reuses the riso mixer shell from `character-list.html`. New
  component CSS keeps the structural and skin split so it can graduate into
  design system v0.4.

### Deferred

Desktop and tablet layouts, the level-up wizard beyond an entry button,
lock-version conflicts, hover, dark mode, and switching characters from inside
the sheet. Unresolved catalog references get a warning strip in this pass but no
repair screen.

## Mockup deliverable

`mockups/character-sheet.html`, fifty-eight phone frames in twelve sections, built on
the same ink mixer as the character list so a theme change still costs five
values. Frame numbers count automatically in the gallery.

Brenna Duskhollow, level 6 Fiend warlock:

1. Play tab
2. Play tab, scrolled, with the header shrunk
3. Spells tab
4. Spell detail
5. Hit point pad, opened from the meter
6. Header variants: wild shape, zero hit points, two classes, warnings

Alarra Vane, level 7 Life cleric:

7. Play tab, preparing caster
8. Spells tab, preparing caster
9. Prepare spells
10. Stats tab, with overrides
11. Armour class detail

Resting, gear, the character tab and editing:

12. Short rest, Brenna
13. Long rest, Alarra
14. Gear tab, Brenna
15. Character tab, Brenna
16. Editing a section, Alarra

Detail screens:

17. Weapon, Brenna's daggers
18. Moving part of a stack
19. Armour, Alarra's chain mail
20. Magic item, ring of spell storing
21. Consumable, potion of healing
22. Passive trait, darkvision
23. Feature with uses, Channel Divinity
24. Feature with choices, eldritch invocations
25. Skill with an override, Medicine
26. Common actions

Lists, money and the last details:

27. Money pad
28. Editing a list, Brenna's carried items
29. Adding an item
30. Adding a custom feature
31. Container, Brenna's backpack
32. Removing a container with contents
33. Removing a granted item
34. Saving throw, Alarra's Wisdom
35. Feature with stored state, Wild Shape
36. Racial trait with choices, Skill Versatility
37. Manually added action

Adding spells, proficiencies and languages:

38. Adding a spell, suggested path
39. Adding a spell that casts differently
40. Editing proficiencies and languages
41. Adding a proficiency
42. Adding a language

The catalog search and the sheet menu:

43. Adding a feature from the catalog
44. Sheet menu, for a character without spells
45. Editing basic details
46. Deleting a character

Conditions:

47. Status sheet, Mudge

Inspiration and concentration:

48. Status sheet with inspiration, Brenna
49. Concentration on the spell detail, Hex
50. Concentration save after damage
51. Casting a second concentration spell

Death saves:

52. Death save tab, Mudge dying
53. Damage at 0 hit points
54. Bringing back a dead character

Compact header:

55. Hit point pad from the compact header, Mudge

Rolling dice:

56. I rolled: entering the dice from the table
57. Roll in the app: spending hit dice
58. A death save rolled inside the pad, with Lucky

A Magic Initiate feat gives Brenna a second casting stat block, and Cure wounds
reaches her twice, once through the feat and once through an attuned Ring of
Spell Storing. That is why its detail screen has two cards. Alarra prepares
spells, which a warlock cannot, and two of her values are replaced by the player.
The character list already shows her armour class as 19; her gear calculates 18.

## Seeing it changed more

The first version was audited numerically and looked fine on paper. Four things
only showed up once it was rendered.

- **A full health meter was invisible.** Filled segments are structural ink and
  the header plate is structural ink, so seven of ten segments vanished. Only
  hurt meters, which turn rose, were visible at all. The vitals now sit on a
  sheet cutout inside the plate, the way the stat tiles already did.
- **A structural token disappeared on the plate** for the same reason. Tokens in
  the header now carry a 2px sheet ring. Rose and overprint tokens were fine,
  which is exactly why a numeric check missed it.
- **Every list row collapsed to its content width** and staircased down the
  page. A `<button>` sizes to fit-content even with `display:flex`. Rows need an
  explicit `width:100%`, and `.act` was also the one button that never reset the
  browser's default border and background.
- **Temporary hit points read as part of the hit point bar.** They were drawn as
  meter segments with empties, but temporary hit points have no maximum, so the
  empty segments meant nothing and the eye merged the two bars. Temporary is now
  one solid overprint block with the amount in the text.
- **The compact header's concentration dot** carried its meaning by colour
  alone. It is now a mark reading the spell's name.

## Screenshots

`./mockups/shoot.sh character-sheet` renders each frame to `mockups/shots/` at
2x with headless Chromium. Pass frame numbers to render a subset. The script
serves the page over localhost because the Chromium snap cannot read `/tmp`, and
it injects the frame isolation into a throwaway copy so the mockup never carries
screenshot code. Shots are generated and gitignored.

## What drawing it changed

- **Resource pips went from 16px to 22px.** Spending a spell slot mid-combat is
  the most common tap on the screen and it cannot be a 16px target with 3px
  gutters.
- **Tab targets went from 31px to 43px.** A tab bar is primary navigation.
- **The compact header dropped the character token.** Six things did not fit in
  390px, and the name was truncating. Identity is carried by the name inside the
  sheet, and the token is still in the tall header. Confirmed.
- **Secondary text on the header plate is `on-a`, not `dim`.** Dim cannot reach
  4.5:1 on structural ink. Hierarchy there comes from size and weight only.
- **Temporary hit points are overprint segments** after a gap in the meter, a
  new meter state the list screen never needed.

## Measurements

- Tall header: 228px of 812, or 28% of the screen. Shrunk: 54px.
- Compact header plus attached tabs: 112px, up from 108 once the tabs carried
  icons.
- Every text and surface pairing passes 4.5:1. The tightest are the inactive tab
  and the idle pad tab at 4.51 and 4.52, both inherited from the chip
  derivation.
- Structural text on the editing draft skin is the new tightest pairing, about
  4.51 over paper. It is the same translucent fill the character list's draft
  card uses, and the paper grid shows through it.
- No horizontal overflow and no truncated text in any frame.

## Still open after this pass

Every phone screen in scope is drawn at least once. What remains is deferred:

- **The level-up wizard.** The Character tab has its entry and draft card; the
  flow from character-flows.md is its own screen set.
- **Edit conflicts.** `lock_version` catches a change made from another device
  while a section is open. Nothing shows what happens then.
- **Desktop and tablet.**

## Cleric pass

Drawn 12 September 2026 against the SRD data. Cleric 7 slots are 4, 3, 3 and 1,
chain mail is 16 with no Dexterity, and the shield adds 2. The SRD Life domain
has seven spells by level 7: it omits Guardian of Faith, so Alarra has seven
domain spells, not eight.

### Preparation

- In play, the Spells tab lists only prepared spells. Domain spells carry a
  Domain mark and count separately from the limit.
- Preparation happens on its own full-screen push behind a Change button,
  because it follows a long rest and should not be one stray tap away mid-fight.
- That screen lists the whole class list up to the character's highest slot,
  read from ClassSpells. The whole row toggles; details sit behind a separate
  chevron at the end of the row.
- The toggle is a 22px square in structural ink with a tick. Domain spells use
  the disabled state, ticked with no ink, plus the mark that says why.
- New marks a spell chosen since the last save, so the change shows before it
  is committed.
- Going over the limit is allowed, as the flows doc requires. The counter fills
  to the limit and spills into a rose block, and a warning strip explains the
  rule. Save sits on the bottom edge that the attached tabs left free.

### Overrides

- A replaced value carries the override badge: an 18px sheet circle with a
  pencil in a rose ring, pinned to the value's corner the way the level badge is
  pinned to a token. Inline on a row, it sits after the number. The pencil shape
  carries the meaning, so it does not depend on colour.
- The Stats tab legend names it "Set by you".
- Tapping an overridden value pushes a detail screen. It shows the replacement
  and the calculated value, a stepper to edit the replacement, a button to go
  back to the calculated value, and the calculation with every contributor.

### Proficiency rank

Rank is a 12px shape, never colour alone: an empty square for none, left half
filled for half, filled for proficient, and filled with an inner ring for
expertise. The Skills block carries a legend. Skill and saving throw rows sit in
two columns, each row 44 tall because each opens its own detail.

## Rest, gear, character and editing pass

Drawn 12 September 2026.

### Tab icons

Five outline icons on the 16 grid at stroke 1.8, above each label: a sword for
Play, a d20 for Stats, a four-point spark for Spells, a pack for Gear and a
figure for Character. They follow the existing icon rule and take the tab's
text colour.

### Play tab for a preparing caster

- Slots across several levels sit in one two-column grid inside Resources, a
  level label and its pips per cell, instead of one row per level.
- Channel Divinity is one resource, and each action that spends it carries a
  Channel mark.
- A cantrip that forces a save shows the DC and the save's ability in the attack
  table's Hit column.

### Rest

- Rest opens a full-screen push with a Short rest and Long rest switch on the
  header plate, and the character's current hit points underneath.
- A short rest leads with spending hit dice: a count stepper, the dice
  expression and its average, then Roll in the app or I rolled for dice rolled at
  the table.
- Everything that changes shows before and after. Effects that end get an Ends
  mark. Resources the rest does not touch are listed too, so nobody wonders
  whether the app forgot them.
- A long rest for a preparing caster ends with a prompt to change prepared
  spells, which opens the prepare screen.
- The primary action sits in the sticky footer.

### Gear

- Money leads the tab, five coin tiles that each open a pad.
- Items group as Equipped, with their slot as a mark; Attuned, with the count
  against three; and Carried.
- A container expands in place, contents indented behind a rule.
- Quantity follows the name. There is no weight.

### Character tab

- A level-up card is always on the tab, because levelling is manual and nothing
  triggers it. It names the current class and level, repeats the character
  list's reassurance that nothing changes until confirming, and uses the
  outlined secondary button: a permanent rose button would compete with the
  whole tab, and tapping it only opens a draft. While a level-up draft exists,
  it becomes the dashed draft card instead.
- Features and traits group by origin: class, subclass, race, background and
  feat.
- The profile is labelled values for short fields and short paragraphs for
  personality traits, ideals, bonds, flaws, and allies and enemies. Notes follow.

### Editing a section

- Blocks holding persistent facts carry an Edit button in their header. In-play
  values never do.
- An open block takes the draft skin from the character list, dashed border,
  rose fill and no shadow, because nothing is real until Save. Cancel and Save
  replace Edit in its header.
- Numbers change with steppers, derived values follow live, a Was mark shows the
  original, and a line spells out knock-on effects before saving.
- Only one block edits at a time. The others show a disabled Edit, and the
  header stays live.
- The Stats tab gained its proficiencies and languages block.

## Detail screens pass

Drawn 12 September 2026 against the SRD data and the data model.

### One layout

- The header plate names the thing and its kind: "Dagger, simple melee weapon".
- A card with this character's numbers comes first, then controls, then the
  rules text, then a dim line saying where it came from.
- Rules text starts expanded on items, traits and skills, where the text is the
  content. It folds behind a disclosure when option cards carry the detail, as
  on spells and Channel Divinity.
- Actions open the detail of their source. Mace opens the item, Healing word the
  spell, Preserve Life the feature. Only common actions and manually added
  actions need screens of their own.
- A detail links to related details: chain mail to armour class, darkvision to
  Devil's Sight, the ring to its stored spell.

### Items

- Weapons lead with to hit, damage and range for this character, and name the
  ability used. Armour leads with what it does to armour class.
- Controls: an Equipped toggle, a quantity stepper for stacks, where the item
  is with a Move button, and Remove at the foot. A mark on a toggle stays only
  when it names something the title does not. The slot lives on the Move row.
- Toggles reuse the preparation row. Remove is a new destructive button, outlined
  in rose text ink with no shadow, so it never looks like the primary action.
- Move is a pushed screen that asks how many before where. Moving part of a stack
  splits it, which is the data model's rule. Destinations are single choice with
  a round marker, and the current place is disabled.
- Changing something live that has a knock-on effect says so first. Taking off
  chain mail explains that the calculated armour class drops to 12 while the set
  value of 19 stays.
- The catalog holds magic items as prose, so the app never reads attunement or
  charges from them. Attunement is the character's own flag, counted against
  three. Charges are a manual resource with its own maximum and the item as its
  origin, which the data model already supports.
- A consumable that heals gets Roll and I rolled, because hit points store the
  result.

### Features

- A passive trait shows what it does in numbers, its rules text, and related
  links. It has no controls; changes belong to the Features section's Edit.
- A feature with uses shows its pips first, then one card per effect with its own
  numbers and a Use button that spends one.
- A feature with choices lists the chosen options with their rules text, marks
  the ones that change the sheet, and points to level-up for swapping.

### Skills

- The armour class pattern: the value with its override badge, a stepper, a way
  back to the calculated value, and the calculation.
- Proficiency rank is a four-way selector using the rank shapes. The selected
  option inverts to structural, as the system's selected state requires. Picking
  a rank other than the one advancement gave writes the rank override.
- No Roll button.

### Common actions

The SRD's actions in combat, with the character's numbers where they apply.
Grappling and shoving are special attacks made with the Attack action, not
actions of their own, so the Play tab lines now end with Search, not Shove.

## Lists, money and last details pass

Drawn 13 September 2026 against the SRD data and the data model.

### Money

- Tapping a coin opens a pad for that denomination: Gain or Spend, a stepper,
  quick amounts, and a before and after line. A row of the five coins switches
  denomination without leaving the pad.
- The app never converts between coins.

### Editing a list

- Edit on a list block opens the draft skin, as on a block of fields. Each row
  gains a drag handle at the start and a remove button at the end, both with full
  hit areas.
- Removals are staged: a removed row stays in place, struck through with a
  Removing mark, until Save. Cancel restores everything.
- Add sits at the foot of the list. It opens its own screen and saves straight
  away, so the draft holds only reordering and removal.
- Features and traits use the same pattern on the Character tab.

### Adding

- Adding opens a pushed screen with a search field. Catalog results show kind and
  cost, and a custom row at the top offers the typed name as a custom item.
- Picking a result reveals how many and where it goes, and the footer names the
  whole action.
- Adding a feature has a Catalog and Custom switch. The custom form takes a name,
  a description and where it shows, and an optional uses toggle that creates a
  manual resource with its own maximum and reset.

### Removing

- Removing a container with contents asks what happens to them, with the data
  model's three answers: into another container, loose in carried items, or
  discarded with it. An answer that cannot apply is disabled with the reason.
- Removing something a class, race or background granted explains that level-up
  will not bring it back, that it can be restored in a level-up review, and takes
  an optional reason, which the suppression stores.
- Both use the destructive button in the footer, never the rose primary.

### The last detail shapes

- A saving throw follows the skill detail. Without an override it offers Replace
  the bonus instead of a stepper.
- A container lists its contents with their own chevrons and an Add to it
  action. There is no capacity, because the catalog has no data for it.
- Wild Shape shows its uses, its limit from the feature, and the known forms from
  the feature's state, each with its numbers and a Transform button that spends a
  use and starts the form. Adding a form searches the monster catalog and warns
  outside the limit.
- A racial trait with choices lists what was chosen, each opening its own detail,
  with a Change button that opens the Features draft.
- A manually added action shows the numbers its state holds and its display text,
  with Edit and Remove, because the player owns all of it.

## Spells, proficiencies and languages pass

Drawn 13 September 2026 against the SRD data and the data model.

### The Add rule

Every Add, in any list, opens its own pushed screen and saves when that screen's
footer button is pressed. It appears in view mode and inside Edit. An Edit draft
stages only reordering and removal. The carried-items and backpack frames now
agree.

### Adding a spell

- Add a spell sits at the foot of the Spells tab. For a character without that
  tab, it lives in the sheet menu, and adding a first spell makes the tab appear.
- The search has a Catalog and Custom switch and a custom row at the top, like
  adding an item.
- Picking a spell proposes the obvious access path as one summary card with the
  character's numbers: prepared through Alarra's cleric casting, known through
  Brenna's pact. Casts it differently reveals the path choice (a class, the
  spell's own ability, or fixed numbers), a six-way ability selector, and uses.
  Uses become a manual resource with a maximum and a reset.
- A spell outside the class's list is allowed with a warning strip.
- Each path card on the spell detail ends with its own Remove, because each
  access path is a separate row. A granted path confirms its suppression like a
  granted item.

### Proficiencies and languages

- Skills and saving throws have no add flow. All of them always exist, and
  proficiency in one is a rank change on its detail.
- The Stats tab block gains Add a proficiency and Add a language rows in view
  mode. Its Edit lists proficiencies by kind, then languages, each with a remove
  button and no drag handle, because these rows have no stored order and sort by
  kind and name.
- Removing a proficiency or language a race, class or background granted is
  staged, then confirmed as a suppression on Save.
- Adding a proficiency searches weapons, armour, tools and other. Tools and other
  get a three-way rank selector without None. Weapons, armour and languages get
  no rank.
- Adding a language lists the catalog's Standard and Exotic groups with script
  and typical speakers. Languages already known are disabled with a Known mark.

## Catalog search and sheet menu pass

Drawn 13 September 2026 against the SRD data and the data model.

### Adding a feature from the catalog

- The Catalog side of Add a feature searches class and subclass features and
  racial traits. Results for the character's own class, subclass and race list
  first, then everything else.
- A result that does not fit the character, such as a feature above their level
  or another race's trait, gets a mark in the list and a warning strip once
  picked. It can still be added.
- Feats and background features have no catalog table, so a hint under the
  results points to the custom form.
- The picked feature shows its rules text and where it will list, with an Added
  by hand mark.

### Sheet menu

- The header's menu button opens a static bottom sheet along the bottom edge:
  a sheet-coloured panel with a structural top border and the rose rule above
  it, a small title naming the character, and one 56-tall row per action with
  an outline icon and a dim second line. It appears instantly, with no drag and
  no slide, over a scrim that dims the page, and closes on a tap on the scrim or
  an outlined Close row. It is the only overlay shape in the system, shared with
  the conditions picker, and its rows sit within thumb reach.
- While the sheet is open, the menu button shows the pressed ring.
- Rows: Add a spell, only for a character with no Spells tab; Edit basic
  details; and Delete character, separated and in rose text ink.
- A character with no spell access has four tabs; Spells is absent, not
  disabled.

### Editing basic details

A pushed screen that commits from its footer, like Add: the name, the token
colour as three token swatches, and alignment as a three by three grid with a
None option. Class, race and background stay with creation and level-up.

### Deleting a character

A pushed confirmation that names the character and says everything on the sheet
goes, including any level-up draft. The footer's destructive button repeats the
name. Nothing needs typing.

## Hit areas

Decided 12 September 2026 and added to the design system under accessibility.

- Every control answers taps across at least 44 by 44.
- On web the extension is an invisible `::after` centred on the control, so
  layout and appearance do not change. Native uses hit slop with the same
  numbers.
- Where two controls sit closer than 44, their areas meet at the midpoint of the
  gap instead of overlapping. 24 is the floor in that direction, which is the
  WCAG 2.2 AA minimum.
- Resource pips are the tightest case. They sit 4px apart, so each is 44 tall
  and 24 or 26 wide. Wide pips grew from 17 to 20 to reach 24, and resource rows
  grew to 44 so stacked rows meet instead of overlapping.
- The tap rule makes the narrow width safe. A filled pip spends the last filled
  one and an empty pip restores the first empty one, so landing on a neighbour
  in the same state does the same thing. Only the boundary between filled and
  empty can be missed.
- Text fields get a real 44 minimum height, because an overlay would cover the
  caret.
- The hit point block in the header counts as a control. It opens the pad, so it
  gets a button role and appears in the hit area paint.
- Show hit areas in the mockup's ink bar paints every area.

## New components, candidates for design system v0.4

Sheet header in two sizes, tab bar in two positions, stat tile, resource pip
row, block card, attack table, action row that pushes, casting statistics card,
full-screen detail bar, access path card, hit point pad, warning strip as a margin note, vitals cutout,
the temporary hit point block, the hit area extension, the override
badge, the preparation toggle row, the over-limit counter, proficiency rank
marks, ability tiles, two-column skill rows, the value detail with its
calculation, a sticky footer for a pushed screen's primary action, the tab
icon set, the slot grid, a save DC in the attack table, the two-way switch,
before and after rows, coin tiles, nested container rows, the labelled value
list, the per-section edit button with its editing state, the rules text block,
the single-choice row, the destructive button, the big rectangular value, , the
proficiency rank selector, the money pad, drag handles and staged removal in
list editing, the add search with its custom row, the removal choice screens,
the known forms row, the access path summary card, three and six option
selectors, the small destructive button, disabled rows marked Known, the static
bottom sheet menu, the token colour picker, the dashed Condition control on
the plate, the condition grid with its end selector, the scrim token, the
concentration card, the concentration save, and the death save tab with its
outcome buttons, the hit point pad as a bottom sheet, and the compact status
slot, and the roll sheet with its dice boxes and face buttons. They are written in the mockup with the
structural and skin rules split, as v0.3 requires, so they can move across
without being rewritten.
