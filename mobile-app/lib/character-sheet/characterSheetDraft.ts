import { deriveSpellcastingStats } from '@/lib/characterSheetUtils';
import type {
    CharacterSheetDetailQuery,
    SaveCharacterSheetInput,
} from '@/types/generated_graphql_types';

/** Character detail row consumed by the character-sheet route. */
type CharacterSheetDetail = NonNullable<CharacterSheetDetailQuery['character']>;

/** Local HP draft state used while editing the character sheet. */
export type CharacterSheetDraftHp = {
    current: number;
    max: number;
    temp: number;
};

/** Local ability-score draft state used while editing the character sheet. */
export type CharacterSheetDraftAbilityScores = {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
};

/** Local currency draft state used while editing the character sheet. */
export type CharacterSheetDraftCurrency = {
    cp: number;
    sp: number;
    ep: number;
    gp: number;
    pp: number;
};

/** Local traits draft state used while editing the character sheet. */
export type CharacterSheetDraftTraits = {
    personality: string;
    ideals: string;
    bonds: string;
    flaws: string;
    armorProficiencies: string[];
    weaponProficiencies: string[];
    toolProficiencies: string[];
    languages: string[];
};

/** Local weapon row used while editing the character sheet. */
export type CharacterSheetDraftWeapon = {
    id: string;
    name: string;
    attackBonus: string;
    damage: string;
    type: string;
};

/** Local inventory row used while editing the character sheet. */
export type CharacterSheetDraftInventoryItem = {
    id: string;
    name: string;
    quantity: number;
    weight: number | null;
    description: string | null;
    equipped: boolean;
    magical: boolean;
};

/** Local feature row used while editing the character sheet. */
export type CharacterSheetDraftFeature = {
    id: string;
    name: string;
    source: string;
    description: string;
    usesMax: number | null;
    usesRemaining: number | null;
    recharge: string | null;
};

/** Local editable character-sheet draft state. */
export type CharacterSheetDraft = {
    ac: number;
    speed: number;
    initiative: number;
    conditions: string[];
    hp: CharacterSheetDraftHp;
    abilityScores: CharacterSheetDraftAbilityScores;
    currency: CharacterSheetDraftCurrency;
    traits: CharacterSheetDraftTraits;
    weapons: CharacterSheetDraftWeapon[];
    inventory: CharacterSheetDraftInventoryItem[];
    features: CharacterSheetDraftFeature[];
};

/** Allowed draft list keys for proficiency and language tags. */
export type ProficiencyDraftKey =
    'armorProficiencies' |
    'weaponProficiencies' |
    'toolProficiencies' |
    'languages';

/** Editable free-text trait fields. */
export type CharacterSheetDraftTraitTextField =
    'personality' |
    'ideals' |
    'bonds' |
    'flaws';

/** Editable currency keys. */
export type CharacterSheetDraftCurrencyKey = keyof CharacterSheetDraftCurrency;

/** Editable weapon text fields. */
export type CharacterSheetDraftWeaponField = 'name' | 'attackBonus' | 'damage';

/**
 * Creates a stable local-only id for a draft row.
 */
export function createDraftEntityId(prefix: string): string {
    return `draft-${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Returns true when a local row id belongs only to the draft.
 */
function isDraftEntityId(id: string): boolean {
    return id.startsWith('draft-');
}

/**
 * Removes draft-only ids before sending rows to the API.
 */
function persistedEntityId(id: string): string | undefined {
    if (isDraftEntityId(id)) return undefined;
    return id;
}

/**
 * Builds editable local draft state from one loaded character.
 */
export function createCharacterSheetDraft(character: CharacterSheetDetail): CharacterSheetDraft {
    return {
        hp: {
            current: character.stats?.hp.current ?? 0,
            max: character.stats?.hp.max ?? 0,
            temp: character.stats?.hp.temp ?? 0,
        },
        ac: character.ac,
        speed: character.speed,
        initiative: character.initiative,
        abilityScores: {
            strength: character.stats?.abilityScores.strength ?? 10,
            dexterity: character.stats?.abilityScores.dexterity ?? 10,
            constitution: character.stats?.abilityScores.constitution ?? 10,
            intelligence: character.stats?.abilityScores.intelligence ?? 10,
            wisdom: character.stats?.abilityScores.wisdom ?? 10,
            charisma: character.stats?.abilityScores.charisma ?? 10,
        },
        currency: {
            cp: character.stats?.currency.cp ?? 0,
            sp: character.stats?.currency.sp ?? 0,
            ep: character.stats?.currency.ep ?? 0,
            gp: character.stats?.currency.gp ?? 0,
            pp: character.stats?.currency.pp ?? 0,
        },
        traits: {
            personality: character.stats?.traits.personality ?? '',
            ideals: character.stats?.traits.ideals ?? '',
            bonds: character.stats?.traits.bonds ?? '',
            flaws: character.stats?.traits.flaws ?? '',
            armorProficiencies: character.stats?.traits.armorProficiencies ?? [],
            weaponProficiencies: character.stats?.traits.weaponProficiencies ?? [],
            toolProficiencies: character.stats?.traits.toolProficiencies ?? [],
            languages: character.stats?.traits.languages ?? [],
        },
        conditions: [...character.conditions],
        weapons: character.weapons.map((weapon) => ({
            id: weapon.id,
            name: weapon.name,
            attackBonus: weapon.attackBonus,
            damage: weapon.damage,
            type: weapon.type,
        })),
        inventory: character.inventory.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            weight: item.weight ?? null,
            description: item.description ?? null,
            equipped: item.equipped,
            magical: item.magical,
        })),
        features: character.features.map((feature) => ({
            id: feature.id,
            name: feature.name,
            source: feature.source,
            description: feature.description,
            recharge: feature.recharge ?? null,
            usesMax: feature.usesMax ?? null,
            usesRemaining: feature.usesRemaining ?? null,
        })),
    };
}

/**
 * Creates a new blank weapon row for edit mode.
 */
export function createBlankDraftWeapon(): CharacterSheetDraftWeapon {
    return {
        id: createDraftEntityId('weapon'),
        name: '',
        attackBonus: '',
        damage: '',
        type: 'melee',
    };
}

/**
 * Creates a new blank inventory row for edit mode.
 */
export function createBlankDraftInventoryItem(): CharacterSheetDraftInventoryItem {
    return {
        id: createDraftEntityId('item'),
        name: '',
        quantity: 1,
        weight: null,
        description: '',
        equipped: false,
        magical: false,
    };
}

/**
 * Creates a new blank feature row for edit mode.
 */
export function createBlankDraftFeature(source: string): CharacterSheetDraftFeature {
    return {
        id: createDraftEntityId('feature'),
        name: '',
        source,
        description: '',
        recharge: null,
        usesMax: null,
        usesRemaining: null,
    };
}

/**
 * Maps local draft state to the atomic save mutation input.
 */
export function mapCharacterSheetDraftToSaveInput(
    draft: CharacterSheetDraft,
    spellcastingAbility: string | null | undefined,
    proficiencyBonus: number,
): SaveCharacterSheetInput {
    const { spellAttackBonus, spellSaveDC } = deriveSpellcastingStats(
        spellcastingAbility,
        draft.abilityScores,
        proficiencyBonus,
    );

    return {
        ac: draft.ac,
        speed: draft.speed,
        initiative: draft.initiative,
        conditions: draft.conditions,
        hp: draft.hp,
        abilityScores: draft.abilityScores,
        currency: draft.currency,
        traits: draft.traits,
        weapons: draft.weapons.map((weapon) => ({
            id: persistedEntityId(weapon.id),
            name: weapon.name,
            attackBonus: weapon.attackBonus,
            damage: weapon.damage,
            type: weapon.type,
        })),
        inventory: draft.inventory.map((item) => ({
            id: persistedEntityId(item.id),
            name: item.name,
            quantity: item.quantity,
            weight: item.weight ?? null,
            description: item.description ?? null,
            equipped: item.equipped,
            magical: item.magical,
        })),
        features: draft.features.map((feature) => ({
            id: persistedEntityId(feature.id),
            name: feature.name,
            source: feature.source,
            description: feature.description,
            recharge: feature.recharge ?? null,
            usesMax: feature.usesMax ?? null,
            usesRemaining: feature.usesRemaining ?? null,
        })),
        spellSaveDC,
        spellAttackBonus,
    };
}
