import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import StepClass from '../class';

const mockUpdateDraft = jest.fn();
const mockScrollTo = jest.fn();

jest.mock('react-native', () => {
    const React = require('react');
    const actual = jest.requireActual('react-native');

    const ScrollView = React.forwardRef(({ children, ...props }, ref) => {
        React.useImperativeHandle(ref, () => ({
            scrollTo: mockScrollTo,
        }));

        return <actual.View {...props}>{children}</actual.View>;
    });

    const mockedReactNative = Object.create(actual);

    Object.defineProperty(mockedReactNative, 'ScrollView', {
        value: ScrollView,
    });

    return mockedReactNative;
});

jest.mock('@/store/characterDraft', () => ({
    useCharacterDraft: jest.fn(),
}));

jest.mock('@/components/wizard/OptionGrid', () => ({
    __esModule: true,
    default: ({
        options,
        selected,
        onSelect,
    }: {
        options: { value: string; label: string; icon: string }[];
        selected: string;
        onSelect: (value: string) => void;
    }) => {
        const { Pressable, Text, View } = require('react-native');

        return (
            <View testID="option-grid">
                {options.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => onSelect(option.value)}
                        testID={`option-${option.value}`}
                    >
                        <Text>{`${option.label}${option.value === selected ? ' (selected)' : ''}`}</Text>
                    </Pressable>
                ))}
            </View>
        );
    },
}));

jest.mock('@/components/wizard/ClassAllocationRow', () => ({
    __esModule: true,
    default: ({
        classRow,
        index,
        isStartingClass,
        onLayout,
    }: {
        classRow: { classId: string };
        index: number;
        isStartingClass: boolean;
        onLayout?: (event: unknown) => void;
    }) => {
        const { Text, View } = require('react-native');

        return (
            <View onLayout={onLayout} testID={`class-allocation-row-${index}`}>
                <Text testID="class-allocation-row">
                    {`${index}:${classRow.classId}:${isStartingClass ? 'starting' : 'not-starting'}`}
                </Text>
            </View>
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
        mockScrollTo.mockClear();
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

    it('scrolls to the newly added class row instead of the top of the page', () => {
        useCharacterDraft.mockImplementation(() => {
            const [draft, setDraft] = React.useState({
                level: 3,
                classes: [
                    { classId: 'wizard', level: 1, subclassId: '' },
                ],
                startingClassId: 'wizard',
            });

            return {
                draft,
                updateDraft: (nextDraft: Partial<typeof draft>) => {
                    mockUpdateDraft(nextDraft);
                    setDraft((currentDraft) => ({ ...currentDraft, ...nextDraft }));
                },
            };
        });

        renderScreen();

        // Enter multiclass mode first (single-class mode doesn't show add-class buttons)
        fireEvent.press(screen.getByText('Choose additional classes'));

        fireEvent.press(screen.getByTestId('add-class-fighter'));
        fireEvent(screen.getByTestId('class-allocation-row-1'), 'layout', {
            nativeEvent: {
                layout: {
                    y: 240,
                },
            },
        });

        expect(mockScrollTo).toHaveBeenCalledWith({ y: 240, animated: true });
    });
});
