import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import StepReview from '../review';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/store/characterDraft', () => ({
    useCharacterDraft: jest.fn(),
}));

jest.mock('@/hooks/useAvailableBackgrounds', () => ({
    __esModule: true,
    default: jest.fn(() => ({ backgroundOptions: [] })),
}));

jest.mock('@/hooks/useCreationProficiencyRequirements', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        proficiencyChoiceGroups: [],
        fixedSkillKeys: [],
        loading: false,
        error: undefined,
        refetch: jest.fn(),
    })),
}));

const { useCharacterDraft } = jest.requireMock('@/store/characterDraft') as {
    useCharacterDraft: jest.Mock;
};

describe('StepReview custom class presentation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses draft presentation for custom class labels and saving throws', () => {
        useCharacterDraft.mockReturnValue({
            draft: {
                name: 'Kara',
                race: 'Human',
                background: 'Acolyte',
                alignment: null,
                level: 1,
                abilityScores: {
                    strength: 10,
                    dexterity: 10,
                    constitution: 10,
                    intelligence: 10,
                    wisdom: 10,
                    charisma: 10,
                },
                asiAllocations: {
                    strength: 0,
                    dexterity: 0,
                    constitution: 0,
                    intelligence: 0,
                    wisdom: 0,
                    charisma: 0,
                },
                proficiencyChoices: [],
                featureChoices: [],
                classes: [{ classId: 'custom-rune-knight', subclassId: '', level: 1 }],
                startingClassId: 'custom-rune-knight',
                classPresentationById: {
                    'custom-rune-knight': {
                        name: 'Rune Knight',
                        savingThrowIndexes: ['str', 'wis'],
                    },
                },
            },
        });

        render(
            <PaperProvider>
                <StepReview />
            </PaperProvider>,
        );

        expect(screen.getByText('Rune Knight — Level 1')).toBeTruthy();
        expect(screen.getAllByText('STR').length).toBeGreaterThan(0);
        expect(screen.getAllByText('WIS').length).toBeGreaterThan(0);
        expect(screen.queryByText('Unknown class')).toBeNull();
        expect(screen.queryByText(/Saving Throws/)).toBeTruthy();
    });
});
