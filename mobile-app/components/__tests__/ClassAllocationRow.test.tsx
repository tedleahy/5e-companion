import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import ClassAllocationRow from '@/components/wizard/ClassAllocationRow';

/**
 * Renders UI with the Paper theme provider used by the app.
 */
function renderWithPaper(ui: React.ReactElement) {
    return render(<PaperProvider>{ui}</PaperProvider>);
}

/**
 * Creates one valid set of test props for the class allocation row.
 */
function createProps(overrides: Partial<React.ComponentProps<typeof ClassAllocationRow>> = {}) {
    return {
        canDecreaseLevel: true,
        canIncreaseLevel: true,
        canRemove: true,
        classRow: {
            classId: 'wizard',
            level: 2,
            subclassId: '',
        },
        index: 0,
        isStartingClass: true,
        onDecreaseLevel: jest.fn(),
        onIncreaseLevel: jest.fn(),
        onRemove: jest.fn(),
        onSelectStartingClass: jest.fn(),
        onSelectSubclass: jest.fn(),
        showStartingClassSelector: true,
        subclassOptions: [],
        subclassUnlocked: false,
        ...overrides,
    };
}

describe('ClassAllocationRow', () => {
    it('hides the starting-class radio when only one class is selected', () => {
        renderWithPaper(<ClassAllocationRow {...createProps({ showStartingClassSelector: false })} />);

        expect(screen.queryByTestId('class-row-starting-0')).toBeNull();
        expect(screen.queryByText('Starting class')).toBeNull();
    });

    it('shows the starting-class radio when more than one class is selected', () => {
        renderWithPaper(<ClassAllocationRow {...createProps()} />);

        expect(screen.getByTestId('class-row-starting-0')).toBeTruthy();
        expect(screen.getByText('Starting class')).toBeTruthy();
    });
});
