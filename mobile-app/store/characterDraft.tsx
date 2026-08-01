import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ABILITY_KEYS, type AbilityKey } from '@/lib/characterSheetUtils';
import {
    normaliseStartingClassId,
    type CharacterClassDraft,
    type CreateClassPresentation,
} from '@/lib/characterCreation/multiclass';
import {
    getCreateFeatureChoiceGroups,
    reconcileCreateFeatureChoices,
} from '@/lib/srdFeatureChoices';
import {
    didClassCompositionChange,
    type DraftProficiencyChoice,
} from '@/lib/characterCreation/proficiencyChoiceDraft';

export type { CreateClassPresentation };
export {
    presentationClassLabel,
    presentationSavingThrows,
} from '@/lib/characterCreation/multiclass';

export type CharacterDraft = {
    name: string;
    race: string;
    classes: CharacterClassDraft[];
    featureChoices: Array<{
        parentSrdIndex: string;
        chosenChildSrdIndex: string;
    }>;
    startingClassId: string;
    level: number;
    abilityScores: Record<AbilityKey, number>;
    background: string;
    alignment: string | null;
    personalityTraits: string;
    ideals: string;
    bonds: string;
    flaws: string;
    /**
     * Generic proficiency picks keyed by `(classId, choiceGroup)`, including
     * SKILL and named groups. Values are proficiency identities (`srdIndex ?? id`).
     */
    proficiencyChoices: DraftProficiencyChoice[];
    /** Per-ability ASI points allocated from levelling. */
    asiAllocations: Record<AbilityKey, number>;
    /** Method used to determine ability scores. */
    abilityMode: 'roll' | 'pointBuy';
    /**
     * Presentation metadata keyed by class identity (`AvailableClass.value`),
     * captured when the user selects a class from `availableClasses`.
     */
    classPresentationById: Record<string, CreateClassPresentation>;
};

const DEFAULT_SCORES: Record<AbilityKey, number> = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
};

/**
 * Returns a fresh character draft for the create-character wizard.
 */
export function createDefaultDraft(): CharacterDraft {
    return {
        name: '',
        race: '',
        classes: [],
        featureChoices: [],
        startingClassId: '',
        level: 1,
        abilityScores: { ...DEFAULT_SCORES },
        background: '',
        alignment: null,
        personalityTraits: '',
        ideals: '',
        bonds: '',
        flaws: '',
        proficiencyChoices: [],
        asiAllocations: { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 },
        abilityMode: 'roll',
        classPresentationById: {},
    };
}

type DraftContextValue = {
    draft: CharacterDraft;
    updateDraft: (patch: Partial<CharacterDraft>) => void;
    setAbilityScore: (key: AbilityKey, value: number) => void;
    setAllAbilityScores: (scores: Record<AbilityKey, number>) => void;
    toggleProficiencyChoice: (
        classId: string,
        choiceGroup: number,
        value: string,
        maxChoices: number,
    ) => void;
    resetDraft: () => void;
    hasDraftData: () => boolean;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function CharacterDraftProvider({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState<CharacterDraft>(createDefaultDraft);

    const updateDraft = useCallback((patch: Partial<CharacterDraft>) => {
        setDraft((prev) => {
            const nextDraft = { ...prev, ...patch };

            if (patch.classes || patch.startingClassId !== undefined) {
                nextDraft.startingClassId = normaliseStartingClassId(
                    nextDraft.classes,
                    nextDraft.startingClassId,
                );
            }

            if (patch.classes || patch.featureChoices) {
                nextDraft.featureChoices = reconcileCreateFeatureChoices(
                    nextDraft.featureChoices,
                    getCreateFeatureChoiceGroups(nextDraft.classes),
                );
            }

            const compositionChanged = didClassCompositionChange(
                prev.classes,
                prev.startingClassId,
                nextDraft.classes,
                nextDraft.startingClassId,
            );
            if (compositionChanged && patch.proficiencyChoices === undefined) {
                nextDraft.proficiencyChoices = [];
            }

            return nextDraft;
        });
    }, []);

    const setAbilityScore = useCallback((key: AbilityKey, value: number) => {
        setDraft((prev) => ({
            ...prev,
            abilityScores: { ...prev.abilityScores, [key]: Math.max(1, Math.min(20, value)) },
        }));
    }, []);

    const setAllAbilityScores = useCallback((scores: Record<AbilityKey, number>) => {
        setDraft((prev) => ({ ...prev, abilityScores: scores }));
    }, []);

    const toggleProficiencyChoice = useCallback((
        classId: string,
        choiceGroup: number,
        value: string,
        maxChoices: number,
    ) => {
        setDraft((prev) => {
            const existing = prev.proficiencyChoices.find((entry) => (
                entry.classId === classId && entry.choiceGroup === choiceGroup
            ));
            const currentValues = existing?.values ?? [];
            const isSelected = currentValues.includes(value);
            const nextValues = isSelected
                ? currentValues.filter((entry) => entry !== value)
                : currentValues.length >= maxChoices
                    ? currentValues
                    : [...currentValues, value];

            const otherGroups = prev.proficiencyChoices.filter((entry) => (
                !(entry.classId === classId && entry.choiceGroup === choiceGroup)
            ));
            return {
                ...prev,
                proficiencyChoices: nextValues.length > 0
                    ? [...otherGroups, { classId, choiceGroup, values: nextValues }]
                    : otherGroups,
            };
        });
    }, []);

    const resetDraft = useCallback(() => {
        setDraft(createDefaultDraft());
    }, []);

    const hasDraftData = useCallback(() => {
        const d = draft;
        return (
            d.name.trim() !== '' ||
            d.race !== '' ||
            d.classes.some((classRow) => classRow.classId !== '') ||
            d.background !== '' ||
            d.proficiencyChoices.length > 0 ||
            ABILITY_KEYS.some((k) => d.abilityScores[k] !== 10)
        );
    }, [draft]);

    const value = useMemo<DraftContextValue>(
        () => ({
            draft,
            updateDraft,
            setAbilityScore,
            setAllAbilityScores,
            toggleProficiencyChoice,
            resetDraft,
            hasDraftData,
        }),
        [draft, updateDraft, setAbilityScore, setAllAbilityScores, toggleProficiencyChoice, resetDraft, hasDraftData],
    );

    return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useCharacterDraft(): DraftContextValue {
    const ctx = useContext(DraftContext);
    if (!ctx) throw new Error('useCharacterDraft must be used within CharacterDraftProvider');
    return ctx;
}
