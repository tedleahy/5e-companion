import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import StepClass from '../class';

const mockUpdateDraft = jest.fn();

jest.mock('@/store/characterDraft', () => ({
    useCharacterDraft: jest.fn(),
}));

jest.mock('@/components/wizard/ClassAllocationRow', () => ({
    __esModule: true,
    default: ({ classRow, index, isStartingClass }: { classRow: { classId: string }, index: number, isStartingClass: boolean }) => {
        const { Text } = require('react-native');

        return (
            <Text testID="class-allocation-row">
            {`${index}:${classRow.classId}:${isStartingClass ? 'starting' : 'not-starting'}`}
            </Text>
        );
    },
}));

const { useCharacterDraft } = jest.requireMock('@/store/characterDraft') as {
    useCharacterDraft: jest.Mock;
};

/**
 * Renders the class step with the Paper provider used by the app.
 */
function renderScreen() {
    return render(
        <PaperProvider>
            <StepClass />
        </PaperProvider>
    );
}

describe('StepClass', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps classes in selection order even when a later class is the starting class', () => {
        useCharacterDraft.mockReturnValue({
            draft: {
                level: 3,
                classes: [
                    { classId: 'wizard', level: 1, subclassId: '' },
                    { classId: 'rogue', level: 2, subclassId: '' },
                ],
                startingClassId: 'rogue',
            },
            updateDraft: mockUpdateDraft,
        });

        renderScreen();

        expect(screen.getAllByTestId('class-allocation-row').map((row) => row.props.children)).toEqual([
            '0:wizard:not-starting',
            '1:rogue:starting',
        ]);
    });
});
