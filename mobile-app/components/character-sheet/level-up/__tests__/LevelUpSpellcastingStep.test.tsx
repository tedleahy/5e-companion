import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import LevelUpSpellcastingStep from '../LevelUpSpellcastingStep';
import type {
    LevelUpSpellcastingState,
    LevelUpSpellcastingSummary,
    LevelUpWizardSelectedClass,
} from '@/lib/characterLevelUp/types';

const mockAddSpellSheetSpy = jest.fn();

jest.mock('@/components/character-sheet/spells/AddSpellSheet', () => ({
    __esModule: true,
    default: (props: unknown) => {
        mockAddSpellSheetSpy(props);
        return null;
    },
}));

const SELECTED_CLASS: LevelUpWizardSelectedClass = {
    classId: 'wizard',
    className: 'Wizard',
    currentLevel: 2,
    newLevel: 3,
    isExistingClass: true,
    subclassId: null,
    subclassName: null,
    subclassDescription: null,
    subclassIsCustom: false,
    subclassFeatures: [],
    customSubclass: null,
};

const SPELLCASTING_SUMMARY: LevelUpSpellcastingSummary = {
    mode: 'wizard',
    hasChanges: true,
    slotComparisons: [],
    previousMaxSpellLevel: 1,
    nextMaxSpellLevel: 2,
    newSpellLevelUnlocked: true,
    previousKnownSpells: null,
    nextKnownSpells: null,
    learnedSpellCount: 2,
    previousPreparedSpellLimit: null,
    nextPreparedSpellLimit: null,
    previousCantripsKnown: 3,
    nextCantripsKnown: 3,
    cantripCountGain: 0,
    eligibleSpellLevels: [1, 2],
    currentKnownSpells: [],
    currentKnownSpellIds: [],
};

const SPELLCASTING_STATE: LevelUpSpellcastingState = {
    learnedSpells: [],
    cantripSpells: [],
    swapOutSpellId: null,
    swapReplacementSpell: null,
};

/**
 * Renders the spellcasting level-up step with default wizard props.
 */
function renderStep() {
    return render(
        <PaperProvider>
            <LevelUpSpellcastingStep
                selectedClass={SELECTED_CLASS}
                spellcastingSummary={SPELLCASTING_SUMMARY}
                spellcastingState={SPELLCASTING_STATE}
                onAddLearnedSpell={jest.fn()}
                onRemoveLearnedSpell={jest.fn()}
                onAddCantripSpell={jest.fn()}
                onRemoveCantripSpell={jest.fn()}
                onSetSwapOutSpellId={jest.fn()}
                onSetSwapReplacementSpell={jest.fn()}
            />
        </PaperProvider>,
    );
}

describe('LevelUpSpellcastingStep', () => {
    beforeEach(() => {
        mockAddSpellSheetSpy.mockClear();
    });

    it('passes the wizard learned-spell cap into the add-spell sheet', () => {
        renderStep();

        fireEvent.press(screen.getByText('+ Choose 2 New Spells'));

        expect(mockAddSpellSheetSpy).toHaveBeenLastCalledWith(expect.objectContaining({
            visible: true,
            selectionLimit: 2,
            title: 'Choose Spell',
            forcedFilters: {
                classes: ['wizard'],
                levels: [1, 2],
            },
        }));
    });
});
