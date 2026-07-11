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
