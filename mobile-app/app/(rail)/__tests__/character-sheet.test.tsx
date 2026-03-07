import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { ProficiencyLevel } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    GET_CURRENT_USER_CHARACTERS,
    PREPARE_SPELL,
    TOGGLE_INSPIRATION,
    TOGGLE_SPELL_SLOT,
    UNPREPARE_SPELL,
    UPDATE_ABILITY_SCORES,
    UPDATE_CHARACTER,
    UPDATE_CURRENCY,
    UPDATE_DEATH_SAVES,
    UPDATE_HP,
    UPDATE_SKILL_PROFICIENCIES,
    UPDATE_TRAITS,
} from '@/graphql/characterSheet.operations';
import CharacterByIdScreen from '../character/[id]';

const mockUseLocalSearchParams = jest.fn(() => ({ id: 'char-1' }));

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    Redirect: ({ href }: { href: string }) => null,
    Stack: () => null,
}));

jest.mock('@/components/navigation/RailScreenShell', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => children,
}));

const MOCK_CHARACTER = {
    __typename: 'Character',
    id: 'char-1',
    name: 'Vaelindra',
    race: 'High Elf',
    class: 'Wizard',
    subclass: 'School of Evocation',
    level: 12,
    alignment: 'Chaotic Good',
    proficiencyBonus: 4,
    inspiration: false,
    ac: 17,
    speed: 35,
    initiative: 3,
    spellcastingAbility: 'intelligence',
    spellSaveDC: 17,
    spellAttackBonus: 9,
    conditions: [] as string[],
    features: [
        {
            __typename: 'CharacterFeature',
            id: 'feature-1',
            name: 'Arcane Recovery',
            source: 'Wizard 1',
            description: 'Recover spell slots on a long rest.',
            usesMax: 1,
            usesRemaining: 1,
            recharge: 'long',
        },
        {
            __typename: 'CharacterFeature',
            id: 'feature-2',
            name: 'Darkvision',
            source: 'High Elf',
            description: 'See in dim light and darkness within 60 feet.',
            usesMax: null,
            usesRemaining: null,
            recharge: null,
        },
        {
            __typename: 'CharacterFeature',
            id: 'feature-3',
            name: 'War Caster',
            source: 'Feat',
            description: 'Advantage on concentration checks.',
            usesMax: null,
            usesRemaining: null,
            recharge: null,
        },
    ],
    attacks: [
        {
            __typename: 'Attack',
            id: 'attack-1',
            name: 'Dagger',
            attackBonus: '+7',
            damage: '1d4+3 piercing',
            type: 'melee',
        },
        {
            __typename: 'Attack',
            id: 'attack-2',
            name: 'Staff of Power',
            attackBonus: '+9',
            damage: '1d6+5 bludgeoning',
            type: 'melee',
        },
        {
            __typename: 'Attack',
            id: 'attack-3',
            name: 'Spell Attack',
            attackBonus: '+10',
            damage: 'by spell',
            type: 'spell',
        },
    ],
    weapons: [
        {
            __typename: 'Attack',
            id: 'attack-1',
            name: 'Dagger',
            attackBonus: '+7',
            damage: '1d4+3 piercing',
            type: 'melee',
        },
        {
            __typename: 'Attack',
            id: 'attack-2',
            name: 'Staff of Power',
            attackBonus: '+9',
            damage: '1d6+5 bludgeoning',
            type: 'melee',
        },
        {
            __typename: 'Attack',
            id: 'attack-3',
            name: 'Spell Attack',
            attackBonus: '+10',
            damage: 'by spell',
            type: 'spell',
        },
    ],
    inventory: [
        {
            __typename: 'InventoryItem',
            id: 'item-1',
            name: 'Staff of Power',
            quantity: 1,
            weight: 4,
            description: '+2 weapon, spell attack & DC bonus',
            equipped: true,
            magical: true,
        },
        {
            __typename: 'InventoryItem',
            id: 'item-2',
            name: 'Ring of Protection',
            quantity: 1,
            weight: null,
            description: '+1 AC and saving throws',
            equipped: true,
            magical: true,
        },
        {
            __typename: 'InventoryItem',
            id: 'item-3',
            name: 'Spellbook',
            quantity: 1,
            weight: 3,
            description: 'Contains 26 spells',
            equipped: false,
            magical: false,
        },
        {
            __typename: 'InventoryItem',
            id: 'item-4',
            name: 'Potion of Greater Healing',
            quantity: 3,
            weight: 0.5,
            description: 'Restores 4d4+4 HP',
            equipped: false,
            magical: true,
        },
    ],
    spellSlots: [
        {
            __typename: 'SpellSlot',
            id: 'slot-1',
            level: 1,
            total: 4,
            used: 1,
        },
        {
            __typename: 'SpellSlot',
            id: 'slot-2',
            level: 2,
            total: 3,
            used: 0,
        },
        {
            __typename: 'SpellSlot',
            id: 'slot-3',
            level: 3,
            total: 3,
            used: 2,
        },
    ],
    spellbook: [
        {
            __typename: 'CharacterSpell',
            prepared: true,
            spell: {
                __typename: 'Spell',
                id: 'spell-fireball',
                name: 'Fireball',
                level: 3,
                schoolIndex: 'evocation',
                castingTime: '1 action',
                range: '150 feet',
                concentration: false,
                ritual: false,
            },
        },
        {
            __typename: 'CharacterSpell',
            prepared: true,
            spell: {
                __typename: 'Spell',
                id: 'spell-detect-magic',
                name: 'Detect Magic',
                level: 1,
                schoolIndex: 'divination',
                castingTime: '1 action',
                range: 'Self',
                concentration: true,
                ritual: true,
            },
        },
        {
            __typename: 'CharacterSpell',
            prepared: false,
            spell: {
                __typename: 'Spell',
                id: 'spell-bigbys-hand',
                name: "Bigby's Hand",
                level: 5,
                schoolIndex: 'evocation',
                castingTime: '1 action',
                range: '120 feet',
                concentration: true,
                ritual: false,
            },
        },
    ],
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
        hitDice: {
            __typename: 'HitDice',
            total: 12,
            remaining: 12,
            die: 'd6',
        },
        traits: {
            __typename: 'Traits',
            personality: 'Always collecting obscure magical lore.',
            ideals: 'Knowledge should be preserved.',
            bonds: 'My spellbook is my life.',
            flaws: 'I underestimate danger when magic is involved.',
            armorProficiencies: [],
            weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs'],
            toolProficiencies: [],
            languages: ['Common', 'Elvish', 'Draconic'],
        },
        savingThrowProficiencies: ['intelligence', 'wisdom'],
        skillProficiencies: {
            __typename: 'SkillProficiencies',
            acrobatics: ProficiencyLevel.None,
            animalHandling: ProficiencyLevel.None,
            arcana: ProficiencyLevel.Expert,
            athletics: ProficiencyLevel.None,
            deception: ProficiencyLevel.None,
            history: ProficiencyLevel.Expert,
            insight: ProficiencyLevel.Proficient,
            intimidation: ProficiencyLevel.None,
            investigation: ProficiencyLevel.Expert,
            medicine: ProficiencyLevel.None,
            nature: ProficiencyLevel.Proficient,
            perception: ProficiencyLevel.Proficient,
            performance: ProficiencyLevel.None,
            persuasion: ProficiencyLevel.None,
            religion: ProficiencyLevel.Proficient,
            sleightOfHand: ProficiencyLevel.None,
            stealth: ProficiencyLevel.Proficient,
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

const SAVE_CORE_CHARACTER_MOCKS: MockLink.MockedResponse[] = [
    {
        request: {
            query: UPDATE_CHARACTER,
            variables: {
                id: 'char-1',
                input: {
                    ac: 17,
                    speed: 35,
                    initiative: 3,
                    conditions: [],
                },
            },
        },
        result: {
            data: {
                updateCharacter: {
                    __typename: 'Character',
                    id: 'char-1',
                    ac: 17,
                    speed: 35,
                    initiative: 3,
                    conditions: [],
                },
            },
        },
    },
    {
        request: {
            query: UPDATE_HP,
            variables: {
                characterId: 'char-1',
                input: {
                    current: 54,
                    max: 76,
                    temp: 2,
                },
            },
        },
        result: {
            data: {
                updateHP: {
                    __typename: 'CharacterStats',
                    id: 'stats-1',
                    hp: {
                        __typename: 'HP',
                        current: 54,
                        max: 76,
                        temp: 2,
                    },
                },
            },
        },
    },
    {
        request: {
            query: UPDATE_ABILITY_SCORES,
            variables: {
                characterId: 'char-1',
                input: {
                    strength: 8,
                    dexterity: 16,
                    constitution: 14,
                    intelligence: 20,
                    wisdom: 13,
                    charisma: 11,
                },
            },
        },
        result: {
            data: {
                updateAbilityScores: {
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
                },
            },
        },
    },
    {
        request: {
            query: UPDATE_CURRENCY,
            variables: {
                characterId: 'char-1',
                input: {
                    cp: 0,
                    sp: 14,
                    ep: 0,
                    gp: 847,
                    pp: 3,
                },
            },
        },
        result: {
            data: {
                updateCurrency: {
                    __typename: 'CharacterStats',
                    id: 'stats-1',
                    currency: {
                        __typename: 'Currency',
                        cp: 0,
                        sp: 14,
                        ep: 0,
                        gp: 847,
                        pp: 3,
                    },
                },
            },
        },
    },
    {
        request: {
            query: UPDATE_TRAITS,
            variables: {
                characterId: 'char-1',
                input: {
                    personality: 'Always collecting obscure magical lore.',
                    ideals: 'Knowledge should be preserved.',
                    bonds: 'My spellbook is my life.',
                    flaws: 'I underestimate danger when magic is involved.',
                    armorProficiencies: [],
                    weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs'],
                    toolProficiencies: [],
                    languages: ['Common', 'Elvish', 'Draconic'],
                },
            },
        },
        result: {
            data: {
                updateTraits: {
                    __typename: 'CharacterStats',
                    id: 'stats-1',
                    traits: {
                        __typename: 'Traits',
                        personality: 'Always collecting obscure magical lore.',
                        ideals: 'Knowledge should be preserved.',
                        bonds: 'My spellbook is my life.',
                        flaws: 'I underestimate danger when magic is involved.',
                        armorProficiencies: [],
                        weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs'],
                        toolProficiencies: [],
                        languages: ['Common', 'Elvish', 'Draconic'],
                    },
                },
            },
        },
    },
    {
        request: { query: GET_CURRENT_USER_CHARACTERS },
        result: {
            data: {
                currentUserCharacters: [MOCK_CHARACTER],
            },
        },
    },
];

const { __typename: _skillTypeName, ...INITIAL_SKILL_INPUT } = MOCK_CHARACTER.stats.skillProficiencies;

const CHARACTERS_MOCK: MockLink.MockedResponse = {
    request: { query: GET_CURRENT_USER_CHARACTERS },
    result: {
        data: {
            currentUserCharacters: [MOCK_CHARACTER],
        },
    },
};

const EMPTY_MOCK: MockLink.MockedResponse = {
    request: { query: GET_CURRENT_USER_CHARACTERS },
    result: {
        data: {
            currentUserCharacters: [],
        },
    },
};

const ERROR_MOCK: MockLink.MockedResponse = {
    request: { query: GET_CURRENT_USER_CHARACTERS },
    error: new Error('Network error'),
};

const TOGGLE_MOCK: MockLink.MockedResponse = {
    request: {
        query: TOGGLE_INSPIRATION,
        variables: { characterId: 'char-1' },
    },
    result: {
        data: {
            toggleInspiration: {
                __typename: 'Character',
                id: 'char-1',
                inspiration: true,
            },
        },
    },
};

const UPDATE_DEATH_SAVES_MOCK: MockLink.MockedResponse = {
    request: {
        query: UPDATE_DEATH_SAVES,
        variables: {
            characterId: 'char-1',
            input: { successes: 2, failures: 0 },
        },
    },
    result: {
        data: {
            updateDeathSaves: {
                __typename: 'CharacterStats',
                id: 'stats-1',
                deathSaves: {
                    __typename: 'DeathSaves',
                    successes: 2,
                    failures: 0,
                },
            },
        },
    },
};

const UPDATE_SKILLS_MOCK: MockLink.MockedResponse = {
    request: {
        query: UPDATE_SKILL_PROFICIENCIES,
        variables: {
            characterId: 'char-1',
            input: {
                ...INITIAL_SKILL_INPUT,
                perception: ProficiencyLevel.Expert,
            },
        },
    },
    result: {
        data: {
            updateSkillProficiencies: {
                __typename: 'CharacterStats',
                id: 'stats-1',
                skillProficiencies: {
                    ...MOCK_CHARACTER.stats.skillProficiencies,
                    perception: ProficiencyLevel.Expert,
                },
            },
        },
    },
};

const TOGGLE_SLOT_LEVEL_1_MOCK: MockLink.MockedResponse = {
    request: {
        query: TOGGLE_SPELL_SLOT,
        variables: {
            characterId: 'char-1',
            level: 1,
        },
    },
    result: {
        data: {
            toggleSpellSlot: {
                __typename: 'SpellSlot',
                id: 'slot-1',
                level: 1,
                total: 4,
                used: 2,
            },
        },
    },
};

const UNPREPARE_FIREBALL_MOCK: MockLink.MockedResponse = {
    request: {
        query: UNPREPARE_SPELL,
        variables: {
            characterId: 'char-1',
            spellId: 'spell-fireball',
        },
    },
    result: {
        data: {
            unprepareSpell: {
                __typename: 'CharacterSpell',
                prepared: false,
                spell: {
                    __typename: 'Spell',
                    id: 'spell-fireball',
                },
            },
        },
    },
};

const PREPARE_BIGBYS_HAND_MOCK: MockLink.MockedResponse = {
    request: {
        query: PREPARE_SPELL,
        variables: {
            characterId: 'char-1',
            spellId: 'spell-bigbys-hand',
        },
    },
    result: {
        data: {
            prepareSpell: {
                __typename: 'CharacterSpell',
                prepared: true,
                spell: {
                    __typename: 'Spell',
                    id: 'spell-bigbys-hand',
                },
            },
        },
    },
};

function renderScreen(mocks: MockLink.MockedResponse[] = [CHARACTERS_MOCK]) {
    return render(
        <MockedProvider mocks={mocks}>
                <PaperProvider>
                    <CharacterByIdScreen />
                </PaperProvider>
        </MockedProvider>
    );
}

async function pressAndFlush(target: Parameters<typeof fireEvent.press>[0]) {
    await act(async () => {
        fireEvent.press(target);
        await Promise.resolve();
    });
}

async function flushMicrotasks() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe('CharacterByIdScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await flushMicrotasks();
    });

    it('shows a loading indicator initially', () => {
        renderScreen();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('renders character name after loading', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Vaelindra')).toBeTruthy();
        });
    });

    it('renders the subtitle with level/class/race', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText(/Level 12 Wizard/)).toBeTruthy();
        });
    });

    it('renders vitals (HP, AC, Speed)', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Hit Points')).toBeTruthy();
        });
        expect(screen.getByText('Armour Class')).toBeTruthy();
        expect(screen.getByText('Speed')).toBeTruthy();
    });

    it('renders abilities and skills section', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Abilities & Skills')).toBeTruthy();
        });
    });

    it('renders saving throws rows', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getAllByText('Saving Throw').length).toBe(6);
        });
    });

    it('renders skill rows', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Arcana')).toBeTruthy();
        });
    });

    it('renders death saves section', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Death Saves')).toBeTruthy();
        });
    });

    it('shows empty state when no characters exist', async () => {
        renderScreen([EMPTY_MOCK]);
        await waitFor(() => {
            expect(screen.getByText('No characters yet.')).toBeTruthy();
        });
    });

    it('shows error state on network error', async () => {
        renderScreen([ERROR_MOCK]);
        await waitFor(() => {
            expect(screen.getByText('Failed to load character.')).toBeTruthy();
        });
    });

    it('renders the inspiration toggle button', async () => {
        renderScreen([CHARACTERS_MOCK, TOGGLE_MOCK]);
        await waitFor(() => {
            expect(screen.getByLabelText('Toggle inspiration')).toBeTruthy();
        });
    });

    it('optimistically updates inspiration label when tapped', async () => {
        renderScreen([CHARACTERS_MOCK, TOGGLE_MOCK]);
        await waitFor(() => {
            expect(screen.getByLabelText('Toggle inspiration')).toBeTruthy();
        });

        await pressAndFlush(screen.getByLabelText('Toggle inspiration'));
        await waitFor(() => {
            expect(screen.getByText('Inspired')).toBeTruthy();
        });
    });

    it('renders death save circles', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByLabelText('Death save success 1')).toBeTruthy();
        });
        expect(screen.getByLabelText('Death save failure 1')).toBeTruthy();
    });

    it('optimistically fills success circles when toggled', async () => {
        renderScreen([CHARACTERS_MOCK, UPDATE_DEATH_SAVES_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Death save success 2')).toBeTruthy();
        });

        const secondCircleBefore = screen.getByTestId('death-save-success-circle-2');
        expect(secondCircleBefore).toHaveStyle({ borderColor: fantasyTokens.colors.divider });

        await pressAndFlush(screen.getByLabelText('Death save success 2'));

        await waitFor(() => {
            const secondCircleAfter = screen.getByTestId('death-save-success-circle-2');
            expect(secondCircleAfter).toHaveStyle({
                backgroundColor: fantasyTokens.colors.greenDark,
                borderColor: fantasyTokens.colors.greenDark,
            });
        });
    });

    it('renders temp HP when present', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('+2 temp')).toBeTruthy();
        });
    });

    it('renders "No conditions" when conditions array is empty', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('No conditions')).toBeTruthy();
        });
    });

    it('renders the tab bar with Core active', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Core')).toBeTruthy();
        });
        expect(screen.getByText('Skills')).toBeTruthy();
        expect(screen.getByText('Spells')).toBeTruthy();
        expect(screen.getByText('Gear')).toBeTruthy();
        expect(screen.getByText('Features')).toBeTruthy();
    });

    it('shows edit controls and banner while editing', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Enable character sheet edit mode'));

        await waitFor(() => {
            expect(screen.getByLabelText('Cancel character sheet edits')).toBeTruthy();
        });

        expect(screen.getByLabelText('Save character sheet edits')).toBeTruthy();
        expect(screen.getByText('Editing — tap any highlighted field to change it')).toBeTruthy();
    });

    it('shows saved snackbar after pressing Done', async () => {
        renderScreen([CHARACTERS_MOCK, ...SAVE_CORE_CHARACTER_MOCKS]);

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Enable character sheet edit mode'));
        await waitFor(() => {
            expect(screen.getByLabelText('Save character sheet edits')).toBeTruthy();
        });

        await pressAndFlush(screen.getByLabelText('Save character sheet edits'));

        await waitFor(() => {
            expect(screen.getByText('Saved')).toBeTruthy();
        });
    });

    it('preserves edit mode and shows error snackbar when save fails', async () => {
        const failingMock: MockLink.MockedResponse = {
            request: {
                query: UPDATE_CHARACTER,
                variables: {
                    id: 'char-1',
                    input: {
                        ac: 17,
                        speed: 35,
                        initiative: 3,
                        conditions: [],
                    },
                },
            },
            error: new Error('Network error'),
        };

        renderScreen([CHARACTERS_MOCK, failingMock]);

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Enable character sheet edit mode'));
        await waitFor(() => {
            expect(screen.getByLabelText('Save character sheet edits')).toBeTruthy();
        });

        await pressAndFlush(screen.getByLabelText('Save character sheet edits'));

        await waitFor(() => {
            expect(screen.getByText(/Failed to save/)).toBeTruthy();
        });

        expect(screen.queryByText('Saved')).toBeNull();
        expect(screen.getByLabelText('Cancel character sheet edits')).toBeTruthy();
        expect(screen.getByLabelText('Save character sheet edits')).toBeTruthy();
    });

    it('discards gear draft changes on Cancel', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Enable character sheet edit mode'));

        await waitFor(() => {
            expect(screen.getByLabelText('Open Gear tab')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Open Gear tab'));

        await waitFor(() => {
            expect(screen.getByTestId('currency-gp-amount')).toBeTruthy();
        });

        fireEvent.changeText(screen.getByTestId('currency-gp-amount'), '900');
        fireEvent.press(screen.getByLabelText('Add weapons'));
        fireEvent.press(screen.getByLabelText('Add backpack item'));

        await waitFor(() => {
            expect(screen.getByDisplayValue('900')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Cancel character sheet edits'));

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Open Gear tab'));

        await waitFor(() => {
            expect(screen.getByTestId('currency-gp-amount')).toHaveTextContent('847');
        });

        expect(screen.queryByDisplayValue('900')).toBeNull();
    });

    it('switches to the Skills tab', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Skills tab')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Open Skills tab'));

        await waitFor(() => {
            expect(screen.getByText('Passive Senses')).toBeTruthy();
        });
        expect(screen.queryByText('Abilities & Skills')).toBeNull();
    });

    it('cycles skill proficiency and recalculates passive score', async () => {
        renderScreen([CHARACTERS_MOCK, UPDATE_SKILLS_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Open Skills tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Skills tab'));

        await waitFor(() => {
            expect(screen.getByTestId('passive-perception-value')).toHaveTextContent('15');
        });

        fireEvent.changeText(screen.getByLabelText('Search skills'), 'Perception');

        await waitFor(() => {
            expect(screen.getByLabelText('Cycle proficiency for Perception')).toBeTruthy();
        });

        await pressAndFlush(screen.getByLabelText('Cycle proficiency for Perception'));

        await waitFor(() => {
            expect(screen.getByTestId('passive-perception-value')).toHaveTextContent('19');
        });
    });

    it('filters skills by search text', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Skills tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Skills tab'));

        await waitFor(() => {
            expect(screen.getByLabelText('Search skills')).toBeTruthy();
        });
        fireEvent.changeText(screen.getByLabelText('Search skills'), 'Arcana');

        await waitFor(() => {
            expect(screen.getByText('Arcana')).toBeTruthy();
        });
        expect(screen.queryByText('Athletics')).toBeNull();
    });

    it('switches to the Spells tab and shows spellbook content', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Spells tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Spells tab'));

        await waitFor(() => {
            expect(screen.getByText('Spellcasting')).toBeTruthy();
        });
        expect(screen.getByText('Fireball')).toBeTruthy();
        expect(screen.getByText('Detect Magic')).toBeTruthy();
        expect(screen.getByText('+9')).toBeTruthy();
    });

    it('switches to the Gear tab and shows currency, attacks, and inventory', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Gear tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Gear tab'));

        await waitFor(() => {
            expect(screen.getByText('Currency')).toBeTruthy();
        });

        expect(screen.getByTestId('currency-gp-amount')).toHaveTextContent('847');
        expect(screen.getByText('Weapons')).toBeTruthy();
        expect(screen.getByText('Dagger')).toBeTruthy();
        expect(screen.getByTestId('attack-stats-attack-1')).toHaveStyle({ alignItems: 'flex-end' });
        expect(screen.getByText('Backpack')).toBeTruthy();
        expect(screen.getByText('+ Add Item')).toBeTruthy();
        expect(screen.queryByText('Encumbrance')).toBeNull();
    });

    it('switches to the Features tab and shows feature sections', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Features tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Features tab'));

        await waitFor(() => {
            expect(screen.getByText('Class Features')).toBeTruthy();
        });

        expect(screen.getByText('Arcane Recovery')).toBeTruthy();
        expect(screen.getByText('Racial Traits')).toBeTruthy();
        expect(screen.getByText('Darkvision')).toBeTruthy();
        expect(screen.getByText('Feats')).toBeTruthy();
        expect(screen.getByText('War Caster')).toBeTruthy();
        expect(screen.getByText('Personality & Background')).toBeTruthy();
        expect(screen.getByText('Proficiencies & Languages')).toBeTruthy();
        expect(screen.getByText('Common')).toBeTruthy();
    });

    it('updates spell slot count optimistically when a slot pip is pressed', async () => {
        renderScreen([CHARACTERS_MOCK, TOGGLE_SLOT_LEVEL_1_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Open Spells tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Spells tab'));

        await waitFor(() => {
            expect(screen.getByText('3 / 4')).toBeTruthy();
        });

        await pressAndFlush(screen.getByTestId('spell-slot-pip-1-1'));

        await waitFor(() => {
            expect(screen.getByText('2 / 4')).toBeTruthy();
        });
    });

    it('toggles a prepared spell to unprepared', async () => {
        renderScreen([CHARACTERS_MOCK, UNPREPARE_FIREBALL_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Open Spells tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Spells tab'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-fireball')).toHaveStyle({
                backgroundColor: fantasyTokens.colors.crimson,
            });
        });

        await pressAndFlush(screen.getByTestId('character-spell-prepared-spell-fireball'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-fireball')).toHaveStyle({
                backgroundColor: 'transparent',
                borderWidth: 1,
            });
        });
    });

    it('toggles an unprepared spell to prepared', async () => {
        renderScreen([CHARACTERS_MOCK, PREPARE_BIGBYS_HAND_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Open Spells tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Spells tab'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-bigbys-hand')).toHaveStyle({
                backgroundColor: 'transparent',
            });
        });

        await pressAndFlush(screen.getByTestId('character-spell-prepared-spell-bigbys-hand'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-bigbys-hand')).toHaveStyle({
                backgroundColor: fantasyTokens.colors.crimson,
            });
        });
    });
});
