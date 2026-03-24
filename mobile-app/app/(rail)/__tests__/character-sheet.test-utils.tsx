import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import type { MockLink } from '@apollo/client/testing';
import { PaperProvider } from 'react-native-paper';
import CharacterByIdScreen from '../character/[id]';
import { SEARCH_SPELLS_FOR_SHEET } from '@/components/character-sheet/spells/AddSpellSheet';
import { CHARACTERS_MOCK } from './mocks/character-sheet.mocks';

/**
 * Spell search mock used by add-spell sheet tests that only care about sheet visibility.
 */
export const ADD_SPELL_LIST_MOCK: MockLink.MockedResponse = {
    request: {
        query: SEARCH_SPELLS_FOR_SHEET,
        variables: {
            filter: {
                classes: ['wizard', 'warlock'],
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

/**
 * Shared route-param mock so tests can override the active character id.
 */
export const mockUseLocalSearchParams = jest.fn(() => ({ id: 'char-1' }));

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

/**
 * Renders the character-sheet route with the standard Apollo and Paper providers.
 */
export function renderCharacterSheetScreen(
    mocks: MockLink.MockedResponse[] = [CHARACTERS_MOCK],
) {
    return render(
        <MockedProvider mocks={mocks}>
            <PaperProvider>
                <CharacterByIdScreen />
            </PaperProvider>
        </MockedProvider>
    );
}

/**
 * Presses a control and flushes the next microtask for optimistic UI updates.
 */
export async function pressAndFlush(
    target: Parameters<typeof fireEvent.press>[0],
) {
    await act(async () => {
        fireEvent.press(target);
        await Promise.resolve();
    });
}

/**
 * Flushes pending microtasks between tests to reduce Apollo update leakage.
 */
export async function flushCharacterSheetMicrotasks() {
    await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
        await new Promise<void>((resolve) => setImmediate(resolve));
    });
}

/**
 * Applies the shared test lifecycle used by the split character-sheet suites.
 */
export function setupCharacterSheetScreenTestHooks() {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await flushCharacterSheetMicrotasks();
    });
}

/**
 * Opens one character-sheet tab by its visible label.
 */
export async function openCharacterSheetTab(label: string) {
    await waitFor(() => {
        expect(screen.getByLabelText(`Open ${label} tab`)).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText(`Open ${label} tab`));
}

/**
 * Enables character-sheet edit mode and waits for save controls to appear.
 */
export async function enableCharacterSheetEditMode() {
    await waitFor(() => {
        expect(screen.getByLabelText('Enable character sheet edit mode')).toBeTruthy();
    });

    fireEvent.press(screen.getByLabelText('Enable character sheet edit mode'));

    await waitFor(() => {
        expect(screen.getByLabelText('Save character sheet edits')).toBeTruthy();
    });
}
