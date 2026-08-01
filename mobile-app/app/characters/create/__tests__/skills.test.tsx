import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import StepSkills from '../skills';

jest.mock('@/store/characterDraft', () => ({
    useCharacterDraft: jest.fn(),
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

describe('StepSkills custom class presentation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses draft presentation for custom class labels and saving throws', () => {
        useCharacterDraft.mockReturnValue({
            draft: {
                background: '',
                classes: [{ classId: 'custom-rune-knight', subclassId: '', level: 1 }],
                startingClassId: 'custom-rune-knight',
                proficiencyChoices: [],
                classPresentationById: {
                    'custom-rune-knight': {
                        name: 'Rune Knight',
                        savingThrowIndexes: ['str', 'wis'],
                    },
                },
            },
            toggleProficiencyChoice: jest.fn(),
        });

        render(
            <PaperProvider>
                <StepSkills />
            </PaperProvider>,
        );

        expect(screen.getByText('Granted by your starting class (Rune Knight)')).toBeTruthy();
        expect(screen.getByText('STR')).toBeTruthy();
        expect(screen.getByText('WIS')).toBeTruthy();
        expect(screen.queryByText('Unknown class')).toBeNull();
    });
});
