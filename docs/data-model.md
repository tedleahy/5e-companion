# Data model

This model covers the current MVP catalog needs: import SRD content, browse and
search it, let users create homebrew content, and supply rules to the guided
flows in [character-flows.md](character-flows.md). The flows interpret rules
stored as JSONB without requiring a generic relational rules model.

## Conventions

Every table uses a `bigint` identity primary key unless a composite primary key
is specified. A column is `NOT NULL` unless it is marked nullable. A default
does not permit an explicit null.

Every independently addressable catalog table has:

- `content_source_id`: references ContentSources
- `external_key`: text
- `name`: text
- `data`: JSONB, containing structured fields that do not need relational
  queries or constraints
- `retired_at`: timestamptz, nullable; null means the row is active.
  Ordinary browse, search, and new selection omit retired rows. Existing
  references still resolve to them.

Catalog owner and parent foreign keys use `ON DELETE RESTRICT`. That includes
`Features.class_id`, `Features.subclass_id`, `Features.parent_feature_id`,
`Subclasses.class_id`, `Traits.parent_trait_id`, and `Subraces.race_id`.
Delete or reassign those dependents before deleting the target. Membership
join tables keep `ON DELETE CASCADE`. Character-owned catalog references keep
`ON DELETE SET NULL`.

Character-owned tables use `state` instead of `data` for their JSONB, because
that column holds the player's own selections and in-play state rather than a
fragment of imported source material. `data` is always catalog rules; `state`
is always character-specific.

`data` does not normally repeat promoted columns, stored relationships,
external keys, or API URLs. It keeps the useful shape of the source fragment
without storing the whole imported object unchanged. A lossy relational index
may coexist with the complete rule entries when they serve different queries;
SubclassSpells and the conditional spell grants in Subclasses.data are the one
current exception.

Use a normal unique constraint for catalog identity:

```sql
UNIQUE (content_source_id, external_key)
```

Imported rows use the source `index`, such as `acid-arrow`. User-created rows
receive a generated UUID encoded as text; names never identify content. The
importer can use the constraint directly with `ON CONFLICT` to update an
existing row. Equipment is the exception: it combines two upstream collections
and prefixes imported keys with `equipment/` or `magic-items/` to preserve their
namespaces. All references to Equipment use the same mapping.

A catalog reference stored in JSONB has this shape:

```json
{
  "content_type": "spell",
  "source_key": "8ab5a579-6a4f-4d09-a720-5006ae0e78c1",
  "external_key": "7123ff57-63de-4220-8517-19c99d7f339f",
  "name": "Frostbite"
}
```

`source_key`, `content_type`, and `external_key` form the identity. `name` is an
optional saved display label and never participates in lookup. Resolve only the
exact tuple; never match by name or fall back to the owning, local, or official
source. Importers and homebrew editors resolve shorthand while writing the
record, not each time the rule is read. An importer that supports dependencies
must receive an explicit mapping from each upstream collection to a
ContentSource.

A user may save a reference only when they can read the target source: official
or imported third-party content, a public source, their own source, or a
source explicitly shared with them. The reference does not grant access. If
access is later revoked or the target is deleted, keep the reference and its
saved label, report it as unresolved, and offer the existing manual path. Do
not redirect it to same-named content. See Users and ContentSources.

Use `text` plus check constraints for closed sets of values rather than
Postgres enum types. A listed vocabulary without a check constraint is open:
the named values are what the MVP interprets, and other text is allowed.
Index every foreign key unless an existing composite index already starts with
that column. Do not derive or store catalog API URLs. Import discards them
after resolving content type and external key.

Do not add GIN indexes to JSONB columns until a real query needs one. Promote a
JSONB field to a column when the application needs to filter, sort, join, or
constrain it.

Identifiers use US spelling, matching the source data: `armor_class`, the
`armor` proficiency category, and so on. This keeps column names, JSON keys,
and imported values consistent and avoids a translation layer in the importer.
UI copy uses US spelling too, so labels match the catalog; only internal documents use British spelling.

A nullable column named `*_override` means "null derives normally". Never store
a second copy of a value the API can derive; store only the player's
replacement for it.

## JSONB contracts

The database enforces only coarse JSON shape and nullability. Each JSONB
column is `NOT NULL` with a `jsonb_typeof` check: objects for `data`, `state`,
`profile`, `overrides`, and `CharacterActions.origin`; arrays for `origins`.
Defaults are `{}` and `[]`. Do not add per-key JSON Schema checks in Postgres.

Rails validates every payload it writes or interprets. Importers, homebrew
editors, advancement, and sheet updates share those application schemas. This
file documents the contracts; it is not loaded at runtime.

Ability identifiers in JSON are `str`, `dex`, `con`, `int`, `wis`, or `cha`.
Catalog references use the shape above. A missing key is absent, not JSON
`null`. Do not store `null` as a synonym for absent. For character overrides,
absent means "derive normally". For draft answers, absent means unanswered.
Deleted or unreadable catalog targets inside JSON keep the saved reference and
label, report unresolved, and use the manual path; see the reference rules
above.

Character-owned supported payloads reject unknown keys. Catalog `data` may
retain unused source keys the importer already keeps; the interpreter ignores
keys it does not consume.

### Character profile

An object of optional display strings: `age`, `height`, `appearance`,
`personality_traits`, `ideals`, `bonds`, `flaws`, `allies`, and `enemies`.
The sheet shows them together and does not query them independently.

### Character overrides

```json
{
  "armor_class": 18,
  "speed": { "walk": 35 }
}
```

Each present key is a player replacement. `armor_class` is an integer.
`speed` is an object of movement-mode integers; the MVP writes `walk` only.
Omit a key to derive that value. Per-class spellcasting overrides stay on
CharacterClasses columns. Per-path spell overrides stay on CharacterSpells
columns.

### Origins

`origins` is an array of objects. `grant_key` is a string, unique within one
character. `kind` is a string such as `class`, `subclass`, `race`, `subrace`,
`background`, `feature`, `item`, or `manual`. `source` is a catalog reference
and is required except on `manual` origins. `level` is an optional positive
integer. `contribution` is an optional object whose shape depends on the
table:

- CharacterProficiencies: `{ "rank": "half" }`, `proficient`, or `expertise`
- CharacterSpells: `{ "roles": ["known"] }` using the same role vocabulary as
  the column
- CharacterItems: `{ "quantity": 1 }` with a positive integer
- CharacterResources: `{ "rule_key": "hit_dice" }` when the handler needs a
  stable rule name
- CharacterLanguages and CharacterFeatures: omit `contribution` unless a later
  rule needs one

### Character-owned state

`state` is always an object. Rows with no extra values store `{}`.

CharacterFeatures may store known form choices:

```json
{
  "known_forms": [
    {
      "content_type": "monster",
      "source_key": "5e851408-20be-46b1-b4e2-99f5a82ce8c6",
      "external_key": "brown-bear",
      "name": "Brown Bear"
    }
  ]
}
```

CharacterSpells `state` is `{}` in the MVP. Spell details live on columns.

CharacterResources may store `{ "hit_die": 10 }` or `{ "slot_level": 1 }`.
`hit_die` is a positive integer. `slot_level` is an integer from 0 to 9.

CharacterItems may store `{ "current_charges": 3 }` when the player tracks
charges. Do not invent charges from an item name.

`CharacterActions.origin` is an object with no required keys and is not an
identity. `state` may include `attack_bonus` (integer), `damage` (text),
`damage_type` (text), `range` (text), `save_dc` (integer), and `display_text`
(text).

CharacterEffects `state` is `{}` for ordinary conditions. Exhaustion uses
`{ "level": 1 }` with an integer from 1 to 6. An active Wild Shape uses:

```json
{
  "form_monster": {
    "content_type": "monster",
    "source_key": "5e851408-20be-46b1-b4e2-99f5a82ce8c6",
    "external_key": "brown-bear",
    "name": "Brown Bear"
  },
  "current_form_hit_points": 21,
  "maximum_form_hit_points": 34,
  "overrides": {
    "armor_class": 12,
    "speed": { "walk": 40 }
  }
}
```

`form_monster` is a catalog reference. Form override keys follow Character
overrides. Absent form overrides derive from the current monster record.

### Catalog data and drafts

Each catalog table's `data` object is validated by the importer and by the
code that reads those fields. The kept keys are listed on that table. Homebrew
edits use the same consumed-field checks.

`AdvancementDrafts.state` is an object of wizard answers. Rails validates it
on write. There is no schema version; see AdvancementDrafts.

## Users

- `email`: text, unique
- `password_digest`: text
- `created_at`, `updated_at`: timestamptz

Sign up and log in with email and password. The API authenticates a session
for the web app and React Native. OAuth, magic links, and email confirmation
are deferred. Password reset is an application flow and does not add game
tables.

Creating a user also creates one private homebrew ContentSource owned by that
user. That source is enough for MVP create, edit, and delete of custom
content. Extra named sources are deferred.

`Characters.user_id` and `AdvancementDrafts.user_id` use `ON DELETE CASCADE`.
Deleting a user therefore deletes their characters, drafts, owned homebrew
sources, and the catalog rows in those sources. Official and imported
third-party sources have no owner and are not deleted. Other people's
characters that referenced the removed homebrew keep saved names and JSONB
labels; those catalog foreign keys become null and the references report
unresolved.

## Sessions

- `user_id`: references Users, `ON DELETE CASCADE`
- `token`: text, unique
- `created_at`: timestamptz
- `expires_at`: timestamptz, nullable

Every character, draft, and homebrew write requires a current user from a
valid session.

## Characters

Character creation and level-up provide rules guidance with a manual escape
hatch. The catalog preserves source choices and prerequisites in JSONB for the
flows to interpret. Characters store the player's actual selections, while the
API reads current catalog rules when deriving their mechanics. A later catalog
import can therefore change derived values, descriptions, and generated
actions, but it never replaces a player's selected catalog ids, saved names,
manual values, or in-play state.

- `user_id`: references Users, `ON DELETE CASCADE`
- `name`: text
- `token_ink`: text, a six-digit CSS hex colour such as `#e0689c`
- `rules_version`: text
- `lock_version`: non-negative integer, default 0
- `race_id`: references Races, nullable
- `race_name`: text, nullable
- `subrace_id`: references Subraces, nullable
- `subrace_name`: text, nullable
- `background_id`: references Backgrounds, nullable
- `background_name`: text, nullable
- `experience_points`: integer, nullable
- `alignment`: text, nullable
- `strength`: integer, nullable
- `dexterity`: integer, nullable
- `constitution`: integer, nullable
- `intelligence`: integer, nullable
- `wisdom`: integer, nullable
- `charisma`: integer, nullable
- `maximum_hit_points`: integer, nullable
- `current_hit_points`: integer, nullable
- `temporary_hit_points`: integer, default 0
- `death_save_successes`: integer, default 0
- `death_save_failures`: integer, default 0
- `inspiration`: boolean, default false
- `copper_pieces`: integer, default 0
- `silver_pieces`: integer, default 0
- `electrum_pieces`: integer, default 0
- `gold_pieces`: integer, default 0
- `platinum_pieces`: integer, default 0
- `profile`: JSONB, default `{}`
- `overrides`: JSONB, default `{}`
- `notes`: text, nullable

`token_ink` is the colour of the character's token in lists and on the sheet.
Store it as a six-digit CSS hex value including the leading `#`, and enforce
that format with a check constraint. The player picks it when creating the
character.

`race_name`, `subrace_name`, and `background_name` contain the player's chosen
display values. The corresponding catalog references are optional, which
allows inline manual entries. Use `ON DELETE SET NULL` for those references so
deleting homebrew catalog content does not erase a character's saved choice.

`profile` contains narrative fields that are displayed together but do not
need independent queries, such as age, height, appearance, personality traits,
ideals, bonds, flaws, allies, and enemies.

The API derives ability modifiers, total level, proficiency bonus, armor
class, initiative, speed, passive scores, skill and saving-throw bonuses, and
spellcasting statistics. `overrides` contains only player-supplied replacements
for character-wide derived values. Missing keys mean "derive normally"; see
JSONB contracts. Per-class spellcasting overrides live on CharacterClasses
instead, because a save DC or attack bonus belongs to one class rather than to
the character. CharacterSpells can override one access path when a racial,
feat, item, or manual grant has its own casting rules.

A Character row always represents a character the player has confirmed.
Unfinished creation and level-up flows live in AdvancementDrafts.

Every transaction that changes a Character or one of its owned rows increments
`lock_version`. AdvancementDrafts use it to detect character changes made after
a level-up flow started. This includes in-play changes such as spending a
resource, not only edits to the Characters row.

`death_save_successes` and `death_save_failures` each hold 0 to 3, checked in
the database. The range is structural rather than a rules check: three
successes is how the model stores stable and three failures is how it stores
dead, so a fourth has no meaning. Both counts only matter at 0 hit points. The
app writes them from a death save made in the app or rolled at the table: 10 or
higher adds a success, 9 or lower adds a failure, a natural 1 adds two
failures, and a natural 20 sets `current_hit_points` to 1 and clears both.
Damage at 0 hit points adds a failure, or two for a critical hit, and damage of
at least `maximum_hit_points` sets failures to 3. Stabilising by another
creature, such as spare the dying or a Medicine check, sets successes to 3. Any
change that takes `current_hit_points` above 0 clears both counts.

When `current_hit_points` reaches 0, the app adds an Unconscious CharacterEffects
row with `source_kind` of `character`, the character as its own
`source_character_id`, and `expiry_triggers` containing `hit_points_regained`,
so it ends when the character is healed. Unconscious from another source, such
as a sleep spell, does not list that trigger and stays until it ends by its own
rules.

Do not enforce D&D legality or sheet completeness with database constraints.
Missing ability scores, total level above 20, invalid choice counts, or current
resources exceeding their maximum produce overridable warnings. The database
still enforces structural rules such as foreign keys, non-null names, and
object-versus-array JSONB checks. Rails validates the detailed JSON payloads.

## CharacterClasses

- `character_id`: references Characters
- `class_id`: references Classes, nullable
- `name`: text
- `subclass_id`: references Subclasses, nullable
- `subclass_name`: text, nullable
- `level`: positive integer
- `position`: non-negative integer
- `spellcasting_ability_override`: text, nullable, with a check constraint
  allowing `str`, `dex`, `con`, `int`, `wis`, or `cha`
- `spell_save_dc_override`: integer, nullable
- `spell_attack_bonus_override`: integer, nullable

The combination of `character_id` and `position` must be unique. When a class
is added, set `position` to one greater than the current maximum for that
character, or zero if there are no rows. Do not reorder CharacterClasses in
the MVP. The first class is the lowest remaining `position`. A normal
single-class character has one row; multiple rows permit manual multiclass
characters without adding guided multiclass rules yet. Total character level
is the sum of these rows.

The names are the player's saved display values, while the optional catalog
references supply rules and descriptions. Use `ON DELETE SET NULL` for catalog
references.

Spellcasting ability, save DC, and spell attack bonus derive from the class and
the character's ability scores; the override columns replace those results for
house rules. Keeping them here rather than in a slug-keyed blob on Characters
means a multiclass character's two spellcasting statistics stay distinct
without the application parsing class names out of JSON.

CharacterClasses is also the anchor for anything else that belongs to one
class: CharacterSpells and CharacterResources both reference it.

## CharacterProficiencies

- `character_id`: references Characters
- `proficiency_id`: references Proficiencies, nullable
- `name`: text
- `category`: text with a check constraint allowing `skill`, `saving_throw`,
  `weapon`, `armor`, `tool`, or `other`
  - examples include `skill`, `saving_throw`, `weapon`, `armor`, `tool`, and
    `other`
- `ability`: text, nullable, with a check constraint allowing `str`, `dex`,
  `con`, `int`, `wis`, or `cha`
- `rank`: text with a check constraint allowing `half`, `proficient`, or
  `expertise`
- `rank_override`: text, nullable, with the same three-value check
- `bonus_override`: integer, nullable
- `origins`: JSONB array, default `[]`

Only proficiencies the character possesses need rows. The API derives ordinary
skill and saving-throw bonuses from abilities, rank, and proficiency bonus.
`rank_override` replaces the rank produced by advancement origins;
`bonus_override` replaces the final bonus for house rules. A wholly manual row
stores its chosen rank directly and normally leaves `rank_override` null.

For catalog-backed rows, the combination of `character_id` and
`proficiency_id` must be unique. Postgres still permits multiple manual rows
because their `proficiency_id` is null.

`category` uses the same vocabulary as the catalog Proficiencies table. The
importer maps the source `type` values (`Skills`, `Armor`, `Artisan's Tools`,
and so on) onto it once. For a catalog-backed row, the API uses the current
Proficiency category, ability, and equipment target. The character columns are
the saved result and fallback if the catalog reference becomes unavailable.
Advancement refreshes them during reconciliation unless the row has a manual
origin. A wholly manual row uses its character columns directly.

Languages are not proficiencies in the source data and do not appear here; see
CharacterLanguages. `rank` applies to every row. `ability` and `bonus_override`
are meaningful for proficiencies used in checks and are normally null for
weapon and armor coverage.

## CharacterLanguages

- `character_id`: references Characters
- `language_id`: references Languages, nullable
- `name`: text
- `origins`: JSONB array, default `[]`

For catalog-backed rows, the combination of `character_id` and `language_id`
must be unique. Manual languages leave `language_id` null.

A language has no rank, no governing ability, and no bonus, so it does not fit
the proficiency columns. Splitting it out keeps both tables meaningful and lets
languages be browsed as catalog content like any other source material.

## CharacterFeatures

- `character_id`: references Characters
- `feature_id`: references Features, nullable
- `trait_id`: references Traits, nullable
- `name`: text
- `description`: text, nullable
- `origins`: JSONB array, default `[]`
- `state`: JSONB, default `{}`
- `position`: non-negative integer, default 0

```sql
CHECK (num_nonnulls(feature_id, trait_id) <= 1)
```

This table holds class features, subclass features, racial traits, background
features, feats, and manual additions. `state` contains character-specific
selections or in-play state, not a copy of catalog rules. For example, the
Wild Shape feature can keep a list of known beast-form references here.

Class features and racial traits are separate catalog tables because they
attach differently, so a row carries at most one of the two references, and
neither for a manual entry or an embedded background feature. Background
features save their name and description here with a background origin; see
Backgrounds. Every other column is meaningful for all of them, which is why they
share one character-owned table rather than being split the way languages were.

The name follows the broader of the two rulebook terms. The character sheet
presents this list as "Features & Traits" and the API should use that label;
the table keeps the shorter name because `character_features_and_traits` buys
nothing at the storage layer.

`position` is the player's order for the character's features and traits. The
sheet sorts by it inside each origin group. It is not unique; ties sort by `id`.
A new row takes one more than the character's current maximum, so features
granted during creation and level-up keep the order advancement produced them
in. Reordering rewrites the positions of that character's features in one
transaction.

## CharacterSpells

- `character_id`: references Characters
- `access_key`: text
- `character_class_id`: references CharacterClasses, nullable
- `spell_id`: references Spells, nullable
- `name`: text
- `level`: integer, nullable for manual entries
- `roles`: text array, default `{}`
  - understood values initially include `known`, `spellbook`,
    `always_prepared`, `mastery`, `signature`, and `mystic_arcanum`; other
    values are allowed
- `prepared`: boolean, default false
- `spellcasting_ability`: text, nullable, with a check constraint allowing
  `str`, `dex`, `con`, `int`, `wis`, or `cha`
- `spell_save_dc`: integer, nullable
- `spell_attack_bonus`: integer, nullable
- `spellcasting_ability_override`: text, nullable, with the same six-value check
- `spell_save_dc_override`: integer, nullable
- `spell_attack_bonus_override`: integer, nullable
- `origins`: JSONB array, default `[]`
- `state`: JSONB, default `{}`
- `notes`: text, nullable

`roles` records how the character has access to the spell, which changes at
level-up. The listed values are the ones the MVP interprets; other strings
are stored. Rails treats the array as a set and rejects duplicates and null
elements. `prepared` records today's preparation, which changes during a
session. They are separate columns so those two facts stay distinct and
preparation can be queried without reading `roles`.

`always_prepared` stays in `roles` because it describes permanent access from a
subclass or feature. The API treats such a spell as prepared without the player
setting `prepared`.

Each row is one access path, not one deduplicated spell. `access_key` is the
origin's deterministic grant key for an advancement-managed path and a generated
UUID for a manual path:

```sql
UNIQUE (character_id, access_key)

CHECK (num_nonnulls(character_class_id, spellcasting_ability) <= 1)
```

The same catalog spell may therefore have separate class, subclass, race, feat,
item, and manual rows. Their roles, preparation, and casting statistics can
differ. The API may group them under one spell heading for display but must keep
the access paths separately editable. Removing one origin removes only its
access path.

`character_class_id` records the class whose casting statistics apply. For that
path, the API derives from CharacterClasses unless this spell row has a more
specific override. Non-class paths leave it null. Their rule-provided
`spellcasting_ability` is one of `str`, `dex`, `con`, `int`, `wis`, or `cha`;
the save DC and attack bonus derive from it and the character's proficiency
bonus. `spell_save_dc` and `spell_attack_bonus` hold fixed values supplied by
the access rule. The corresponding `_override` columns are player replacements.
Use a player override first, then a rule-provided fixed value, then a value
derived from the effective ability or class. If none is available, display the
spell without invented casting statistics and ask for manual values.

Advancement updates `spellcasting_ability`, the two rule-provided fixed values,
and roles during reconciliation. It preserves `prepared`, overrides, `state`,
and `notes`.
A manually added path to a catalog spell retains `spell_id`, uses a generated
access key and manual origin, and participates in display grouping. A wholly
custom spell leaves `spell_id` null. Both keep their details in the same
columns.

## CharacterResources

- `character_id`: references Characters
- `character_class_id`: references CharacterClasses, nullable
- `key`: text
- `name`: text
- `current`: integer
- `maximum_override`: integer, nullable
- `reset_on`: text with a check constraint allowing `short_rest`, `long_rest`,
  `dawn`, or `manual`
- `origins`: JSONB array, default `[]`
- `state`: JSONB, default `{}`

```sql
UNIQUE NULLS NOT DISTINCT (character_id, character_class_id, key)
```

`NULLS NOT DISTINCT` (Postgres 15 and later) makes character-wide keys unique
even though `character_class_id` is null for them.

`character_class_id` is set for resources belonging to one class, such as hit
dice, Pact Magic, or Rage, and is null for character-wide resources such as
shared spell slots. The app supplies stable keys like `spell_slot_1`,
`hit_dice`, `wild_shape`, `pact_magic`, or `ki`; manual resources receive a
generated key. The class is a foreign key rather than a prefix on the key, so
a multiclass character's two pools of hit dice are distinguishable without
parsing strings.

Most maximums derive from the character: hit dice from the class level, spell
slots from the class progression, Rage and Wild Shape uses from the feature.
`maximum_override` replaces that result and is null when the normal derivation
applies. A wholly manual resource has no derived maximum, so
`maximum_override` is required and is its maximum. The effective maximum is
`maximum_override` when set, otherwise the derived maximum. `current` is
remaining uses.

`reset_on` names which rest or dawn action may recover the resource. It does
not encode how much is recovered. Recovery math lives in application handlers
for known keys, such as filling spell slots to the effective maximum and
restoring half of hit dice, rounded up. Arcane Recovery is a player choice
that converts slots, not an automatic refill of this table.

A handler runs only for resources whose `reset_on` matches that action. A long
rest does not recover `short_rest` resources. `manual` means those handlers
skip the row; the player sets `current` directly.

Recovery must not set `current` above the effective maximum. A full refill sets
`current` to that maximum. A partial refill adds uses and stops at the
maximum. Direct edits can still leave `current` above the maximum, as an
overridable warning, but rest and dawn recovery never do.

`state` contains small resource-specific values such as a spell-slot level or
hit-die size. Normal spell slots, Pact Magic, Mystic Arcanum uses, hit dice,
Rage, Ki, Wild Shape uses, and Arcane Recovery all use this table.

## CharacterItems

- `character_id`: references Characters
- `equipment_id`: references Equipment, nullable
- `name`: text
- `quantity`: positive integer, default 1
- `equipped`: boolean, default false
- `equipped_slot`: text, nullable
- `attuned`: boolean, default false
- `container_item_id`: references CharacterItems, nullable
- `origins`: JSONB array, default `[]`
- `state`: JSONB, default `{}`
- `notes`: text, nullable
- `position`: non-negative integer, default 0

The nullable self-reference represents backpacks and other containers. The app
prevents container cycles. Manual items leave `equipment_id` null.

`position` is the player's order for the character's items. The sheet sorts by
it inside whichever group shows an item: equipped, attuned, carried, or one
container's contents. It is not unique; ties sort by `id`. A new row, manual or
granted, takes one more than the character's current maximum. A row split from a
stack takes the original row's position, so the copies stay together. Reordering
rewrites the positions of that character's items in one transaction.

Stack only copies that are interchangeable: the same catalog or manual
identity, and the same equipped flag, slot, attunement, container, `state`,
and notes. Advancement still keeps one row per grant path. If a change would
make only some copies differ, split first: reduce the stack's quantity and
insert a row for the copies that diverge.

Deleting a container does not cascade to its contents. The foreign key must
reject that delete while children still point at it. The application asks
whether to move the direct children into another container, move them to
pockets by clearing `container_item_id`, or discard those children with the
container. Nested contents stay inside a moved child. Discarding deletes the
container and everything nested in it.

Equipment is a single catalog table covering both mundane equipment and magic
items, with a nullable `rarity`, so CharacterItems needs only one reference.

## CharacterActions

- `character_id`: references Characters
- `name`: text
- `action_type`: text
  - understood values initially include `action`, `bonus_action`, `reaction`,
    `attack`, and `other`; other values are allowed
- `origin`: JSONB, default `{}`
- `state`: JSONB, default `{}`

Spells, equipment, and features provide most actions at read time. Store only
wholly manual actions here. Do not store replacements or customizations of
those generated actions. `origin` is descriptive metadata for a player-added
row, not a link that hides or replaces a generated action. Supported `state`
keys are listed under JSONB contracts.

## CharacterEffects

- `character_id`: references Characters
- `condition_id`: references Conditions, nullable
- `effect_key`: text
- `name`: text
- `source_kind`: text with a check constraint allowing `character_feature`,
  `character_spell`, `character_item`, `character`, `external`, or `manual`
- `source_character_id`: references Characters, nullable
- `source_character_feature_id`: references CharacterFeatures, nullable
- `source_character_spell_id`: references CharacterSpells, nullable
- `source_character_item_id`: references CharacterItems, nullable
- `source_monster_id`: references Monsters, nullable
- `source_actor_key`: text, nullable
- `source_name`: text, nullable
- `source_instance_key`: text, nullable
- `expiry_triggers`: text array, default `{}`
- `remaining_rounds`: positive integer, nullable
- `rounds_tick_on`: text, nullable
- `is_concentration`: boolean, default false
- `state`: JSONB, default `{}`
- `notes`: text, nullable

```sql
UNIQUE (character_id, effect_key)

CHECK (NOT is_concentration OR (
  condition_id IS NULL
  AND source_instance_key IS NOT NULL
  AND source_kind IN ('character_spell', 'character_item', 'manual')
  AND (source_character_id IS NULL OR source_character_id = character_id)
  AND NOT ('concentration_end' = ANY (expiry_triggers))
))

CHECK (num_nonnulls(
  source_character_feature_id,
  source_character_spell_id,
  source_character_item_id,
  source_monster_id
) <= 1)

CHECK (num_nonnulls(source_character_id, source_monster_id) <= 1)

CHECK (
  (source_character_feature_id IS NULL
    OR (source_kind = 'character_feature'
      AND source_character_id IS NOT NULL))
  AND
  (source_character_spell_id IS NULL
    OR (source_kind = 'character_spell'
      AND source_character_id IS NOT NULL))
  AND
  (source_character_item_id IS NULL
    OR (source_kind = 'character_item'
      AND source_character_id IS NOT NULL))
  AND
  (source_character_id IS NULL OR source_kind IN (
    'character_feature',
    'character_spell',
    'character_item',
    'character'
  ))
  AND
  (source_monster_id IS NULL OR source_kind = 'external')
)

CHECK (expiry_triggers <@ ARRAY[
  'short_rest',
  'long_rest',
  'concentration_end',
  'source_end',
  'hit_points_regained'
]::text[])

CHECK (
  NOT (expiry_triggers && ARRAY[
    'concentration_end',
    'source_end'
  ]::text[])
  OR source_instance_key IS NOT NULL
)

CHECK (
  (remaining_rounds IS NULL AND rounds_tick_on IS NULL)
  OR
  (remaining_rounds IS NOT NULL AND rounds_tick_on IN (
    'start_of_source_turn',
    'end_of_source_turn',
    'start_of_target_turn',
    'end_of_target_turn'
  ))
)

CHECK (
  rounds_tick_on NOT IN (
    'start_of_source_turn',
    'end_of_source_turn'
  )
  OR source_actor_key IS NOT NULL
)
```

`effect_key` is a generated UUID encoded as text. Each row is one application
of an effect, so two sources can both poison a character. The sheet groups
active rows by `condition_id` for an effective condition badge; removing one
instance does not remove the badge while another remains. Manual and non-
condition effects can be grouped for display by normalized name, but names do
not establish database identity.

`source_kind` describes the source. `source_character_id` identifies the actor
when it is a saved character, which may differ from the affected character.
The optional feature, spell, or item link must belong to that source character;
use a composite foreign key from `(source_character_id, source_*_id)` to the
source table's `(character_id, id)`. A plain `character` source has no narrower
link. `external` records an actor outside the current character model, such as a
monster or environment. It can retain a catalog `source_monster_id`, but that
identifies the stat block rather than a particular creature. `manual` means the
player added the effect directly.

`source_actor_key` is a durable, opaque identity for the specific game actor.
It may accompany `source_character_id`; for a saved character the app generates
and retains a key such as `character:<id>`. Reuse it for effects from the same
specific external actor too. Every source-turn boundary requires this key, so
deleting a source character cannot make its stored boundary invalid.
`source_character_id` supplies current relational details when available;
`source_actor_key` supplies event correlation and survives that relationship.
`source_name` is only a display fallback and never establishes identity.

`source_instance_key` is a generated activation key shared by effects produced
by one cast or feature activation. It is required when `expiry_triggers`
contains `concentration_end` or `source_end`, allowing the app to end all local
effects from that activation together. Source foreign keys include
`source_character_id` as described below. If a linked source row is deleted
without an explicit source-end action, set only the narrower source id to null
and retain its character or actor key, kind, name, and instance key; deleting
access to a spell does not retroactively end a non-concentration duration.

`expiry_triggers` is a set. The application rejects duplicates and deletes the
effect when any listed game event occurs. A long rest does not satisfy
`short_rest`; only an explicit short rest matches that trigger.
`hit_points_regained` matches any change that takes the character's current hit
points above 0. An empty array
means no known automatic game event; the player ends the effect manually. The
model stores no wall-clock expiry because game time can pause between sessions.

`remaining_rounds` and `rounds_tick_on` describe a turn-relative duration.
Until combat tracking exists, the player decrements the counter manually and
the app deletes the row at zero. The boundary is still stored so later combat
tracking will not have to reinterpret old rows. A duration may also have
expiry triggers, as concentration can end before its round limit.

Add partial B-tree indexes on non-null `source_actor_key` and
`source_instance_key`. Turn, concentration, and source-end events use them to
find affected rows across characters.

A row exists only while its condition, form, stance, or other temporary effect
is active. Delete the row when the effect ends; do not keep effect history yet.
Standard conditions and a normal Rage may need no state. Wild Shape, Exhaustion,
and other supported effect payloads are defined under JSONB contracts.

The Wild Shape feature holds permanent rules and known forms;
CharacterResources tracks remaining uses. Rage rules remain on its feature and
CharacterResources tracks remaining Rages. Effect state only records temporary
values such as form hit points or house-rule overrides. An Exhaustion effect
stores its current level in `state.level`; the catalog still has one Exhaustion
condition rather than six.

### Concentration

A character's own concentration is an anchor row: a CharacterEffects row on the
caster with `is_concentration` set. The other rows only say they end when
concentration ends; the anchor records that the caster is concentrating, and
on which activation. It exists even when the spell affects nothing the app
tracks, such as Hex on a monster. Add a partial unique index on
`character_id` where `is_concentration` is true, so a character concentrates
on one thing at a time. This is the one game rule the database enforces rather
than warns about: concentration is not a build choice, and casting another
concentration spell replaces the current one.

When a character casts a spell whose catalog row has `requires_concentration`,
the app writes the anchor in the same transaction as the cast. The anchor
links the access path or item that was used, carries the activation's
generated `source_instance_key`, and takes its `name` from the spell. A target
the app does not track goes in `notes`. Effects the cast places on other
characters, such as Bless on the party, are ordinary rows that share the
instance key and list `concentration_end`. The anchor never lists
`concentration_end` itself.

The anchor's duration uses the existing columns:

- one minute or less: `remaining_rounds` with `rounds_tick_on` of
  `end_of_source_turn`, and `source_actor_key` set to the caster's own key
- up to one hour: `expiry_triggers` of `short_rest` and `long_rest`
- up to eight hours: `expiry_triggers` of `long_rest`
- longer: no trigger; the player ends it

Ending concentration is one transaction. It deletes the anchor and every
CharacterEffects row, on any character, that shares its `source_instance_key`
and lists `concentration_end`. The application ends concentration when the
player ends it, when a concentration saving throw is recorded as lost, when the
character casts another concentration spell, when the character gains the
Incapacitated, Paralyzed, Petrified, Stunned, or Unconscious condition, when
hit points reach 0, and when the anchor's own duration or trigger ends it. An
active Wild Shape does not end it. These are application events, not database
triggers. A rest or round counter that deletes the anchor runs the same
transaction, so dependent rows never outlive it.

## CharacterGrantSuppressions

- `character_id`: references Characters
- `grant_key`: text
- `reason`: text, nullable
- `created_at`: timestamptz
- primary key: `(character_id, grant_key)`

When a player rejects or removes a result that advancement would otherwise
generate, keep its deterministic grant key here. A suppression removes any
existing non-manual origin with that key and prevents its current expected
result from being materialized. It remains in effect until the player restores
the grant by deleting the suppression. A suppression identifies one rule path
or choice slot, not a catalog target. Changing the selected target for that slot
therefore remains suppressed unless revisiting the answer explicitly clears the
suppression.

Suppressions are character-owned state and use `ON DELETE CASCADE`. They retain
no generic foreign key because a grant key can originate from any supported
catalog rule shape. The application only writes keys produced by the same
advancement interpreter and shows the saved reason during review.

## Character-owned row conventions

All CharacterClasses, CharacterProficiencies, CharacterLanguages,
CharacterFeatures, CharacterSpells, CharacterResources, CharacterItems,
CharacterActions, CharacterEffects, and CharacterGrantSuppressions rows use
`ON DELETE CASCADE` for their `character_id`. Index all their foreign keys.

References between character-owned rows must include `character_id`, so the
database rejects a reference to a row owned by another character. Add unique
constraints on `(character_id, id)` for CharacterClasses, CharacterFeatures,
CharacterSpells, and CharacterItems.
CharacterSpells and CharacterResources use
`(character_id, character_class_id)` as a composite foreign key to
`CharacterClasses(character_id, id)`, with `ON DELETE CASCADE`. Dropping a
class therefore removes only the spells and resources that its own row granted.
CharacterItems uses `(character_id, container_item_id)` as a composite foreign
key to `CharacterItems(character_id, id)`. That container reference uses
`ON DELETE RESTRICT`, so a backpack cannot disappear while items still name
it. A null class or container reference remains valid.

CharacterEffects uses a source-owner composite pattern for its feature, spell,
and item links. Each `(source_character_id, source_*_id)` pair references the
source table's `(character_id, id)`, so a source detail cannot belong to a
different actor. Those foreign keys use `ON DELETE SET NULL` for only the
narrower source id, not the affected or source character id. An active duration
can therefore retain its actor and source label after the detail row is removed.
The application handles an explicit `source_end` before deleting its source;
the foreign-key action is only a safe fallback. `source_character_id` and the
catalog monster reference also use `ON DELETE SET NULL`, retaining
`source_actor_key` and `source_name` when available.

Optional catalog references use `ON DELETE SET NULL`. Each such row retains a
non-null `name`, so deleting homebrew catalog content does not remove or blank
the character's saved entry.

CharacterProficiencies, CharacterLanguages, CharacterFeatures,
CharacterSpells, CharacterResources, and CharacterItems are advancement-
reconciled rows. Their `origins` arrays record every active grant contribution.
The object shape is defined under JSONB contracts.

`grant_key` is stable and unique within one character. Build it from the owning
selection or CharacterClass, the normalized rule path, level when applicable,
and choice-slot position. Do not include a mutable display name. A choice slot
keeps the same key when its selected target changes, allowing reconciliation to
move that contribution from the old result row to the new one. Fixed grants use
their fixed rule path. Manual origins use a generated UUID key and
`kind: "manual"`.

Rails validates the origin array and each table's supported `contribution`
shape as defined under JSONB contracts. These are provenance records for one
character, not a generic catalog rules relation. Reconciliation loads that
character's owned rows directly; do not add a GIN index merely for this
process.

### Advancement reconciliation

Before confirmation, advancement interprets the current choices and catalog
rules into an expected set of deterministic grant keys for proficiencies,
languages, features, spell access paths, resources, and items. In the same
locked transaction used to confirm the draft, it:

1. computes expected grants without applying suppressions
2. removes any existing non-manual origin whose key is suppressed and does not
   materialize that expected grant
3. adds other new origins and creates their result rows when needed
4. updates the rule-owned contribution of origins that still exist
5. moves an origin when the answer for its choice slot now targets another row
6. removes non-manual origins that are neither expected nor suppressed
7. deletes a result row only when it has no origins left

Manual origins are never removed or rewritten by reconciliation. If a manual
and generated origin produce the same catalog-backed proficiency, language, or
feature, keep one result row with both origins. Add partial unique indexes on
`(character_id, feature_id)` and `(character_id, trait_id)` when those ids are
not null, matching the existing catalog-backed uniqueness rules for
proficiencies and languages. Manual rows with null catalog ids remain separate.
CharacterSpells remains one row per access key, and CharacterItems keeps one row
per grant path rather than combining identical equipment from unrelated grants.

For a proficiency with several origins, set `rank` to the strongest active
contribution in this order: `half`, `proficient`, `expertise`. A
`rank_override` takes precedence. Removing one origin therefore cannot remove
proficiency supplied by another, and removing expertise falls back to the next
active rank. Language and feature rows likewise survive while any origin
remains.

Reconciliation preserves player-owned and in-play fields on a surviving row:
spell preparation and overrides, resource `current` and overrides, feature and
resource state, item quantity, equipment state, container, and notes, and
the `position` of features and items. A new
item row receives its granted quantity once. Later reconciliation does not
restore consumed or sold quantities. If an old choice removes an entire row
that still has player state, the draft review shows that pending deletion before
confirmation. Keeping the old row converts its old origin to a manual origin.
Suppressing the current choice removes the old generated origin and prevents the
new result; it does not silently freeze the old target.

CharacterActions are not advancement results. Their singular `origin` remains
descriptive metadata for a manual action. CharacterEffects track live source
instances through their source columns instead of grant origins. A
concentration anchor is an ordinary effect row and is never reconciled.

## AdvancementDrafts

- `user_id`: references Users, `ON DELETE CASCADE`
- `character_id`: references Characters, nullable
- `kind`: text with a check constraint allowing `creation` or `level_up`
- `base_character_lock_version`: non-negative integer, nullable
- `state`: JSONB, default `{}`
- `created_at`, `updated_at`: timestamptz

```sql
UNIQUE (character_id)

CHECK (
  (kind = 'creation' AND character_id IS NULL
    AND base_character_lock_version IS NULL)
  OR
  (kind = 'level_up' AND character_id IS NOT NULL
    AND base_character_lock_version IS NOT NULL)
)
```

A draft holds one unfinished creation or level-up flow. A level-up draft
references the character being advanced. A creation draft has a null
`character_id`, and Postgres permits many of those, so a user can have several
characters in progress. `state` holds the answers collected so far, including
the name and other basic details a creation draft has not yet written anywhere.
It also holds provisional grant suppressions during creation because no
Character row exists yet. Confirming creation writes those suppressions to
CharacterGrantSuppressions with the newly created character id. A level-up draft
may stage suppression additions and removals in the same state; they take effect
only on confirmation.

Do not version `state` for the MVP. Treat new keys as additive; a missing key
means unanswered. If a deploy changes the meaning of existing keys so a draft
no longer matches the current interpreter, reject resume and confirmation and
let the player start that flow again. Do not migrate old draft blobs.

When a level-up draft starts, it copies the Character's `lock_version` to
`base_character_lock_version`. Confirmation locks both rows, rejects the draft
as stale if the versions differ, writes the character and its owned rows in one
transaction, increments `lock_version`, and deletes the draft. Locking the draft
also prevents two requests from applying it. Cancelling is a plain delete.
Because an in-progress flow never touches the character's own rows, an
unfinished level-up cannot partly change an active character, and a Character
row always represents a character the player has confirmed.

`user_id` uses `ON DELETE CASCADE`. Add `UNIQUE (user_id, id)` to Characters and
use `(user_id, character_id)` as the draft's composite foreign key to
`Characters(user_id, id)`, also with `ON DELETE CASCADE`. This prevents a draft
from naming another user's character while permitting a null character for a
creation draft.

## ContentSources

- `reference_key`: UUID, not null, default generated, unique
- `name`: text
- `source_type`: text with a check constraint allowing `official`,
  `third_party`, or `homebrew`
- `owner_user_id`: references Users, nullable
- `visibility`: text with a check constraint allowing `private` or `public`,
  default `private`
- `rules_version`: text, nullable
- `upstream_repository`: text, nullable
- `upstream_revision`: text, nullable
- `imported_at`: timestamptz, nullable

```sql
CHECK (
  (source_type = 'homebrew' AND owner_user_id IS NOT NULL)
  OR
  (source_type IN ('official', 'third_party') AND owner_user_id IS NULL)
)
```

`owner_user_id` uses `ON DELETE CASCADE`. Index it. All catalog rows in a
source share that owner and visibility. Do not put `user_id` on individual
spells or other catalog tables. Add a partial unique index on `owner_user_id`
where `source_type = 'homebrew'`, so the MVP keeps one homebrew source per
user.

`rules_version` identifies an edition such as `2014`. `upstream_revision`
records the exact immutable revision, normally a git commit hash, represented
by the active imported rows. Retired rows may predate that revision.

Imported and homebrew content use different ContentSources. An import must
only update rows belonging to its source, so it cannot overwrite user-created
content. `reference_key` is the stable identity used by JSONB references; the
numeric primary key remains an internal relational key.

Any signed-in user can read official and imported third-party sources. A
homebrew source is readable by its owner, by any signed-in user when
`visibility` is `public`, and by users with a ContentSourceShares row. Only
the owner can create, edit, or delete rows in that source. A share or public
visibility grants read access only. Reference validation uses these rules and
does not make private content visible indirectly.

## ContentSourceShares

- `content_source_id`: references ContentSources
- `user_id`: references Users
- primary key: `(content_source_id, user_id)`

Add a separate index on `user_id`. Both foreign keys use `ON DELETE CASCADE`.
A share is read access for that user. The owner does not need a share row on
their own source. The application only inserts shares for homebrew sources
and rejects a share to the owner.

## Spells

In addition to the common catalog fields:

- `level`: integer with a check constraint from 0 to 9
- `description`: text, nullable
  - join the source `desc` paragraphs with `\n\n`
- `school`: text
- `is_ritual`: boolean, default false
- `requires_concentration`: boolean, default false
- classes: many-to-many through ClassSpells
- subclasses: many-to-many through SubclassSpells

`data` keeps the remaining source-shaped display and mechanics fields:

- `higher_level`
- `duration`
- `casting_time`
- `range`
- `components`
- `material`
- `heal_at_slot_level`
- `dc`
- `attack_type`
- `area_of_effect`
- `damage`

These fields are sparse or do not need database filtering in the MVP. Rails
validates the shapes the sheet and importer consume. Damage remains one nested
object because the current source has at most one damage entry per spell.

## Classes

In addition to the common catalog fields:

- `hit_die`: positive integer
- subclasses: has many Subclasses
- features: has many Features
- spells: many-to-many through ClassSpells

`data` keeps the source-shaped class rules:

- `spellcasting`
- `proficiencies`
- `proficiency_choices`
- `saving_throws`
- `starting_equipment`
- `starting_equipment_options`
- `multi_classing`
- `levels`

Each class's `levels` value contains its progression records, including
proficiency bonus, ability score bonuses, spellcasting, and `class_specific`
data. The importer removes feature lists and other stored relationships from
these records. The application can fetch one class row to render its
progression.

## Subclasses

In addition to the common catalog fields:

- `class_id`: references Classes
- `subclass_flavor`: text, nullable
- `description`: text, nullable
  - join the source `desc` paragraphs with `\n\n`
- features: has many Features
- spells: many-to-many through SubclassSpells

`data` contains the subclass progression levels, conditional spell grants, and
other fields that do not need filtering. The importer removes feature lists and
other stored relationships from the level records. The `subclass_levels` API
URL is not stored.

Each conditional spell-grant entry keeps one spell reference and all of that
entry's prerequisites, with API URLs normalized to content types and external
keys. All prerequisites in one entry apply together. Separate entries for the
same spell are alternatives and must remain separate. For example, the two Land
entries for Spider Climb mean "Druid 3 and Forest" or "Druid 3 and Mountain";
they must not be merged into one prerequisite list.

## Features

In addition to the common catalog fields:

- `class_id`: references Classes, nullable
- `subclass_id`: references Subclasses, nullable
- `parent_feature_id`: references Features, nullable
- `level`: integer with a check constraint from 1 to 20
- `is_automatic`: boolean, default false
- `source_position`: non-negative integer, nullable
- `description`: text, nullable
  - join the source `desc` paragraphs with `\n\n`

```sql
CHECK (num_nonnulls(class_id, subclass_id) = 1)
```

A class feature stores `class_id` and leaves `subclass_id` null. A subclass
feature stores `subclass_id` and leaves `class_id` null. Its class is
`Subclasses.class_id`. Class-wide queries include both `Features.class_id`
and features whose subclass belongs to that class.

Every feature in the current SRD data identifies its class and level.
`source_position` is its zero-based index in a source level's `features` array
and is null when it does not appear in one. `is_automatic` controls advancement
and is independent of that source fact. Guided flows order automatic features
by level, then `source_position` with nulls last, then name. Homebrew can mark a
feature automatic without inventing a source-array position.

The importer sets `is_automatic = true` for every feature listed in a class or
subclass level's `features` array and records that array index as
`source_position`. Selectable child features remain non-automatic unless an
explicit correction says otherwise.

Of the 407 SRD features, 317 appear in a level's `features` array and 84 are
selectable children carrying a `parent`. The two sets are disjoint before the
known source corrections below. After corrections, automatic features and
selectable children remain disjoint.

The SRD importer applies a small correction manifest tied to the supported
source revision:

- mark `circle-of-the-land` automatic at Druid Land level 2
- mark `circle-spells-1` through `circle-spells-4` automatic at Druid Land
  levels 3, 5, 7, and 9 respectively
- set `metamagic-twinned-spell`'s parent to `metamagic-1`; it remains
  non-automatic

The five omitted Land features retain null `source_position`; the importer does
not fabricate source ordering. Keep these corrections as explicit fixtures with
import tests rather than scattering key checks through the importer. A manifest
entry must assert its expected uncorrected shape and fail when a later upstream
revision no longer matches, so it cannot silently overwrite an upstream fix.

`data` keeps `prerequisites`, `feature_specific`, choices, and source reference
metadata. The guided flows interpret the rule shapes they support and fall back
to manual input for the rest.

`parent_feature_id` must not create a cycle. The importer and homebrew editor
reject a self-parent and any walk that returns to the starting row.

## Races

In addition to the common catalog fields:

- `walking_speed`: integer
- `size`: text with a check constraint allowing `tiny`, `small`, `medium`,
  `large`, `huge`, or `gargantuan`
- subraces: has many Subraces
- traits: many-to-many through RaceTraits

`data` keeps the source-shaped rules and display text:

- `ability_bonuses`, normalized to `{ "str": 2, "cha": 1 }`
- `ability_bonus_options`
- `languages` and `language_options`
- `proficiencies` and `proficiency_choices`
- `age`, `alignment`, `size_description`, `language_description`

The bundled SRD has no race-level `desc`, so there is no promoted
`description` column. The four narrative fields are display-only and never
filtered. `walking_speed` is named for the movement mode it holds, so a later
source with swimming or flying speeds can add them under `data` without the
column becoming misleading. Every SRD race is Medium or Small, but the check
constraint allows the full set of sizes.

In the bundled SRD, racial proficiencies arrive only through traits, and
`ability_bonus_options` appears only on Half-Elf. Those are import facts, not
homebrew limits. Advancement reads proficiency and language grants from this
row's `data` when present, and from Traits. Homebrew may put grants on the
race, on traits, or both.

## Subraces

In addition to the common catalog fields:

- `race_id`: references Races
- `description`: text, nullable
  - join the source `desc` paragraphs with `\n\n`
- traits: many-to-many through SubraceTraits

`data` may keep `ability_bonuses` in the same normalized shape, plus
`languages`, `language_options`, `proficiencies`, `proficiency_choices`, and
other choice envelopes the race row already allows. Bundled SRD subraces carry
none of those; that is an import fact, not a homebrew limit. Advancement reads
whatever grants are present.

## Traits

In addition to the common catalog fields:

- `parent_trait_id`: references Traits, nullable
- `description`: text, nullable
  - join the source `desc` paragraphs with `\n\n`
- races: many-to-many through RaceTraits
- subraces: many-to-many through SubraceTraits

`data` keeps `trait_specific`, `proficiencies`, `proficiency_choices`, and
`language_options`.

Traits stay a separate table from Features because that matches the SRD import:
a feature has one class or subclass owner, and a trait such as `darkvision`
can be granted by several races. That is about who owns the record, not about
join tables in general. Spells already have ClassSpells and SubclassSpells, and
Equipment has EquipmentCategoryMembers. Homebrew is not limited by the SRD
ownership story. A homebrew race may grant proficiencies itself, and a
homebrew feature still uses the class or subclass owner check. Merging the two
catalog tables is deferred. CharacterFeatures still combines features and
traits on the character side.

MVP feats are manual CharacterFeatures entries with neither catalog reference.
Catalog-backed feats are deferred; do not put them in Features while a row
must have a class or subclass.

`parent_trait_id` works exactly like `parent_feature_id`, including the
no-cycle rule. The ten Draconic Ancestry subtraits carry it and are chosen
through the parent's `subtrait_options`, which is the same shape as a
feature's `subfeature_options`. A trait is automatic when a RaceTraits or
SubraceTraits row grants it; children have no such row and are reached only
through the parent's options.

Of the 38 SRD traits, 31 name a race and 7 name a subrace, with no overlap.
Ten of the 31 are Draconic Ancestry children and are not granted directly, so
RaceTraits holds 27 rows covering 21 distinct traits, and SubraceTraits holds
7. Only 5 traits carry fixed proficiency grants and 2 carry proficiency
choices.

## Backgrounds

Uses the common catalog fields with no additional promoted columns initially.
The source has no background-level `desc`; do not use its embedded feature's
description as a description of the whole background.

`data` keeps the source-shaped rules and narrative choices:

- `starting_proficiencies`
- `language_options`
- `starting_equipment` and `starting_equipment_options`
- `feature`, an embedded object with `name` and `desc` paragraphs
- `personality_traits`, `ideals`, `bonds`, and `flaws`

Normalize individual grants to typed content references as usual. A collection
selector is not an individual reference: replace a language choice's
`resource_list_url` with `content_type: "language"`, keeping its
`option_set_type: "resource_list"` and required choice count. Equipment-category
choices reference EquipmentCategories; the flow lists their members. Keep ideal
alignment identifiers as display and guidance values, not foreign keys.

The flow writes proficiency, language, and equipment results to their existing
character-owned tables and narrative choices to Characters.profile. On
confirmation, the embedded feature becomes a CharacterFeatures row with its
saved name, `desc` joined with `\n\n` as `description`, both catalog references
null, and an origin naming the selected background. It is not an independently
addressable Features record and does not need an invented class or level.
Its saved text is player-owned; the background page still displays current
catalog text. Do not also generate a duplicate feature at sheet-read time.

The bundled Acolyte record grants Insight and Religion, two language choices,
common clothes, a pouch, and a choice of holy symbol. Import the supplied grants
only; do not infer starting money or extra supplies from the item's name or
from rules absent from this source record.

## Equipment

In addition to the common catalog fields:

- `equipment_category_id`: references EquipmentCategories, nullable for
  uncategorized homebrew
- `description`: text, nullable; join source `desc` paragraphs with `\n\n`
- `is_magic`: boolean, not null, default false
- `rarity`: text, nullable, with a check constraint allowing `common`,
  `uncommon`, `rare`, `very_rare`, `legendary`, `artifact`, or `varies`
- categories: many-to-many through EquipmentCategoryMembers

Import both the equipment and magic-item files into this table. Set `is_magic`
from the upstream collection, not the name or rarity. Normalize `rarity.name`
to the checked vocabulary; null means unspecified and `varies` remains distinct.
Category, magic status, and rarity are catalog filters. The direct category
reference records the item's primary `equipment_category`; category membership
also records narrower and overlapping sets used by equipment choices.

Imported external keys include the upstream collection, such as
`equipment/longsword` and `magic-items/weapon-1`. Normalize every incoming item
reference, including pack contents and magic-item variants, using the collection
in its source URL before discarding the URL. Both resolve to content type
`equipment` in this app. Equipment-category references remain a different
content type, even when their source index matches an item index.

`data` keeps the sparse mechanics and display fields:

- `cost`, `weight`, and `quantity`
- `weapon_category`, `weapon_range`, `damage`, `two_handed_damage`, `range`,
  `throw_range`, `properties`, and `special`
- `armor_category`, `armor_class`, `str_minimum`, and `stealth_disadvantage`
- `gear_category`, `contents`, and `tool_category`
- `vehicle_category`, `speed`, and `capacity`
- `variant`, `variants`, and optional `image`

Do not retain the derived `category_range` string. For this MVP, normalize
weapon properties to embedded objects with a stable property key, name, and
description enriched from the weapon-properties file. They support display and
the sheet's known mechanics without a separate property catalog or join table.
Rebuild them on import; property filtering is deferred. The source image path
is display metadata, not the discarded record API URL.

Preserve numeric weights, including fractions, and keep missing cost or weight
distinct from zero. Source `quantity` describes the purchase bundle, not a
character's inventory count. Keep it with the bundle cost and weight; any
per-unit conversion must account for that quantity. Pack `contents` retains each
item reference and its quantity separately from a character's owned contents.

Keep armor's `base`, `dex_bonus`, and optional `max_bonus` together. A missing
Dexterity cap is not a zero cap, and a shield's base value is an AC bonus, not a
standalone AC. Keep two-handed weapon damage as an alternative rather than
adding it to normal damage. Do not require a damage field for every weapon;
the Net uses special text instead. Vehicle speed retains its own unit.

Magic-item records mostly contain prose rather than structured bonuses,
attunement requirements, charges, or base-item references. Do not invent these
from an item's name or category. Preserve family and variant records separately
and resolve `variants` for browsing; the Armor +1 variant still does not specify
a particular suit of armor. Unsupported mechanics use the existing manual
character editing path rather than implying that importing an item fully
automates it.

## EquipmentCategories

Uses the common catalog fields. Equipment is many-to-many through
EquipmentCategoryMembers. `data` is `{}` for the current source after extracting
membership; the source supplies no category description.

Categories are overlapping sets, not a supplied hierarchy. A dagger can belong
to Weapon, Simple Weapons, Melee Weapons, and Simple Melee Weapons. Build
membership from each category's `equipment` array, not just the item's primary
category. Members can reference either upstream item collection, so apply the
Equipment external-key mapping to each reference.

Starting-equipment category choices use these sets. For normal SRD starting
equipment, filter out `is_magic = true`; broad source categories can contain
magic items too. Manual choices remain available. Do not treat a category such
as `holy-symbols` as an inventory item or resolve it by name.

## Conditions

In addition to the common catalog fields:

- `description`: text, nullable; join source `desc` paragraphs with `\n\n`

`data` is `{}` for the current source after extracting the description. This
table supplies searchable condition rules and the optional catalog reference
on CharacterEffects; it does not store which characters are affected.

The source rules are prose, not machine-readable dependencies. Do not infer
automatic condition grants from names mentioned in a description. Exhaustion
is one catalog condition; a character's current exhaustion level belongs in
CharacterEffects.state, not in separate condition rows for each level.

## Monsters

In addition to the common catalog fields:

- `monster_type`: text, nullable, normalized from source `type`, such as
  `beast`
- `size`: text, nullable, with the same six-value check constraint as Races
- `challenge_rating`: non-negative numeric, nullable, including fractional
  values such as `0.125`, `0.25`, and `0.5`
- `description`: text, nullable; source `desc` is already a string
- `flying_speed`: non-negative integer, nullable
- `swimming_speed`: non-negative integer, nullable

Type, size, and challenge rating support browsing and sorting. Null on those
columns, or on a movement speed, means unknown for incomplete homebrew or an
unsupported source format. Flying and swimming speeds support the Wild Shape
form selector. Normalize supported `speed.fly` and `speed.swim` values to
feet; an absent mode in an imported SRD stat block means zero. Report
unsupported formats and do not treat unknown movement as eligible for a
movement-restricted form choice.

`data` keeps the remaining stat block:

- `subtype`, `alignment`, and optional `image`
- the full `armor_class` array of alternatives
- `hit_points`, `hit_dice`, and `hit_points_roll`
- `speed`, excluding the two promoted movement modes but retaining other
  movement modes and `hover`
- `strength`, `dexterity`, `constitution`, `intelligence`, `wisdom`, `charisma`
- `proficiencies`, `proficiency_bonus`, and `xp`
- `damage_vulnerabilities`, `damage_resistances`, `damage_immunities`, and
  `condition_immunities`
- `senses` and `languages`
- `special_abilities`, `actions`, `reactions`, `legendary_actions`, and `forms`

Reconstruct the speed display from the promoted columns and remaining JSONB
modes. Do not flatten armor alternatives to one integer: some monsters have
different AC with a spell or condition. Keep damage-defense qualifiers and
language descriptions as text. Monster proficiency values are supplied bonuses,
not CharacterProficiencies ranks. Preserve nested action choices, multiattack
alternatives, and usage rules without assuming every count is an integer.

Normalize actual content references, including condition immunities, alternate
forms, and spell URLs nested under special abilities. Forms can refer to each
other; they are not a parent-child tree. Local action names remain local to the
stat block rather than becoming catalog foreign keys.

Known forms and active form state stay on the character. This table supplies
the current catalog stat block, not a second copy of active form HP. A form
selector filters `monster_type = 'beast'`, not names or appearance, and still
permits manual choices under the flow's warning policy.

## Proficiencies

In addition to the common catalog fields:

- `category`: text with a check constraint allowing `skill`, `saving_throw`,
  `weapon`, `armor`, `tool`, or `other`
- `ability`: text, nullable, with a check constraint allowing `str`, `dex`,
  `con`, `int`, `wis`, or `cha`
- `equipment_id`: references Equipment, nullable
- `equipment_category_id`: references EquipmentCategories, nullable

```sql
CHECK (num_nonnulls(equipment_id, equipment_category_id) <= 1)
```

The importer maps source `type` values onto the same vocabulary used by
CharacterProficiencies:

- `Skills` becomes `skill`
- `Saving Throws` becomes `saving_throw`
- `Weapons` becomes `weapon`
- `Armor` becomes `armor`
- `Artisan's Tools`, `Musical Instruments`, `Gaming Sets`, and `Vehicles`
  become `tool`
- `Other` becomes `other`

Resolve a skill's ability through the source Skills file and a saving throw's
ability through its direct Ability Scores reference. Do not infer either from
the proficiency name. Skills and ability scores do not need catalog tables for
this use. Imported skill and saving-throw rows require `ability`; other
categories normally leave it null.

An equipment reference identifies one item, while an equipment-category
reference identifies every member of that category. Resolve the URL's
collection before discarding it. For example, the `armor` equipment-category
key is not the magic-item family with an `armor` source index. These promoted
foreign keys let the sheet test weapon, armor, and tool coverage using
EquipmentCategoryMembers without parsing names or polymorphic JSON.

Both optional target foreign keys use `ON DELETE SET NULL`. Homebrew can define
an abstract proficiency without either target; the app can display it but
cannot automatically apply it to equipment. After extracting the normalized
ability and target, `data` is `{}` for the current SRD source. Ignore the
source's reverse `races` list as described under importing.

The source data has no language proficiencies; languages are separate content
and get their own table.

## Languages

In addition to the common catalog fields:

- `language_type`: text
  - source values include `Standard` and `Exotic`; other values are allowed
- `script`: text, nullable

`data` keeps `typical_speakers`. Sixteen rows import from the source language
file. Races, backgrounds, and classes reference languages through their own
JSONB rules, which the guided flows resolve against this table.

The guided flows use this table to resolve language references and present
bounded choices. Fixed grants and choice rules remain in the owning catalog
record's JSONB rather than separate grant tables.

## EquipmentCategoryMembers

- `equipment_category_id`: references EquipmentCategories
- `equipment_id`: references Equipment
- primary key: `(equipment_category_id, equipment_id)`

Add a separate index on `equipment_id`; the primary key already indexes
`equipment_category_id`. Both foreign keys use `ON DELETE CASCADE`, so deleting
a category or item removes its membership links, not the other catalog rows.

Replace imported memberships from the category's `equipment` array on each
import. These links belong to the category's ContentSource for replacement
purposes; importing an item must not remove another source's category links.
The primary-category foreign key on Equipment uses `ON DELETE SET NULL`, so
deleting a homebrew category does not delete its items.

## ClassSpells

- `class_id`: references Classes
- `spell_id`: references Spells
- primary key: `(class_id, spell_id)`

Add a separate index on `spell_id`; the primary key already indexes
`class_id`.

This table records the class spell lists supplied by the source. It does not
try to infer whether a character knows or has prepared a spell.

## SubclassSpells

- `subclass_id`: references Subclasses
- `spell_id`: references Spells
- primary key: `(subclass_id, spell_id)`

Add a separate index on `spell_id`; the primary key already indexes
`subclass_id`.

This table records subclass spell lists supplied by the source. The source
does not reliably distinguish `available`, `always_prepared`, and
`always_known`, so those meanings are deferred until a character spellcasting
workflow needs them.

This is a deduplicated browse and search index: it answers whether a subclass
can ever provide a spell. It does not drive advancement eligibility. Build one
row for each distinct subclass and spell pair found in the conditional grant
entries retained in Subclasses.data. The advancement flow reads those complete
entries so it keeps their level and feature prerequisites, including multiple
alternative entries for the same spell.

## RaceTraits

- `race_id`: references Races
- `trait_id`: references Traits
- `position`: non-negative integer
- primary key: `(race_id, trait_id)`

Add a separate index on `trait_id`; the primary key already indexes `race_id`.

## SubraceTraits

- `subrace_id`: references Subraces
- `trait_id`: references Traits
- `position`: non-negative integer
- primary key: `(subrace_id, trait_id)`

Add a separate index on `trait_id`; the primary key already indexes
`subrace_id`.

Both tables record automatic grants only, built from the source `race.traits`
and `subrace.racial_traits` arrays. `position` preserves the order within those
arrays and lives here rather than on Traits, because a shared trait has a
different position in each race that grants it.

The source states the relationship in both directions and the two disagree.
`race.traits` yields 27 pairs and `trait.races` yields 37; the ten extra are
the Draconic Ancestry subtraits, which are selectable rather than granted.
Import from the grant side only.

## Importing upstream changes

Import one ContentSource in a database transaction:

1. Parse and validate the source files. Fail the import on unreadable files,
   invalid identity keys, or a correction-manifest assertion that no longer
   matches.
2. Lock the ContentSources row so a second import of the same source cannot
   interleave.
3. Upsert catalog identities by `(content_source_id, external_key)` in
   dependency order for required foreign keys. Clear `retired_at` on each
   upserted row.
4. Resolve nullable self-references after those identities exist, including
   `parent_feature_id` and `parent_trait_id`. A second pass is required; do
   not depend on file order alone. Fail the import if those links contain a
   cycle.
5. Replace that source's ClassSpells, SubclassSpells, RaceTraits,
   SubraceTraits, and EquipmentCategoryMembers rows.
6. Set `retired_at` on that source's independently addressable rows whose
   keys are absent from this revision and not already retired.
7. Set `upstream_revision` and `imported_at` only after every write succeeds.

Replace imported JSONB data as a whole instead of merging arbitrary nested
keys. Never match content by name and never update rows belonging to another
ContentSource.

Import EquipmentCategories before Equipment to resolve primary categories,
and populate category membership after both item collections have been
upserted. Apply namespaced equipment keys consistently to catalog rows and
references in classes, backgrounds, pack contents, variants, and monster rules.
Rebuild embedded weapon-property descriptions from the same source revision.

Ignore `Proficiencies.races` in the source. It restates what the granting
traits already say and is the only place the same grant appears twice.

`upstream_revision` describes the active import, not retired rows. A retired
subclass can remain while losing its SubclassSpells links, because those
joins are rebuilt from the current revision. Ordinary browse, search, and
new selection lists omit `retired_at IS NOT NULL`. Existing character and
homebrew references keep their ids and JSONB tuples, still resolve to the
retained row for display and sheet use, and do not redirect to same-named
active content. Homebrew rows are not retired by this importer; they are
deleted through the homebrew path.

Fail the import for structural errors: unreadable or invalid source files,
a required parent that is still missing after the resolution pass, unique
constraint failures, and correction-manifest mismatches. Report recoverable
rule anomalies as import warnings and still commit: an uncorrected feature
that is neither automatic nor a selectable child, a trait named by
`trait.races` but absent from that race's `traits` array while carrying no
parent, a level reference to a missing feature, or an unrecognized
proficiency `type`.

Do not add import-history tables until the product needs audit or rollback.

## Deferred normalization

The following tables are deliberately omitted:

- CharacterElements
- ProgressionLevels and ProgressionLevelFeatures
- ProficiencyGrants
- ChoiceGroups, ChoiceOptions, and ChoiceOptionAlignments
- RequirementGroups and Requirements
- StartingEquipment
- SpellAccess
- RaceLanguages and TraitProficiencies; fixed language and proficiency grants
  stay in the owning record's JSONB as content type and external key, matching
  the existing rule for grants
- a favorites or quick-access table; the sheet has no pinning feature yet, so
  neither spells nor actions carry a favorite flag

Add narrower tables only when the application must query a rule independently
or the JSONB interpreter becomes difficult to maintain. Guided creation alone
does not require a generic rule or polymorphic content model.
