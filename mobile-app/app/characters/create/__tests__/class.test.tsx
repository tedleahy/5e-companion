import React from 'react';
import { fireEvent, render, screen, act } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import StepClass from '../class';

const mockUpdateDraft = jest.fn();
const mockScrollTo = jest.fn();

jest.mock('react-native', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    const actual = jest.requireActual('react-native');

    const ScrollView = React.forwardRef(({ children, ...props }: { children: React.ReactNode }, ref: React.Ref<any>) => {
        React.useImperativeHandle(ref, () => {
            return {
                scrollTo: (options: { y: number; animated: boolean }) => {
                    mockScrollTo(options);
                },
            };
        });

        return <actual.View {...props}>{children}</actual.View>;
    });
    ScrollView.displayName = 'ScrollView';

    const mockedReactNative = Object.create(actual);

    Object.defineProperty(mockedReactNative, 'ScrollView', {
        value: ScrollView,
    });

    return mockedReactNative;
});

jest.mock('@/store/characterDraft', () => ({
    useCharacterDraft: jest.fn(),
}));

jest.mock('@/hooks/useAvailableSubclasses', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        availableSubclasses: [],
        availableSubclassesByClassId: {},
        subclassOptionItemsByClassId: {
            wizard: [{ value: 'evocation', label: 'School of Evocation', icon: '\u{1F525}' }],
            rogue: [{ value: 'thief', label: 'Thief', icon: '\u{1F4B0}' }],
            fighter: [{ value: 'champion', label: 'Champion', icon: '\u{1F3C6}' }],
        },
        loading: false,
    })),
}));

jest.mock('@/components/wizard/OptionGrid', () => ({
    __esModule: true,
    default: ({
        options,
        selected,
        onSelect,
        getOptionTestId,
    }: {
        options: { value: string; label: string; icon: string }[];
        selected: string;
        onSelect: (value: string) => void;
        getOptionTestId?: (option: { value: string; label: string; icon: string }) => string | undefined;
    }) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Pressable, Text, View } = require('react-native');

        return (
            <View testID="option-grid">
                {options.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => onSelect(option.value)}
                        testID={getOptionTestId?.(option) ?? `option-${option.value}`}
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
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Text, View } = require('react-native');

        const handleLayout = (event: unknown) => {
            if (onLayout) {
                onLayout(event);
            }
        };

        return (
            <View onLayout={handleLayout} testID={`class-allocation-row-${index}`}>
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

    it('scrolls to the newly added class row instead of the top of the page', async () => {
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

        mockScrollTo.mockImplementation((options) => {
            // No-op implementation for testing
        });

        renderScreen();

        // Enter multiclass mode first (single-class mode doesn't show add-class buttons)
        await act(async () => {
            fireEvent.press(screen.getByText('Choose additional classes'));
        });

        await act(async () => {
            fireEvent.press(screen.getByTestId('add-class-fighter'));
        });

        // Wait for the new row to appear
        const newRow = screen.getByTestId('class-allocation-row-1');
        
        await act(async () => {
            fireEvent(newRow, 'layout', {
                nativeEvent: {
                    layout: {
                        y: 240,
                    },
                },
            });
        });

        expect(mockScrollTo).toHaveBeenCalledWith({ y: 240, animated: true });
    });
});
