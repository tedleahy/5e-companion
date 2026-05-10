import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { View, Text } from 'react-native';
import WizardShell from '../WizardShell';

const mockPathname = jest.fn(() => '/characters/create/review');
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockResetDraft = jest.fn();
const mockHasDraftData = jest.fn(() => false);

let mockMutationError: Error | null = null;
let mockMutationLoading = false;
const mockCreateCharacter = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
        replace: mockReplace,
    }),
    usePathname: () => mockPathname(),
    useLocalSearchParams: () => ({}),
    Redirect: ({ href }: { href: string }) => null,
    Stack: () => null,
}));

jest.mock('@apollo/client/react', () => ({
    useMutation: jest.fn(() => [
        mockCreateCharacter,
        { loading: mockMutationLoading, error: mockMutationError },
    ]),
    ApolloError: jest.requireActual('@apollo/client/react').ApolloError,
}));

jest.mock('@/store/characterDraft', () => ({
    useCharacterDraft: jest.fn(() => ({
        draft: {
            name: 'TestHero',
            race: 'human',
            level: 1,
            classes: [{ classId: 'fighter', level: 1, subclassId: '' }],
            startingClassId: 'fighter',
            background: 'acolyte',
            alignment: 'true-neutral',
            abilityScores: {
                strength: 11,
                dexterity: 11,
                constitution: 11,
                intelligence: 11,
                wisdom: 11,
                charisma: 11,
            },
            selectedSkills: ['acrobatics', 'athletics'],
        },
        resetDraft: mockResetDraft,
        hasDraftData: mockHasDraftData,
    })),
}));

jest.mock('@/hooks/useAvailableSubclasses', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        availableSubclasses: [],
        availableSubclassesByClassId: {},
        subclassOptionItemsByClassId: {},
        loading: false,
    })),
}));

jest.mock('@/lib/characterCreation/buildCreateCharacterInput', () => ({
    buildCreateCharacterInput: jest.fn(() => ({})),
}));

jest.mock('@/lib/characterCreation/stepCompletion', () => ({
    isCreateCharacterStepComplete: jest.fn(() => true),
}));

function renderShell(pathname: string) {
    mockPathname.mockReturnValue(pathname);
    return render(
        <PaperProvider>
            <WizardShell>
                <View>
                    <Text>Step content</Text>
                </View>
            </WizardShell>
        </PaperProvider>
    );
}

describe('WizardShell', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMutationError = null;
        mockMutationLoading = false;
    });

    it('shows the mutation error on the review step', async () => {
        mockMutationError = new Error('Network error');

        renderShell('/characters/create/review');

        await waitFor(() => {
            expect(screen.getByText('Failed to create character. Please try again.')).toBeTruthy();
        });
    });

    it('clears the error when navigating away from review', async () => {
        mockMutationError = new Error('Network error');

        const { rerender } = renderShell('/characters/create/review');

        await waitFor(() => {
            expect(screen.getByText('Failed to create character. Please try again.')).toBeTruthy();
        });

        // Simulate navigation to the skills step
        mockPathname.mockReturnValue('/characters/create/skills');
        mockMutationError = null;

        rerender(
            <PaperProvider>
                <WizardShell>
                    <View>
                        <Text>Step content</Text>
                    </View>
                </WizardShell>
            </PaperProvider>
        );

        await waitFor(() => {
            expect(screen.queryByText('Failed to create character. Please try again.')).toBeNull();
        });
    });
});
