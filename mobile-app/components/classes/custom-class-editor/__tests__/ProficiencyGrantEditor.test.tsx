import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { createDraft } from '../draft';
import ProficiencyGrantEditor from '../ProficiencyGrantEditor';
import type { Draft } from '../types';

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
});
