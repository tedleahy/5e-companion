import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import FeaturesStage from '../FeaturesStage';
import { createDraft } from '../draft';
import type { Draft } from '../types';

const mockAddSpellSheetSpy = jest.fn();

jest.mock('@/components/character-sheet/spells/AddSpellSheet', () => ({
    __esModule: true,
    default: (props: unknown) => {
        mockAddSpellSheetSpy(props);
        return null;
    },
}));

/**
 * Renders FeaturesStage with a spellcasting-enabled draft.
 */
function renderFeaturesStage(overrides: Partial<Draft> = {}, locked = false) {
    const draft: Draft = {
        ...createDraft(),
        spellcastingMode: 'FULL',
        spellcastingAbility: 'int',
        ...overrides,
    };
    const onChange = jest.fn();

    render(
        <PaperProvider>
            <FeaturesStage draft={draft} locked={locked} onChange={onChange} />
        </PaperProvider>,
    );

    return { draft, onChange };
}

describe('FeaturesStage spell list', () => {
    beforeEach(() => {
        mockAddSpellSheetSpy.mockClear();
    });

    test('hides the class spell list when spellcasting mode is NONE', () => {
        renderFeaturesStage({ spellcastingMode: 'NONE' });

        expect(screen.queryByTestId('custom-class-spell-list')).toBeNull();
        expect(mockAddSpellSheetSpy).not.toHaveBeenCalled();
    });

    test('opens the shared spell picker with no class filter', () => {
        renderFeaturesStage({
            spells: [{ id: 'spell-magic-missile', name: 'Magic Missile', level: 1 }],
        });

        fireEvent.press(screen.getByTestId('custom-class-add-spells'));

        expect(mockAddSpellSheetSpy).toHaveBeenLastCalledWith(expect.objectContaining({
            visible: true,
            characterClassIds: [],
            knownSpellIds: ['spell-magic-missile'],
            title: 'Class Spell List',
        }));
    });

    test('hides edit controls when mechanics are locked', () => {
        renderFeaturesStage({
            spells: [{ id: 'spell-magic-missile', name: 'Magic Missile', level: 1 }],
        }, true);

        expect(screen.queryByTestId('custom-class-add-spells')).toBeNull();
        expect(screen.queryByLabelText('Remove Magic Missile')).toBeNull();
        expect(screen.getByTestId('custom-class-spell-spell-magic-missile')).toBeTruthy();
        expect(mockAddSpellSheetSpy).not.toHaveBeenCalled();
    });

    test('renders selected spells and removes one from the draft', () => {
        const { onChange } = renderFeaturesStage({
            spells: [
                { id: 'spell-magic-missile', name: 'Magic Missile', level: 1 },
                { id: 'spell-shield', name: 'Shield', level: 1 },
            ],
        });

        expect(screen.getByTestId('custom-class-spell-spell-magic-missile')).toBeTruthy();
        expect(screen.getByText('2 spells selected')).toBeTruthy();

        fireEvent.press(screen.getByLabelText('Remove Magic Missile'));

        expect(onChange).toHaveBeenCalledWith({
            spells: [{ id: 'spell-shield', name: 'Shield', level: 1 }],
        });
    });

    test('adds a spell through the picker callback', async () => {
        const { onChange } = renderFeaturesStage({ spells: [] });

        fireEvent.press(screen.getByTestId('custom-class-add-spells'));

        const sheetProps = mockAddSpellSheetSpy.mock.lastCall?.[0] as {
            onSpellAdded: (spell: { id: string; name: string; level: number }) => Promise<void>;
        };

        await sheetProps.onSpellAdded({
            id: 'spell-fireball',
            name: 'Fireball',
            level: 3,
        });

        expect(onChange).toHaveBeenCalledWith({
            spells: [{ id: 'spell-fireball', name: 'Fireball', level: 3 }],
        });
    });

    test('removes a spell through the picker callback', async () => {
        const { onChange } = renderFeaturesStage({
            spells: [{ id: 'spell-fireball', name: 'Fireball', level: 3 }],
        });

        fireEvent.press(screen.getByTestId('custom-class-add-spells'));

        const sheetProps = mockAddSpellSheetSpy.mock.lastCall?.[0] as {
            onSpellRemoved: (spell: { id: string; name: string; level: number }) => Promise<void>;
        };

        await sheetProps.onSpellRemoved({
            id: 'spell-fireball',
            name: 'Fireball',
            level: 3,
        });

        expect(onChange).toHaveBeenCalledWith({ spells: [] });
    });
});

describe('FeaturesStage feature cards', () => {
    test('shows an empty hint and adds a feature card', () => {
        const { onChange } = renderFeaturesStage({ features: [], spellcastingMode: 'NONE' });

        expect(screen.getByText(/No features yet/i)).toBeTruthy();
        expect(screen.queryByTestId('custom-class-feature-0')).toBeNull();

        fireEvent.press(screen.getByTestId('add-custom-class-feature'));

        expect(onChange).toHaveBeenCalledWith({
            features: [
                expect.objectContaining({
                    name: '',
                    description: '',
                    level: 1,
                }),
            ],
        });
    });

    test('uses a top-right trash control to remove a feature card', () => {
        const feature = {
            key: 'feature-1',
            name: 'Fighting Style',
            description: 'Choose a style.',
            level: 1,
        };
        const { onChange } = renderFeaturesStage({ features: [feature] });

        expect(screen.getByTestId('remove-custom-class-feature-0')).toBeTruthy();
        expect(screen.getByTestId('feature-level-0')).toBeTruthy();
        expect(screen.getByText('Fighting Style')).toBeTruthy();
        expect(screen.queryByText('Remove')).toBeNull();

        fireEvent.press(screen.getByLabelText('Remove feature 1'));

        expect(onChange).toHaveBeenCalledWith({ features: [] });
    });

    test('raises feature level with the stepper', () => {
        const feature = {
            key: 'feature-1',
            name: 'Extra Attack',
            description: 'Attack twice.',
            level: 5,
        };
        const { onChange } = renderFeaturesStage({ features: [feature] });

        fireEvent.press(screen.getByLabelText('Increase level for Extra Attack'));

        expect(onChange).toHaveBeenCalledWith({
            features: [{ ...feature, level: 6 }],
        });
    });
});
