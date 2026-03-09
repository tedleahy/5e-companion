import React from 'react';
import { Pressable } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider, Text } from 'react-native-paper';
import SpellList, { type SpellAccordionActionContext } from '../SpellList';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: jest.fn(), back: jest.fn() }),
}));

/**
 * Wraps list rendering with the app's Paper provider.
 */
function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

const SPELLS = [
    { id: '1', name: 'Fireball', level: 1, prepared: false },
    { id: '2', name: 'Magic Missile', level: 1, prepared: true },
    { id: '3', name: 'Shield', level: 2, prepared: false },
];

/**
 * Renders minimal accordion content for test assertions.
 */
function renderTestActions(context: SpellAccordionActionContext) {
    return (
        <>
            <Text>{`Actions for ${context.spell.name}`}</Text>
            <Pressable onPress={() => {
                if (!context.removeSpell) return;
                void context.removeSpell();
            }}>
                <Text>{`Remove ${context.spell.name}`}</Text>
            </Pressable>
        </>
    );
}

describe('SpellList', () => {
    beforeEach(() => {
        mockPush.mockClear();
        jest.useRealTimers();
    });

    it('shows a loading indicator when loading', () => {
        renderWithPaper(<SpellList spells={[]} loading={true} />);
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('renders spell names when not loading', () => {
        renderWithPaper(<SpellList spells={SPELLS} loading={false} />);
        expect(screen.getByText('Fireball')).toBeTruthy();
        expect(screen.getByText('Magic Missile')).toBeTruthy();
        expect(screen.getByText('Shield')).toBeTruthy();
    });

    it('navigates to spell detail on press', () => {
        renderWithPaper(<SpellList spells={SPELLS} loading={false} />);
        fireEvent.press(screen.getByText('Fireball'));
        expect(mockPush).toHaveBeenCalledWith('/spells/1');
    });

    it('renders an empty list when spells is undefined', () => {
        renderWithPaper(<SpellList spells={undefined} loading={false} />);
        expect(screen.queryByText('Fireball')).toBeNull();
    });

    it('does not toggle prepared state on long press', () => {
        const onTogglePrepared = jest.fn();

        renderWithPaper(
            <SpellList
                spells={SPELLS}
                loading={false}
                variant="embedded"
                showPreparedState
                onTogglePrepared={onTogglePrepared}
            />,
        );

        fireEvent(screen.getByTestId('spell-list-row-1'), 'longPress');
        expect(onTogglePrepared).not.toHaveBeenCalled();
    });

    it('opens one accordion row at a time within a level group', () => {
        jest.useFakeTimers();

        renderWithPaper(
            <SpellList
                spells={SPELLS}
                loading={false}
                variant="embedded"
                renderAccordionActions={renderTestActions}
            />,
        );

        fireEvent.press(screen.getByTestId('spell-list-row-1'));
        expect(screen.getByText('Actions for Fireball')).toBeTruthy();

        fireEvent.press(screen.getByTestId('spell-list-row-2'));
        expect(screen.getByText('Actions for Magic Missile')).toBeTruthy();

        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(screen.queryByText('Actions for Fireball')).toBeNull();
    });

    it('optimistically removes a spell row when remove is triggered', async () => {
        jest.useFakeTimers();
        const onRemoveSpell = jest.fn().mockResolvedValue(undefined);

        renderWithPaper(
            <SpellList
                spells={SPELLS}
                loading={false}
                variant="embedded"
                onRemoveSpell={onRemoveSpell}
                renderAccordionActions={renderTestActions}
            />,
        );

        fireEvent.press(screen.getByTestId('spell-list-row-1'));
        fireEvent.press(screen.getByText('Remove Fireball'));

        await act(async () => {
            jest.advanceTimersByTime(120);
            await Promise.resolve();
        });

        await act(async () => {
            jest.advanceTimersByTime(340);
            await Promise.resolve();
        });

        expect(onRemoveSpell).toHaveBeenCalledWith('1');
        expect(screen.queryByText('Fireball')).toBeNull();
    });
});
