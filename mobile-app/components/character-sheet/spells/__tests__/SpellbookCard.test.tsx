import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import SpellbookCard from '../SpellbookCard';

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

const SPELLBOOK = [
    {
        __typename: 'CharacterSpell' as const,
        prepared: true,
        spell: {
            __typename: 'Spell' as const,
            id: 'spell-fireball',
            name: 'Fireball',
            level: 3,
            schoolIndex: 'evocation',
            classIndexes: ['wizard', 'sorcerer'],
            castingTime: '1 action',
            range: '150 feet',
            concentration: false,
            ritual: false,
        },
    },
    {
        __typename: 'CharacterSpell' as const,
        prepared: false,
        spell: {
            __typename: 'Spell' as const,
            id: 'spell-hex',
            name: 'Hex',
            level: 1,
            schoolIndex: 'enchantment',
            classIndexes: ['warlock'],
            castingTime: '1 bonus action',
            range: '90 feet',
            concentration: true,
            ritual: false,
        },
    },
];

/**
 * Wraps spellbook rendering with the app's Paper provider.
 */
function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

describe('SpellbookCard', () => {
    it('hides prepared-spell UI for known casters', () => {
        renderWithPaper(
            <SpellbookCard
                spellcastingClassIds={['warlock']}
                spellbook={SPELLBOOK}
                onOpenSpell={jest.fn()}
                onSetPrepared={jest.fn()}
                onRemoveSpell={jest.fn()}
            />,
        );

        expect(screen.queryByText('All (2)')).toBeNull();
        expect(screen.queryByText('Prepared (1)')).toBeNull();
        expect(screen.queryByText('Unprepared (1)')).toBeNull();
        expect(screen.queryByTestId('character-spell-prepared-spell-fireball')).toBeNull();

        fireEvent.press(screen.getByTestId('character-spell-row-spell-fireball'));

        expect(screen.getByTestId('character-spell-view-spell-fireball')).toBeTruthy();
        expect(screen.queryByTestId('character-spell-prepare-spell-fireball')).toBeNull();
        expect(screen.getByTestId('character-spell-remove-spell-fireball')).toBeTruthy();
    });
});
