/**
 * Draft contract for `GET /api/v1/characters/:id`, the read behind the whole character sheet.
 *
 * This is a planning draft. Step 1.1 of `docs/character-sheet-build-plan.html` moves it to
 * `frontend/src/api/character-sheet.ts` once it's approved, and the fixtures beside it become the
 * golden files for both sides.
 *
 * Conventions match `GET /api/v1/characters`: snake_case keys, ids as strings, and every key
 * always present, with null for "none". Lists arrive in display order, so the app never sorts.
 *
 * The API sends facts, plus the short display lines that need rules knowledge to write: every
 * `summary`, `label`, `detail` and `marks` field. Those are American English, sentence case, and
 * never use pronouns, because the data model doesn't store any. The app formats everything else.
 *
 * Milestone 1 carries only what the read-only phone sheet shows. Later milestones add fields;
 * they never rename or remove one.
 */

/** Ability identifiers, as the data model writes them. */
export type Ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

/** How proficient a character is with a skill or tool. No proficiency is null, not a rank. */
export type Rank = 'half' | 'proficient' | 'expertise';

/** Which rest recovers a resource. `manual` means the player refills it by hand. */
export type ResetOn = 'short_rest' | 'long_rest' | 'dawn' | 'manual';

/** The nine alignments. The basic details screen offers them as a three by three grid. */
export type Alignment =
    | 'lawful_good'
    | 'neutral_good'
    | 'chaotic_good'
    | 'lawful_neutral'
    | 'neutral'
    | 'chaotic_neutral'
    | 'lawful_evil'
    | 'neutral_evil'
    | 'chaotic_evil';

/** The eighteen skills. The sheet always lists all of them, in this order. */
export type SkillKey =
    | 'acrobatics'
    | 'animal_handling'
    | 'arcana'
    | 'athletics'
    | 'deception'
    | 'history'
    | 'insight'
    | 'intimidation'
    | 'investigation'
    | 'medicine'
    | 'nature'
    | 'perception'
    | 'performance'
    | 'persuasion'
    | 'religion'
    | 'sleight_of_hand'
    | 'stealth'
    | 'survival';

/**
 * A number the API calculates and the player may replace. The sheet shows an override badge
 * whenever `override` isn't null, even if it happens to equal `calculated`.
 */
export type DerivedValue = {
    /** What the sheet shows: the override when there is one, otherwise the calculated value. */
    value: number | null;
    /** What the rules give, or null when the API can't work it out, such as with no scores. */
    calculated: number | null;
    /** The player's replacement, or null when the calculated value applies. */
    override: number | null;
};

/** A small outlined label. `tone` picks the ink, following the design system's marks. */
export type Mark = {
    label: string;
    /** `ok` for a ready resource or a source, `bad` for danger, `conc` for an active effect. */
    tone: 'ok' | 'bad' | 'conc';
};

/** One damage expression, with its modifiers already added, such as `1d6+2` slashing. */
export type DamageRoll = {
    dice: string;
    /** A damage type key, such as `slashing` or `force`. */
    type: string;
};

/** A saving throw an attack or spell forces. */
export type SaveRequirement = {
    ability: Ability;
    dc: number;
};

/** The body of `GET /api/v1/characters/:id`. */
export type CharacterSheet = {
    id: string;
    /** Sent back with every write from milestone 3 on, so a stale write fails. */
    lock_version: number;
    name: string;
    /** A six-digit CSS hex color, such as `#2560b0`. */
    token_ink: string;
    rules_version: string;
    alignment: Alignment | null;
    ancestry: {
        race_name: string | null;
        subrace_name: string | null;
    };
    background_name: string | null;
    /** In the character's stored order. Empty for a character with no classes. */
    classes: SheetClass[];
    /** The sum of the class levels. 0 with no classes. */
    total_level: number;
    proficiency_bonus: number;
    hit_points: {
        current: number | null;
        maximum: number | null;
        temporary: number;
    };
    /** Each 0 to 3. Only meaningful at 0 hit points. */
    death_saves: {
        successes: number;
        failures: number;
    };
    inspiration: boolean;
    armor_class: DerivedValue;
    initiative: DerivedValue;
    /** Walking speed in feet. */
    speed: DerivedValue;
    /** Always six, from Strength to Charisma. */
    abilities: AbilityScore[];
    /** Always six, from Strength to Charisma. */
    saving_throws: SavingThrow[];
    /** Always eighteen, in `SkillKey` order. */
    skills: Skill[];
    /**
     * The note under the skills explaining a rule that changes them, such as Remarkable athlete's
     * half ranks. Written by the handler that grants the ranks; null when no rule needs one.
     */
    skills_note: string | null;
    /** 10 plus the skill's bonus, or null when the bonus is unknown. */
    passives: {
        perception: number | null;
        investigation: number | null;
        insight: number | null;
    };
    /** Weapon, armor, tool and other proficiencies. Skills and saves have their own lists. */
    proficiencies: Proficiency[];
    languages: Language[];
    resources: Resource[];
    attacks: Attack[];
    actions: SheetAction[];
    /** One per spellcasting card. Empty, along with `spells`, means the sheet has no Spells tab. */
    spellcasting: CastingSource[];
    /** By level, then always-prepared spells first, then by name. */
    spells: Spell[];
    feature_groups: FeatureGroup[];
    /** In the player's order. The app groups them into equipped, attuned, carried and containers. */
    items: Item[];
    money: Money;
    profile: Profile;
    notes: string | null;
    concentration: Concentration | null;
    /** Active conditions, one entry per condition however many sources applied it. */
    conditions: ActiveCondition[];
    /** 0 when not exhausted, otherwise 1 to 6. */
    exhaustion_level: number;
    level_up_draft: LevelUpDraftSummary | null;
    warnings: SheetWarning[];
};

export type SheetClass = {
    id: string;
    name: string;
    level: number;
    subclass_name: string | null;
};

export type AbilityScore = {
    ability: Ability;
    /** Null when the player hasn't entered the score yet. */
    score: number | null;
    modifier: number | null;
};

/** Saving throws are proficient or not. Half and expertise only apply to skills and tools. */
export type SavingThrow = {
    ability: Ability;
    proficient: boolean;
    bonus: DerivedValue;
};

export type Skill = {
    key: SkillKey;
    /** Sentence case, such as `Sleight of hand`. */
    name: string;
    ability: Ability;
    rank: Rank | null;
    /** True when the player chose this rank instead of the one advancement gave. */
    rank_overridden: boolean;
    bonus: DerivedValue;
};

export type Proficiency = {
    id: string;
    name: string;
    category: 'weapon' | 'armor' | 'tool' | 'other';
    /** Null for weapons and armor, which have no rank on the sheet. */
    rank: Rank | null;
};

export type Language = {
    id: string;
    name: string;
};

/** Something with uses the player spends by tapping pips. */
export type Resource = {
    id: string;
    /** Lets the app place a resource: hit dice and slots have their own spots. */
    kind: 'hit_dice' | 'spell_slots' | 'pact_magic' | 'other';
    name: string;
    current: number;
    /** The effective maximum, the player's override when set. */
    maximum: number;
    reset_on: ResetOn;
    /** The slot level for spell slots and Pact magic, otherwise null. */
    slot_level: number | null;
    /** The line under the name in Resources, such as `Two 3rd-level slots, short rest`. */
    summary: string | null;
};

/**
 * One row of the Play tab's attack table: a manual attack action, a weapon, a damaging cantrip, or
 * a levelled spell that keeps attacking after the turn it's cast, such as Spiritual weapon.
 */
export type Attack = {
    id: string;
    name: string;
    /**
     * What the attack takes. The row's second line leads with anything but `action`, as in
     * `Bonus action, 60 ft`.
     */
    action_type: ActionType;
    /** Melee reach in feet, or null for an attack with no melee use. */
    reach: number | null;
    /** Ranged or thrown distance in feet, or null for melee only. */
    range: {
        normal: number;
        long: number | null;
    } | null;
    /** Null when the attack forces a save instead. */
    attack_bonus: number | null;
    save: SaveRequirement | null;
    damage: DamageRoll[];
    /** Weapon properties in sentence case, such as `Finesse` or `Versatile (1d10)`. */
    properties: string[];
    /**
     * Anything else the row says, such as `two beams, pushes 10 ft`, or `at 3rd` for a levelled spell
     * whose path casts it above its own level.
     */
    summary: string | null;
};

/** The Play tab's action groups, in this order. `no_action` is "No action needed". */
export type ActionType = 'action' | 'bonus_action' | 'reaction' | 'no_action';

/** One row of the Play tab's Actions block, grouped by `type` in the order the list arrives. */
export type SheetAction = {
    id: string;
    type: ActionType;
    /**
     * What the row opens from milestone 4: the source's detail for `feature`, `spell`, `item`
     * and `manual`, or a screen of its own for the rest.
     */
    kind:
        | 'feature'
        | 'spell'
        | 'item'
        | 'manual'
        | 'attack'
        | 'cast_a_spell'
        | 'common_actions'
        | 'opportunity_attack';
    name: string;
    summary: string | null;
    marks: Mark[];
};

/** One spellcasting card on the Spells tab: a class, or a feat, item or trait that casts. */
export type CastingSource = {
    id: string;
    kind: 'class' | 'feature' | 'item' | 'race' | 'manual';
    /** The card's title, such as `Pact magic` or `Cleric`. */
    name: string;
    /** The card's second line, such as `Warlock 6`, `Level 7` or `Feat`. */
    detail: string;
    ability: Ability | null;
    save_dc: DerivedValue;
    attack_bonus: DerivedValue;
    /** For classes that prepare spells. Null for known casters and for non-class sources. */
    preparation: {
        prepared: number;
        /** Null when the API can't work out the limit, such as with no Wisdom score. */
        limit: number | null;
        /** Always-prepared spells, which don't count against the limit. */
        always_prepared: number;
    } | null;
    /** The resources this card spends, in display order: slots, Pact magic or uses. */
    resource_ids: string[];
};

/**
 * One spell, with every way the character has to cast it. Two paths to the same catalog spell
 * share one entry and carry a `2 paths` mark.
 */
export type Spell = {
    name: string;
    /** 0 for cantrips. Null for a custom spell with no level. */
    level: number | null;
    /** The row's second line, such as `Action, 60 ft, Dex save 15, 2d8 radiant`. */
    summary: string | null;
    marks: Mark[];
    paths: SpellPath[];
};

/** One access path: a CharacterSpells row. */
export type SpellPath = {
    id: string;
    /** The card this path casts through, or null for a path with fixed numbers, like a ring's. */
    casting_source_id: string | null;
    /** Castable today: known, prepared, or always prepared. The Spells tab hides the rest. */
    prepared: boolean;
    /** The slot level this path always casts at, such as Pact magic's 3rd. */
    cast_at_level: number | null;
    /** A resource this path spends instead of a slot, such as a feat's once per long rest. */
    uses_resource_id: string | null;
};

/** Features and traits from one origin, under one heading on the Character tab. */
export type FeatureGroup = {
    kind: 'class' | 'subclass' | 'race' | 'background' | 'feat' | 'other';
    /** The heading, such as `Warlock 6`, `Acolyte background` or `Feat, taken at level 4`. */
    label: string;
    features: Feature[];
};

export type Feature = {
    id: string;
    name: string;
    summary: string | null;
    /** Chosen options shown on the parent's row, such as eldritch invocations. */
    children: {
        id: string;
        name: string;
    }[];
};

export type Item = {
    id: string;
    name: string;
    /** Always 1 or more. The app shows `×2` after the name above 1. */
    quantity: number;
    equipped: boolean;
    /**
     * Where an equipped item is: `worn`, `in_hand` and `belt` have labels in the app. Other text
     * is shown as typed. Null when not equipped.
     */
    equipped_slot: string | null;
    attuned: boolean;
    /** The container this item is in, or null when it's loose. */
    container_id: string | null;
    is_container: boolean;
    /** The line under the name, such as `Light armor, AC 11 + Dex` or `5 things inside`. */
    summary: string | null;
};

export type Money = {
    copper: number;
    silver: number;
    electrum: number;
    gold: number;
    platinum: number;
};

/** The narrative fields, each null when the player hasn't written it. */
export type Profile = {
    age: string | null;
    height: string | null;
    appearance: string | null;
    personality_traits: string | null;
    ideals: string | null;
    bonds: string | null;
    flaws: string | null;
    allies: string | null;
    enemies: string | null;
};

/** What the character is concentrating on, read from the concentration anchor. */
export type Concentration = {
    effect_id: string;
    /** The spell or item effect's name, for `Concentrating: Hex`. */
    name: string;
    /** The access path that was cast, or null when it came from an item or was added by hand. */
    spell_path_id: string | null;
};

export type ActiveCondition = {
    /** The condition's catalog key, such as `poisoned`, or a generated key for a custom one. */
    key: string;
    name: string;
    /** How many active effects apply it. Ending one keeps the condition while others remain. */
    instances: number;
};

/** The character's unconfirmed level-up, for the Character tab's draft card. */
export type LevelUpDraftSummary = {
    id: string;
    to_level: number;
    completed_choices: number;
    total_choices: number;
};

/**
 * A rules warning. It shows as a strip under the header and never blocks anything. The API works
 * warnings out on every read and stores none, so fixing the cause clears the strip. The app picks the
 * strip's button from `code`. Milestone 1 sends only `missing_ability_scores`, with no button.
 */
export type SheetWarning = {
    code:
        | 'resource_over_maximum'
        | 'unresolved_reference'
        | 'missing_ability_scores'
        | 'total_level_above_20'
        | 'preparation_over_limit';
    /** The strip's bold first sentence, such as `Hunger of Hadar is no longer in your sources.` */
    lead: string;
    /** The sentence after the lead, such as `The saved spell stays on the sheet.` */
    detail: string;
    /** The resource, spell path, item or feature the warning is about, when there is one. */
    target_id: string | null;
};
