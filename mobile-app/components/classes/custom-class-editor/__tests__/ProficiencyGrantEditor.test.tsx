import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { createDraft } from '../draft';
import ProficiencyGrantEditor from '../ProficiencyGrantEditor';
import type { Draft } from '../types';
import { CUSTOM_CLASS_PROFICIENCY_MAX_COUNT } from '../limits';

const options = [
    { value: 'skill-athletics', name: 'Athletics', type: 'SKILL', isCustom: false },
    { value: 'skill-acrobatics', name: 'Acrobatics', type: 'SKILL', isCustom: false },
    { value: 'light-armor', name: 'Light Armor', type: 'ARMOR', isCustom: false },
];

function EditorHarness({
    initialDraft = createDraft(),
    onDraftChange,
}: {
    initialDraft?: Draft;
    onDraftChange?: (draft: Draft) => void;
}) {
    const [draft, setDraft] = useState(initialDraft);

    return (
        <PaperProvider>
            <ProficiencyGrantEditor
                grant="STARTING"
                draft={draft}
                options={options}
                locked={false}
                onChange={(patch) => {
                    setDraft((current) => {
                        const next = { ...current, ...patch };
                        onDraftChange?.(next);
                        return next;
                    });
                }}
            />
        </PaperProvider>
    );
}

describe('ProficiencyGrantEditor', () => {
    test('hides and keeps a choice pool when the toggle is turned off then on', () => {
        const drafts: Draft[] = [];
        render(
            <EditorHarness
                initialDraft={{
                    ...createDraft(),
                    proficiencies: [
                        { value: 'skill-athletics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
                        { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
                    ],
                }}
                onDraftChange={(draft) => drafts.push(draft)}
            />,
        );

        expect(screen.getByText('Athletics')).toBeTruthy();
        expect(screen.getByText('Acrobatics')).toBeTruthy();

        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-SKILL'));
        const cleared = drafts.at(-1);
        expect(cleared?.proficiencies.some((item) => item.choiceGroup != null)).toBe(false);
        expect(screen.queryByText('Player chooses')).toBeNull();

        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-SKILL'));
        const restored = drafts.at(-1);
        expect(restored?.proficiencies.map((item) => item.value).sort()).toEqual([
            'skill-acrobatics',
            'skill-athletics',
        ]);
        expect(screen.getByText('Player chooses')).toBeTruthy();
    });

    test('keeps granted and choice lists from overlapping via the picker exclusions', () => {
        render(
            <EditorHarness
                initialDraft={{
                    ...createDraft(),
                    proficiencies: [
                        { value: 'light-armor', grant: 'STARTING', choiceGroup: null, choiceCount: null },
                    ],
                }}
            />,
        );

        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-ARMOR'));
        fireEvent.press(screen.getByTestId('add-choice-STARTING-ARMOR'));

        expect(screen.getByTestId('proficiency-picker-sheet')).toBeTruthy();
        expect(screen.queryByTestId('proficiency-option-light-armor')).toBeNull();
    });

    test('persists an enabled empty pool across remount', () => {
        let latest = createDraft();
        const view = render(
            <EditorHarness onDraftChange={(draft) => { latest = draft; }} />,
        );

        fireEvent.press(screen.getByLabelText(/Skills\./));
        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-SKILL'));
        expect(screen.getByText('Player chooses')).toBeTruthy();
        expect(latest.proficiencyChoiceUi.STARTING.SKILL?.enabled).toBe(true);
        expect(latest.proficiencyChoiceUi.STARTING.SKILL?.pool?.values).toEqual([]);

        view.unmount();
        render(<EditorHarness initialDraft={latest} />);

        expect(screen.getByText('Player chooses')).toBeTruthy();
    });

    test('restores a stashed pool across remount with a fresh id when preferred is occupied', () => {
        let latest: Draft = {
            ...createDraft(),
            proficiencies: [
                { value: 'skill-athletics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
                { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
            ],
        };
        const view = render(
            <EditorHarness
                initialDraft={latest}
                onDraftChange={(draft) => { latest = draft; }}
            />,
        );

        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-SKILL'));
        expect(latest.proficiencyChoiceUi.STARTING.SKILL?.enabled).toBe(false);
        expect(latest.proficiencyChoiceUi.STARTING.SKILL?.stash?.choiceGroup).toBe(1);

        // Another category now occupies the preferred group id.
        latest = {
            ...latest,
            proficiencies: [
                { value: 'light-armor', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
            ],
        };

        view.unmount();
        const remounted: Draft[] = [];
        render(
            <EditorHarness
                initialDraft={latest}
                onDraftChange={(draft) => remounted.push(draft)}
            />,
        );

        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-SKILL'));
        const restored = remounted.at(-1);
        expect(restored?.proficiencies.filter((item) => item.choiceGroup != null)).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ value: 'skill-athletics', choiceGroup: 2 }),
                expect.objectContaining({ value: 'skill-acrobatics', choiceGroup: 2 }),
            ]),
        );
        expect(restored?.proficiencies.some((item) => item.value === 'light-armor' && item.choiceGroup === 1))
            .toBe(true);
    });

    test('blocks adding another proficiency when the shared class-wide cap is already reached', () => {
        const fillerOptions = Array.from({ length: CUSTOM_CLASS_PROFICIENCY_MAX_COUNT }, (_, index) => ({
            value: `other-prof-${index}`,
            name: `Other ${index}`,
            type: 'OTHER',
            isCustom: false,
        }));
        const allOptions = [
            ...fillerOptions,
            { value: 'light-armor', name: 'Light Armor', type: 'ARMOR', isCustom: false },
            { value: 'skill-athletics', name: 'Athletics', type: 'SKILL', isCustom: false },
        ];
        let latest: Draft = {
            ...createDraft(),
            proficiencies: fillerOptions.map((option) => ({
                value: option.value,
                grant: 'STARTING' as const,
                choiceGroup: null,
                choiceCount: null,
            })),
        };

        render(
            <PaperProvider>
                <ProficiencyGrantEditor
                    grant="STARTING"
                    draft={latest}
                    options={allOptions}
                    locked={false}
                    onChange={(patch) => {
                        latest = { ...latest, ...patch };
                    }}
                />
            </PaperProvider>,
        );

        fireEvent.press(screen.getByLabelText(/Armor\./));
        // Armor may already be open when it has grants; ensure the add control is visible.
        if (!screen.queryByTestId('add-fixed-STARTING-ARMOR')) {
            fireEvent.press(screen.getByLabelText(/Armor\./));
        }
        fireEvent.press(screen.getByTestId('add-fixed-STARTING-ARMOR'));

        expect(screen.getByTestId('proficiency-picker-sheet')).toBeTruthy();
        expect(screen.getByTestId('proficiency-picker-limit-hint')).toBeTruthy();
        expect(screen.getByTestId('proficiency-option-light-armor').props.accessibilityState).toEqual(
            expect.objectContaining({ disabled: true }),
        );

        fireEvent.press(screen.getByTestId('proficiency-option-light-armor'));
        fireEvent.press(screen.getByTestId('proficiency-picker-confirm'));

        expect(latest.proficiencies).toHaveLength(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT);
        expect(latest.proficiencies.some((item) => item.value === 'light-armor')).toBe(false);
    });

    test('allows removing and replacing a proficiency while at the shared cap', () => {
        const fillerCount = CUSTOM_CLASS_PROFICIENCY_MAX_COUNT - 1;
        const fillerOptions = Array.from({ length: fillerCount }, (_, index) => ({
            value: `other-prof-${index}`,
            name: `Other ${index}`,
            type: 'OTHER',
            isCustom: false,
        }));
        const allOptions = [
            ...fillerOptions,
            { value: 'light-armor', name: 'Light Armor', type: 'ARMOR', isCustom: false },
            { value: 'medium-armor', name: 'Medium Armor', type: 'ARMOR', isCustom: false },
        ];
        let latest: Draft = {
            ...createDraft(),
            proficiencies: [
                ...fillerOptions.map((option) => ({
                    value: option.value,
                    grant: 'STARTING' as const,
                    choiceGroup: null,
                    choiceCount: null,
                })),
                {
                    value: 'light-armor',
                    grant: 'STARTING',
                    choiceGroup: null,
                    choiceCount: null,
                },
            ],
        };

        function Harness() {
            const [draft, setDraft] = useState(latest);
            return (
                <PaperProvider>
                    <ProficiencyGrantEditor
                        grant="STARTING"
                        draft={draft}
                        options={allOptions}
                        locked={false}
                        onChange={(patch) => {
                            setDraft((current) => {
                                const next = { ...current, ...patch };
                                latest = next;
                                return next;
                            });
                        }}
                    />
                </PaperProvider>
            );
        }

        render(<Harness />);

        const armorHeader = screen.getByLabelText(/Armor\./);
        if (!armorHeader.props.accessibilityState?.expanded) {
            fireEvent.press(armorHeader);
        }
        expect(screen.getByTestId('fixed-proficiency-STARTING-light-armor')).toBeTruthy();
        fireEvent.press(screen.getByTestId('add-fixed-STARTING-ARMOR'));

        // Deselect the current grant, then select a replacement — stays at the cap.
        fireEvent.press(screen.getByTestId('proficiency-option-light-armor'));
        fireEvent.press(screen.getByTestId('proficiency-option-medium-armor'));
        fireEvent.press(screen.getByTestId('proficiency-picker-confirm'));

        expect(latest.proficiencies).toHaveLength(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT);
        expect(latest.proficiencies.some((item) => item.value === 'light-armor')).toBe(false);
        expect(latest.proficiencies.some((item) => item.value === 'medium-armor')).toBe(true);

        fireEvent.press(screen.getByLabelText('Remove Medium Armor'));
        expect(latest.proficiencies).toHaveLength(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT - 1);
        expect(latest.proficiencies.some((item) => item.value === 'medium-armor')).toBe(false);
    });

    test('blocks choice-pool adds that would exceed the shared proficiency cap', () => {
        const fillerOptions = Array.from({ length: CUSTOM_CLASS_PROFICIENCY_MAX_COUNT }, (_, index) => ({
            value: `other-prof-${index}`,
            name: `Other ${index}`,
            type: 'OTHER',
            isCustom: false,
        }));
        const allOptions = [
            ...fillerOptions,
            { value: 'skill-athletics', name: 'Athletics', type: 'SKILL', isCustom: false },
            { value: 'skill-acrobatics', name: 'Acrobatics', type: 'SKILL', isCustom: false },
        ];
        let latest: Draft = {
            ...createDraft(),
            proficiencies: fillerOptions.map((option) => ({
                value: option.value,
                grant: 'STARTING' as const,
                choiceGroup: null,
                choiceCount: null,
            })),
        };

        function Harness() {
            const [draft, setDraft] = useState(latest);
            return (
                <PaperProvider>
                    <ProficiencyGrantEditor
                        grant="STARTING"
                        draft={draft}
                        options={allOptions}
                        locked={false}
                        onChange={(patch) => {
                            setDraft((current) => {
                                const next = { ...current, ...patch };
                                latest = next;
                                return next;
                            });
                        }}
                    />
                </PaperProvider>
            );
        }

        render(<Harness />);

        fireEvent.press(screen.getByLabelText(/Skills\./));
        fireEvent.press(screen.getByTestId('toggle-choice-STARTING-SKILL'));
        fireEvent.press(screen.getByTestId('add-choice-STARTING-SKILL'));

        expect(screen.getByTestId('proficiency-picker-limit-hint')).toBeTruthy();
        fireEvent.press(screen.getByTestId('proficiency-option-skill-athletics'));
        fireEvent.press(screen.getByTestId('proficiency-picker-confirm'));

        expect(latest.proficiencies).toHaveLength(CUSTOM_CLASS_PROFICIENCY_MAX_COUNT);
        expect(latest.proficiencies.some((item) => item.choiceGroup != null)).toBe(false);
    });
});
