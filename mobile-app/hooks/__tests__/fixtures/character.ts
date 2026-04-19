import type { CharacterSheetDetail } from '../../useCharacterSheetDraft';
import { ProficiencyLevel } from '@/types/generated_graphql_types';

/**
 * Minimal character fixture that satisfies the CharacterSheetDetail type.
 * Suitable for unit tests of hooks that need a character object.
 */
export const BASE_CHARACTER_FIXTURE: CharacterSheetDetail = {
    __typename: 'Character',
    id: 'char-1',
    name: 'Vaelindra',
    race: 'High Elf',
    level: 12,
    alignment: 'Chaotic Good',
    background: 'Sage',
    proficiencyBonus: 4,
    inspiration: false,
    ac: 17,
    speed: 35,
    initiative: 3,
    classes: [],
    spellcastingProfiles: [],
    conditions: [],
    features: [],
    weapons: [],
    inventory: [],
    spellSlots: [],
    spellbook: [],
    stats: {
        __typename: 'CharacterStats',
        id: 'stats-1',
        abilityScores: {
            __typename: 'AbilityScores',
            strength: 8,
            dexterity: 16,
            constitution: 14,
            intelligence: 20,
            wisdom: 13,
            charisma: 11,
        },
        hp: {
            __typename: 'HP',
            current: 54,
            max: 76,
            temp: 2,
        },
        deathSaves: {
            __typename: 'DeathSaves',
            successes: 1,
            failures: 0,
        },
        hitDicePools: [],
        traits: {
            __typename: 'Traits',
            personality: '',
            ideals: '',
            bonds: '',
            flaws: '',
            armorProficiencies: [],
            weaponProficiencies: [],
            toolProficiencies: [],
            languages: [],
        },
        savingThrowProficiencies: [],
        skillProficiencies: {
            __typename: 'SkillProficiencies',
            acrobatics: ProficiencyLevel.None,
            animalHandling: ProficiencyLevel.None,
            arcana: ProficiencyLevel.None,
            athletics: ProficiencyLevel.None,
            deception: ProficiencyLevel.None,
            history: ProficiencyLevel.None,
            insight: ProficiencyLevel.None,
            intimidation: ProficiencyLevel.None,
            investigation: ProficiencyLevel.None,
            medicine: ProficiencyLevel.None,
            nature: ProficiencyLevel.None,
            perception: ProficiencyLevel.None,
            performance: ProficiencyLevel.None,
            persuasion: ProficiencyLevel.None,
            religion: ProficiencyLevel.None,
            sleightOfHand: ProficiencyLevel.None,
            stealth: ProficiencyLevel.None,
            survival: ProficiencyLevel.None,
        },
        currency: {
            __typename: 'Currency',
            cp: 0,
            sp: 14,
            ep: 0,
            gp: 847,
            pp: 3,
        },
    },
};

/**
 * Creates a character fixture with custom fields.
 */
export function createCharacterFixture(
    overrides: Partial<CharacterSheetDetail> & { id: string; name?: string },
): CharacterSheetDetail {
    return {
        ...BASE_CHARACTER_FIXTURE,
        ...overrides,
        stats: overrides.stats ?? BASE_CHARACTER_FIXTURE.stats,
    };
}

/**
 * Pre‑configured second character for navigation tests.
 */
export const SECOND_CHARACTER_FIXTURE = createCharacterFixture({
    id: 'char-2',
    name: 'Boromir',
});