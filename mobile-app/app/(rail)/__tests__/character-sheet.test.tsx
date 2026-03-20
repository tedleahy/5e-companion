import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { fantasyTokens } from '@/theme/fantasyTheme';
import CharacterByIdScreen from '../character/[id]';
import { SEARCH_SPELLS_FOR_SHEET } from '@/components/character-sheet/spells/AddSpellSheet';
import {
    CHARACTERS_MOCK,
    EMPTY_MOCK,
    ERROR_MOCK,
    PREPARE_BIGBYS_HAND_MOCK,
    SAVE_CORE_CHARACTER_MOCKS,
    TOGGLE_MOCK,
    TOGGLE_SLOT_LEVEL_1_MOCK,
    UNPREPARE_FIREBALL_MOCK,
    UPDATE_DEATH_SAVES_MOCK,
    UPDATE_SAVING_THROW_PROFICIENCIES_MOCK,
    UPDATE_SKILLS_MOCK,
} from './mocks/character-sheet.mocks';
import { SAVE_CHARACTER_SHEET } from '@/graphql/characterSheet.operations';

const ADD_SPELL_LIST_MOCK: MockLink.MockedResponse = {
    request: {
        query: SEARCH_SPELLS_FOR_SHEET,
        variables: {
            filter: {
                classes: ['wizard'],
            },
            pagination: {
                limit: 500,
                offset: 0,
            },
        },
    },
    result: {
        data: {
            spells: [],
        },
    },
};

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

    it('renders abilities and skills section on the Abilities tab', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByLabelText('Open Abilities tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Abilities tab'));

        await waitFor(() => {
            expect(screen.getByText('Abilities & Skills')).toBeTruthy();
        });
    });

    it('renders saving throw rows on the Abilities tab', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByLabelText('Open Abilities tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Abilities tab'));

        await waitFor(() => {
            expect(screen.getAllByText('Saving Throw').length).toBe(6);
        });
    });

    it('renders skill rows on the Abilities tab', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByLabelText('Open Abilities tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Abilities tab'));

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

    it('renders passive senses section on the core tab', async () => {
        renderScreen();
        await waitFor(() => {
            expect(screen.getByText('Passive Senses')).toBeTruthy();
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
        expect(screen.getByText('Abilities')).toBeTruthy();
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

    it('preserves edit mode and shows error snackbar when save fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        const failingMock: MockLink.MockedResponse = {
            request: {
                query: SAVE_CHARACTER_SHEET,
                variables: {
                    characterId: 'char-1',
                    input: {
                        ac: 17,
                        speed: 35,
                        initiative: 3,
                        conditions: [],
                        hp: {
                            current: 54,
                            max: 76,
                            temp: 2,
                        },
                        abilityScores: {
                            strength: 8,
                            dexterity: 16,
                            constitution: 14,
                            intelligence: 20,
                            wisdom: 13,
                            charisma: 11,
                        },
                        currency: {
                            cp: 0,
                            sp: 14,
                            ep: 0,
                            gp: 847,
                            pp: 3,
                        },
                        traits: {
                            personality: 'Always collecting obscure magical lore.',
                            ideals: 'Knowledge should be preserved.',
                            bonds: 'My spellbook is my life.',
                            flaws: 'I underestimate danger when magic is involved.',
                            armorProficiencies: [],
                            weaponProficiencies: ['Daggers', 'Darts', 'Slings', 'Quarterstaffs'],
                            toolProficiencies: [],
                            languages: ['Common', 'Elvish', 'Draconic'],
                        },
                        weapons: [
                            {
                                id: 'attack-1',
                                name: 'Dagger',
                                attackBonus: '+7',
                                damage: '1d4+3 piercing',
                                type: 'melee',
                            },
                            {
                                id: 'attack-2',
                                name: 'Staff of Power',
                                attackBonus: '+9',
                                damage: '1d6+5 bludgeoning',
                                type: 'melee',
                            },
                            {
                                id: 'attack-3',
                                name: 'Spell Attack',
                                attackBonus: '+10',
                                damage: 'by spell',
                                type: 'spell',
                            },
                        ],
                        inventory: [
                            {
                                id: 'item-1',
                                name: 'Staff of Power',
                                quantity: 1,
                                weight: 4,
                                description: '+2 weapon, spell attack & DC bonus',
                                equipped: true,
                                magical: true,
                            },
                            {
                                id: 'item-2',
                                name: 'Ring of Protection',
                                quantity: 1,
                                weight: null,
                                description: '+1 AC and saving throws',
                                equipped: true,
                                magical: true,
                            },
                            {
                                id: 'item-3',
                                name: 'Spellbook',
                                quantity: 1,
                                weight: 3,
                                description: 'Contains 26 spells',
                                equipped: false,
                                magical: false,
                            },
                            {
                                id: 'item-4',
                                name: 'Potion of Greater Healing',
                                quantity: 3,
                                weight: 0.5,
                                description: 'Restores 4d4+4 HP',
                                equipped: false,
                                magical: true,
                            },
                        ],
                        features: [
                            {
                                id: 'feature-1',
                                name: 'Arcane Recovery',
                                source: 'Wizard 1',
                                description: 'Recover spell slots on a long rest.',
                                usesMax: 1,
                                usesRemaining: 1,
                                recharge: 'long',
                            },
                            {
                                id: 'feature-2',
                                name: 'Darkvision',
                                source: 'High Elf',
                                description: 'See in dim light and darkness within 60 feet.',
                                usesMax: null,
                                usesRemaining: null,
                                recharge: null,
                            },
                            {
                                id: 'feature-3',
                                name: 'War Caster',
                                source: 'Feat',
                                description: 'Advantage on concentration checks.',
                                usesMax: null,
                                usesRemaining: null,
                                recharge: null,
                            },
                        ],
                        spellSaveDC: 17,
                        spellAttackBonus: 9,
                    },
                },
            },
            error: new Error('Network error'),
        };

        renderScreen([
            CHARACTERS_MOCK,
            failingMock,
            ...SAVE_CORE_CHARACTER_MOCKS.filter(mock => mock.request.query !== SAVE_CHARACTER_SHEET),
        ]);

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

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Failed to save core character sheet edits',
            expect.any(Error),
        );
        expect(screen.queryByText('Saved')).toBeNull();
        expect(screen.getByLabelText('Cancel character sheet edits')).toBeTruthy();
        expect(screen.getByLabelText('Save character sheet edits')).toBeTruthy();

        consoleErrorSpy.mockRestore();
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
        fireEvent.press(screen.getByLabelText('Add backpack'));

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

    it('switches to the Abilities tab', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Abilities tab')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Open Abilities tab'));

        await waitFor(() => {
            expect(screen.getByText('Abilities & Skills')).toBeTruthy();
        });
    });

    it('cycles skill proficiency and updates skill modifier', async () => {
        renderScreen([CHARACTERS_MOCK, UPDATE_SKILLS_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Enable character sheet edit mode'));
        fireEvent.press(screen.getByLabelText('Open Abilities tab'));

        await waitFor(() => {
            expect(screen.getByTestId('ability-skills-mod-perception')).toHaveTextContent('+5');
        });

        fireEvent.changeText(screen.getByLabelText('Search skills'), 'Perception');

        await waitFor(() => {
            expect(screen.getByLabelText('Cycle proficiency for Perception')).toBeTruthy();
        });

        await pressAndFlush(screen.getByLabelText('Cycle proficiency for Perception'));

        await waitFor(() => {
            expect(screen.getByTestId('ability-skills-mod-perception')).toHaveTextContent('+9');
        });
    });

    it('toggles saving throw proficiency and updates saving throw modifier', async () => {
        renderScreen([CHARACTERS_MOCK, UPDATE_SAVING_THROW_PROFICIENCIES_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Enable character sheet edit mode'));
        fireEvent.press(screen.getByLabelText('Open Abilities tab'));

        await waitFor(() => {
            expect(screen.getByTestId('ability-saves-mod-strength')).toHaveTextContent('−1');
        });

        await pressAndFlush(screen.getByLabelText('Toggle saving throw proficiency for Strength'));

        await waitFor(() => {
            expect(screen.getByTestId('ability-saves-mod-strength')).toHaveTextContent('+3');
        });
    });

    it('allows editing ability scores from the Abilities tab in edit mode', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Enable character sheet edit mode'));
        fireEvent.press(screen.getByLabelText('Open Abilities tab'));

        await waitFor(() => {
            expect(screen.getByDisplayValue('20')).toBeTruthy();
        });

        fireEvent.changeText(screen.getByDisplayValue('20'), '18');

        await waitFor(() => {
            expect(screen.getByDisplayValue('18')).toBeTruthy();
        });
    });

    it('filters skills by search text', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Abilities tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Abilities tab'));

        await waitFor(() => {
            expect(screen.getByLabelText('Search skills')).toBeTruthy();
        });
        fireEvent.changeText(screen.getByLabelText('Search skills'), 'Arcana');

        await waitFor(() => {
            expect(screen.getByText('Arcana')).toBeTruthy();
        });
        expect(screen.queryByText('Athletics')).toBeNull();
        expect(screen.getAllByText('Saving Throw').length).toBe(1);
        expect(screen.queryByTestId('ability-saves-mod-strength')).toBeNull();
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
        expect(screen.getAllByText('+9').length).toBeGreaterThanOrEqual(1);
    });

    it('switches to the Gear tab and shows currency, weapons, and inventory', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Gear tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Gear tab'));

        await waitFor(() => {
            expect(screen.getByText('Currency')).toBeTruthy();
        });

        expect(screen.getByTestId('currency-gp-amount')).toHaveTextContent('847');
        expect(screen.getAllByText('Weapons').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Dagger')).toBeTruthy();
        expect(screen.getByTestId('weapon-stats-attack-1')).toHaveStyle({ alignItems: 'flex-end' });
        expect(screen.getByText('Backpack')).toBeTruthy();
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
    });

    it('switches to the Traits tab and shows personality and proficiencies', async () => {
        renderScreen();

        await waitFor(() => {
            expect(screen.getByLabelText('Open Traits tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Traits tab'));

        await waitFor(() => {
            expect(screen.getByText('Personality & Background')).toBeTruthy();
        });
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
                opacity: 1,
            });
        });

        fireEvent.press(screen.getByTestId('character-spell-row-spell-fireball'));
        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepare-spell-fireball')).toBeTruthy();
        });
        await pressAndFlush(screen.getByTestId('character-spell-prepare-spell-fireball'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-fireball')).toHaveStyle({
                opacity: 0,
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
                opacity: 0,
            });
        });

        fireEvent.press(screen.getByTestId('character-spell-row-spell-bigbys-hand'));
        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepare-spell-bigbys-hand')).toBeTruthy();
        });
        await pressAndFlush(screen.getByTestId('character-spell-prepare-spell-bigbys-hand'));

        await waitFor(() => {
            expect(screen.getByTestId('character-spell-prepared-spell-bigbys-hand')).toHaveStyle({
                opacity: 1,
            });
        });
    });

    it('disables pager swiping while the add spell sheet is open', async () => {
        renderScreen([CHARACTERS_MOCK, ADD_SPELL_LIST_MOCK]);

        await waitFor(() => {
            expect(screen.getByLabelText('Open Spells tab')).toBeTruthy();
        });
        fireEvent.press(screen.getByLabelText('Open Spells tab'));

        await waitFor(() => {
            expect(screen.getByLabelText('Add spell')).toBeTruthy();
        });

        expect(screen.getByTestId('character-sheet-pager').props.scrollEnabled).toBe(true);

        fireEvent.press(screen.getByLabelText('Add spell'));

        await waitFor(() => {
            expect(screen.getByText('Add Spell')).toBeTruthy();
        });

        expect(screen.getByTestId('character-sheet-pager').props.scrollEnabled).toBe(false);
    });
});
