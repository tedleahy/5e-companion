import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import { PaperProvider } from 'react-native-paper';
import AddSpellSheet, { GET_SPELL_DETAIL_FOR_SHEET, SEARCH_SPELLS_FOR_SHEET } from '../AddSpellSheet';

const SPELLS_QUERY_MOCK = {
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
            spells: [
                {
                    __typename: 'Spell',
                    id: 'spell-magic-missile',
                    name: 'Magic Missile',
                    level: 1,
                    schoolIndex: 'evocation',
                    castingTime: '1 action',
                    range: '120 feet',
                    concentration: false,
                    ritual: false,
                    classIndexes: ['wizard', 'sorcerer'],
                },
            ],
        },
    },
};

const SPELL_DETAIL_QUERY_MOCK = {
    request: {
        query: GET_SPELL_DETAIL_FOR_SHEET,
        variables: {
            id: 'spell-magic-missile',
        },
    },
    delay: 80,
    result: {
        data: {
            spell: {
                __typename: 'Spell',
                id: 'spell-magic-missile',
                name: 'Magic Missile',
                level: 1,
                schoolIndex: 'evocation',
                castingTime: '1 action',
                range: '120 feet',
                concentration: false,
                ritual: false,
                classIndexes: ['wizard', 'sorcerer'],
                description: ['You create three glowing darts of magical force.'],
                higherLevel: ['One more dart per slot level above 1st.'],
                components: ['V', 'S'],
                material: null,
                duration: 'Instantaneous',
            },
        },
    },
};

const SCHOOL_FILTERED_SPELLS_QUERY_MOCK = {
    request: {
        query: SEARCH_SPELLS_FOR_SHEET,
        variables: {
            filter: {
                classes: ['wizard'],
                schools: ['abjuration'],
            },
            pagination: {
                limit: 500,
                offset: 0,
            },
        },
    },
    result: {
        data: {
            spells: [
                {
                    __typename: 'Spell',
                    id: 'spell-shield',
                    name: 'Shield',
                    level: 1,
                    schoolIndex: 'abjuration',
                    castingTime: '1 reaction',
                    range: 'Self',
                    concentration: false,
                    ritual: false,
                    classIndexes: ['wizard', 'sorcerer'],
                },
            ],
        },
    },
};

/**
 * Flushes pending React Native animation timers inside `act(...)`.
 */
async function flushAnimationTimers(milliseconds = 400) {
    await act(async () => {
        jest.advanceTimersByTime(milliseconds);
        await Promise.resolve();
    });
}

/**
 * Creates one detail-query mock instance.
 */
function buildSpellDetailQueryMock() {
    return {
        ...SPELL_DETAIL_QUERY_MOCK,
        request: {
            ...SPELL_DETAIL_QUERY_MOCK.request,
            variables: { ...SPELL_DETAIL_QUERY_MOCK.request.variables },
        },
        result: {
            data: {
                spell: {
                    ...SPELL_DETAIL_QUERY_MOCK.result.data.spell,
                    description: ['You create three glowing darts of magical force.'],
                    higherLevel: ['One more dart per slot level above 1st.'],
                    components: ['V', 'S'],
                    material: null,
                    duration: 'Instantaneous',
                },
            },
        },
    };
}

/**
 * Renders AddSpellSheet with shared providers and default props.
 */
function renderSheetWithMocks(
    mocks: unknown[],
    overrides?: {
        onClose?: () => void;
        onSpellAdded?: (spellId: string) => Promise<void>;
        onSpellRemoved?: (spellId: string) => Promise<void>;
    },
) {
    const onClose = overrides?.onClose ?? jest.fn();
    const onSpellAdded = overrides?.onSpellAdded ?? jest.fn().mockResolvedValue(undefined);
    const onSpellRemoved = overrides?.onSpellRemoved ?? jest.fn().mockResolvedValue(undefined);

    render(
        <MockedProvider mocks={mocks}>
            <PaperProvider>
                <AddSpellSheet
                    visible={true}
                    onClose={onClose}
                    characterClass="Wizard"
                    knownSpellIds={[]}
                    onSpellAdded={onSpellAdded}
                    onSpellRemoved={onSpellRemoved}
                />
            </PaperProvider>
        </MockedProvider>,
    );

    return {
        onClose,
        onSpellAdded,
        onSpellRemoved,
    };
}

/**
 * Renders AddSpellSheet with shared providers and default props.
 */
function renderSheet(overrides?: {
    onClose?: () => void;
    onSpellAdded?: (spellId: string) => Promise<void>;
    onSpellRemoved?: (spellId: string) => Promise<void>;
}) {
    return renderSheetWithMocks([
        SPELLS_QUERY_MOCK,
        buildSpellDetailQueryMock(),
        buildSpellDetailQueryMock(),
    ], overrides);
}

describe('AddSpellSheet', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(async () => {
        await flushAnimationTimers(1_000);
        jest.useRealTimers();
    });

    it('toggles one spell by tapping + then tick in the list row', async () => {
        const { onClose, onSpellAdded, onSpellRemoved } = renderSheet();
        await flushAnimationTimers();

        await waitFor(() => {
            expect(screen.getByText('Magic Missile')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Add spell'));
        await flushAnimationTimers();

        await waitFor(() => {
            expect(onSpellAdded).toHaveBeenCalledWith('spell-magic-missile');
        });

        fireEvent.press(screen.getByLabelText('Remove spell'));
        await flushAnimationTimers();

        await waitFor(() => {
            expect(onSpellRemoved).toHaveBeenCalledWith('spell-magic-missile');
        });

        expect(onClose).not.toHaveBeenCalled();
        expect(screen.getByText('Add Spell')).toBeTruthy();
    });

    it('switches detail action label from add to remove for selected spells', async () => {
        const { onSpellAdded, onSpellRemoved } = renderSheet();
        await flushAnimationTimers();

        await waitFor(() => {
            expect(screen.getByLabelText('Open details for Magic Missile')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Open details for Magic Missile'));
        await flushAnimationTimers();
        await flushAnimationTimers();

        await waitFor(() => {
            expect(screen.getByText('+ Add to spell list')).toBeTruthy();
        });

        fireEvent.press(screen.getByText('+ Add to spell list'));
        await flushAnimationTimers();

        await waitFor(() => {
            expect(onSpellAdded).toHaveBeenCalledWith('spell-magic-missile');
        });

        await waitFor(() => {
            expect(screen.getByText('Remove from spell list')).toBeTruthy();
        });

        fireEvent.press(screen.getByText('Remove from spell list'));
        await flushAnimationTimers();

        await waitFor(() => {
            expect(onSpellRemoved).toHaveBeenCalledWith('spell-magic-missile');
        });
    });

    it('stays open while add/remove mutations complete', async () => {
        const resolveAddMutationRef: { current: (() => void) | null } = { current: null };

        const onSpellAdded = jest.fn(() => {
            return new Promise<void>((resolve) => {
                resolveAddMutationRef.current = resolve;
            });
        });

        renderSheet({ onSpellAdded });
        await flushAnimationTimers();

        await waitFor(() => {
            expect(screen.getByLabelText('Add spell')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Add spell'));
        await flushAnimationTimers();

        await waitFor(() => {
            expect(onSpellAdded).toHaveBeenCalledWith('spell-magic-missile');
        });

        expect(screen.getByText('Add Spell')).toBeTruthy();

        resolveAddMutationRef.current?.();
        await flushAnimationTimers();

        await waitFor(() => {
            expect(screen.getByLabelText('Remove spell')).toBeTruthy();
        });
    });

    it('applies school filters through the query instead of client-side post-filtering', async () => {
        renderSheetWithMocks([
            SPELLS_QUERY_MOCK,
            SCHOOL_FILTERED_SPELLS_QUERY_MOCK,
            buildSpellDetailQueryMock(),
            buildSpellDetailQueryMock(),
        ]);
        await flushAnimationTimers();

        await waitFor(() => {
            expect(screen.getByText('Magic Missile')).toBeTruthy();
        });

        fireEvent.press(screen.getByLabelText('Open spell filters'));
        await flushAnimationTimers();

        fireEvent.press(screen.getByText('Abjuration'));
        await flushAnimationTimers();

        fireEvent.press(screen.getByLabelText('Show filtered spell results'));
        await flushAnimationTimers();

        await waitFor(() => {
            expect(screen.getByText('Shield')).toBeTruthy();
        });

        await waitFor(() => {
            expect(screen.queryByText('Magic Missile')).toBeNull();
        });
    });
});
