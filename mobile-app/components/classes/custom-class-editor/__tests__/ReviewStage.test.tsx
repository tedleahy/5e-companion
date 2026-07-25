import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { createDraft, newEquipmentKey } from '../draft';
import ReviewStage, {
    formatAbilityList,
    formatAsiLevels,
    formatEquipmentSummary,
    formatMulticlassPrerequisites,
    formatNamedCountList,
    formatProficiencyGrantSummary,
    formatSpellcastingMode,
} from '../ReviewStage';
import type { Draft } from '../types';

/**
 * Renders ReviewStage with optional draft overrides.
 */
function renderReview(overrides: Partial<Draft> = {}, locked = false) {
    const draft: Draft = {
        ...createDraft(),
        name: 'Arcane Warden',
        description: 'A spellcasting guardian.',
        hitDie: 10,
        primaryAbilityIndexes: ['str', 'wis'],
        savingThrowIndexes: ['str', 'wis'],
        ...overrides,
    };
    const onJumpToStage = jest.fn();

    render(
        <PaperProvider>
            <ReviewStage draft={draft} locked={locked} onJumpToStage={onJumpToStage} />
        </PaperProvider>,
    );

    return { draft, onJumpToStage };
}

describe('ReviewStage summary helpers', () => {
    test('formats abilities, prerequisites, grants, equipment, ASI, and spell mode', () => {
        const draft: Draft = {
            ...createDraft(),
            primaryAbilityIndexes: ['str', 'wis'],
            multiclassPrerequisites: [
                { abilityIndex: 'str', minimum: 13, group: 0 },
                { abilityIndex: 'dex', minimum: 13, group: 0 },
            ],
            proficiencies: [
                { value: 'skill-athletics', grant: 'STARTING', choiceGroup: null, choiceCount: null },
                { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
                { value: 'skill-stealth', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
                { value: 'armor-light', grant: 'MULTICLASS', choiceGroup: null, choiceCount: null },
            ],
            equipment: [
                { key: newEquipmentKey(), name: 'Longsword', quantity: 1, choiceGroup: null, choiceCount: null },
                { key: newEquipmentKey(), name: 'Mace', quantity: 1, choiceGroup: 1, choiceCount: 1 },
                { key: newEquipmentKey(), name: 'Warhammer', quantity: 1, choiceGroup: 1, choiceCount: 1 },
            ],
            spellcastingMode: 'PACT_MAGIC',
            progression: createDraft().progression.map((level) => ({
                ...level,
                abilityScoreImprovement: [4, 8, 12].includes(level.level),
            })),
        };

        expect(formatAbilityList(draft.primaryAbilityIndexes)).toBe('STR, WIS');
        expect(formatAbilityList([])).toBe('None');
        expect(formatMulticlassPrerequisites(draft)).toBe('STR 13 · DEX 13');
        expect(formatMulticlassPrerequisites(createDraft())).toBe('None');
        expect(formatProficiencyGrantSummary(draft, 'STARTING')).toBe(
            'skill-athletics · Choose 1 of skill-acrobatics, skill-stealth',
        );
        expect(formatProficiencyGrantSummary(draft, 'MULTICLASS')).toBe('armor-light');
        expect(formatProficiencyGrantSummary(createDraft(), 'STARTING')).toBe('None');
        expect(formatProficiencyGrantSummary({
            ...createDraft(),
            proficiencies: [
                { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
            ],
        }, 'STARTING')).toBe('Choose 1 of skill-acrobatics');
        expect(formatEquipmentSummary(draft)).toBe('1× Longsword · Choose 1 of 1× Mace, 1× Warhammer');
        expect(formatEquipmentSummary(createDraft())).toBe('None');
        expect(formatAsiLevels(draft)).toBe('4, 8, 12');
        expect(formatAsiLevels(createDraft())).toBe('None');
        expect(formatSpellcastingMode('PACT_MAGIC')).toBe('PACT MAGIC');
        expect(formatSpellcastingMode('NONE')).toBe('NONE');
        expect(formatNamedCountList(['Ward', 'Smite'])).toBe('2 · Ward, Smite');
        expect(formatNamedCountList([])).toBe('None');
    });
});

describe('ReviewStage', () => {
    test('renders sectioned summary content for identity through features', () => {
        renderReview({
            multiclassPrerequisites: [{ abilityIndex: 'str', minimum: 13, group: 0 }],
            proficiencies: [
                { value: 'skill-athletics', grant: 'STARTING', choiceGroup: null, choiceCount: null },
                { value: 'armor-light', grant: 'MULTICLASS', choiceGroup: null, choiceCount: null },
                { value: 'armor-medium', grant: 'MULTICLASS', choiceGroup: null, choiceCount: null },
            ],
            equipment: [
                {
                    key: newEquipmentKey(),
                    name: 'Shield',
                    quantity: 1,
                    choiceGroup: null,
                    choiceCount: null,
                },
                {
                    key: newEquipmentKey(),
                    name: 'Mace',
                    quantity: 1,
                    choiceGroup: 1,
                    choiceCount: 1,
                },
                {
                    key: newEquipmentKey(),
                    name: 'Warhammer',
                    quantity: 1,
                    choiceGroup: 1,
                    choiceCount: 1,
                },
            ],
            spellcastingMode: 'STANDARD',
            spellcastingAbility: 'int',
            addSpellcastingAbility: true,
            progression: createDraft().progression.map((level) => ({
                ...level,
                abilityScoreImprovement: level.level === 4 || level.level === 8,
            })),
            features: [
                { key: 'f1', name: 'Ward', description: 'Protect allies.', level: 1 },
            ],
            spells: [{ id: 'spell-magic-missile', name: 'Magic Missile', level: 1 }],
        });

        expect(screen.getByTestId('custom-class-review')).toBeTruthy();
        expect(screen.getByText('Identity')).toBeTruthy();
        expect(screen.getByText('Arcane Warden')).toBeTruthy();
        expect(screen.getByText('A spellcasting guardian.')).toBeTruthy();
        expect(screen.getByText('d10')).toBeTruthy();
        expect(screen.getAllByText('STR, WIS')).toHaveLength(2);
        expect(screen.getByText('Proficiencies')).toBeTruthy();
        expect(screen.getByText('STR 13')).toBeTruthy();
        expect(screen.getByText('skill-athletics')).toBeTruthy();
        expect(screen.getByText('armor-light · armor-medium')).toBeTruthy();
        expect(screen.getByText('Equipment')).toBeTruthy();
        expect(screen.getByText('1× Shield · Choose 1 of 1× Mace, 1× Warhammer')).toBeTruthy();
        expect(screen.getByText('Progression')).toBeTruthy();
        expect(screen.getByText('STANDARD')).toBeTruthy();
        expect(screen.getByText('INT')).toBeTruthy();
        expect(screen.getByText('4, 8')).toBeTruthy();
        expect(screen.getByText('Features / Spells')).toBeTruthy();
        expect(screen.getByText('1 · Ward')).toBeTruthy();
        expect(screen.getByText('1 · Magic Missile')).toBeTruthy();
        expect(screen.getByText('Review all stages. Saving is available only here.')).toBeTruthy();
    });

    test('shows locked copy when mechanics are locked', () => {
        renderReview({}, true);

        expect(screen.getByText('Only descriptive fields will be updated.')).toBeTruthy();
        expect(screen.queryByText('Review all stages. Saving is available only here.')).toBeNull();
    });

    test('jumps to the matching prior stage when Edit is pressed', () => {
        const { onJumpToStage } = renderReview();

        fireEvent.press(screen.getByTestId('custom-class-review-jump-0'));
        fireEvent.press(screen.getByTestId('custom-class-review-jump-1'));
        fireEvent.press(screen.getByTestId('custom-class-review-jump-2'));
        fireEvent.press(screen.getByTestId('custom-class-review-jump-3'));
        fireEvent.press(screen.getByTestId('custom-class-review-jump-4'));

        expect(onJumpToStage.mock.calls).toEqual([[0], [1], [2], [3], [4]]);
    });

    test('omits spellcasting ability when mode is NONE', () => {
        renderReview({ spellcastingMode: 'NONE', spellcastingAbility: null });

        expect(screen.getByText('NONE')).toBeTruthy();
        expect(screen.queryByText('Spellcasting ability')).toBeNull();
    });
});
