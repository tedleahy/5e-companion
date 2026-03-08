import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ABILITY_KEYS, type AbilityKey, type SkillKey } from '@/lib/characterSheetUtils';

export type CharacterDraft = {
    name: string;
    race: string;
    class: string;
    level: number;
    abilityScores: Record<AbilityKey, number>;
    background: string;
    alignment: string | null;
    personalityTraits: string;
    ideals: string;
    bonds: string;
    flaws: string;
    skillProficiencies: SkillKey[];
};

const DEFAULT_SCORES: Record<AbilityKey, number> = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
};

function createDefaultDraft(): CharacterDraft {
    return {
        name: '',
        race: '',
        class: '',
        level: 1,
        abilityScores: { ...DEFAULT_SCORES },
        background: '',
        alignment: null,
        personalityTraits: '',
        ideals: '',
        bonds: '',
        flaws: '',
        skillProficiencies: [],
    };
}

type DraftContextValue = {
    draft: CharacterDraft;
    updateDraft: (patch: Partial<CharacterDraft>) => void;
    setAbilityScore: (key: AbilityKey, value: number) => void;
    setAllAbilityScores: (scores: Record<AbilityKey, number>) => void;
    toggleSkillProficiency: (key: SkillKey) => void;
    resetDraft: () => void;
    hasDraftData: () => boolean;
};

const DraftContext = createContext<DraftContextValue | null>(null);

export function CharacterDraftProvider({ children }: { children: ReactNode }) {
    const [draft, setDraft] = useState<CharacterDraft>(createDefaultDraft);

    const updateDraft = useCallback((patch: Partial<CharacterDraft>) => {
        setDraft((prev) => ({ ...prev, ...patch }));
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

    const toggleSkillProficiency = useCallback((key: SkillKey) => {
        setDraft((prev) => {
            const has = prev.skillProficiencies.includes(key);
            return {
                ...prev,
                skillProficiencies: has
                    ? prev.skillProficiencies.filter((k) => k !== key)
                    : [...prev.skillProficiencies, key],
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
            d.class !== '' ||
            d.background !== '' ||
            d.skillProficiencies.length > 0 ||
            ABILITY_KEYS.some((k) => d.abilityScores[k] !== 10)
        );
    }, [draft]);

    const value = useMemo<DraftContextValue>(
        () => ({
            draft,
            updateDraft,
            setAbilityScore,
            setAllAbilityScores,
            toggleSkillProficiency,
            resetDraft,
            hasDraftData,
        }),
        [draft, updateDraft, setAbilityScore, setAllAbilityScores, toggleSkillProficiency, resetDraft, hasDraftData],
    );

    return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useCharacterDraft(): DraftContextValue {
    const ctx = useContext(DraftContext);
    if (!ctx) throw new Error('useCharacterDraft must be used within CharacterDraftProvider');
    return ctx;
}
