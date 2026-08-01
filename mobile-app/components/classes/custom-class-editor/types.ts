import type { ClassDetailsFieldsFragment, ManagedCustomClassInput } from '@/types/generated_graphql_types';

export const STAGES = ['Identity', 'Proficiencies', 'Equipment', 'Progression', 'Features', 'Review'] as const;

export const ABILITIES = [
    { value: 'str', label: 'STR' },
    { value: 'dex', label: 'DEX' },
    { value: 'con', label: 'CON' },
    { value: 'int', label: 'INT' },
    { value: 'wis', label: 'WIS' },
    { value: 'cha', label: 'CHA' },
] as const;

export type DraftLevel = ManagedCustomClassInput['progression'][number];
export type DraftFeature = ManagedCustomClassInput['features'][number] & { key: string };
export type DraftEquipment = ManagedCustomClassInput['equipment'][number] & { key: string };
/** Selected class-list spell kept with display fields for the features-stage picker. */
export type DraftSpell = {
    id: string;
    name: string;
    level: number;
};

/** In-progress or stashed proficiency choice pool (may be empty while enabled). */
export type DraftChoicePool = {
    choiceGroup?: number;
    choiceCount: number;
    values: string[];
};

/** Per-category choice-toggle / stash state for one grant tab. */
export type DraftCategoryChoiceUi = {
    enabled: boolean;
    pool?: DraftChoicePool;
    stash?: DraftChoicePool;
};

export type ProficiencyCategoryType = 'ARMOR' | 'WEAPON' | 'SKILL' | 'TOOL' | 'OTHER';

/** Client-only proficiency choice editor state keyed by grant then category. */
export type DraftProficiencyChoiceUi = {
    STARTING: Partial<Record<ProficiencyCategoryType, DraftCategoryChoiceUi>>;
    MULTICLASS: Partial<Record<ProficiencyCategoryType, DraftCategoryChoiceUi>>;
};

export type Draft = Omit<ManagedCustomClassInput, 'progression' | 'features' | 'equipment' | 'spellIds'> & {
    progression: DraftLevel[];
    features: DraftFeature[];
    equipment: DraftEquipment[];
    spells: DraftSpell[];
    /** Transient choice-pool editing state; stripped on serialise. */
    proficiencyChoiceUi: DraftProficiencyChoiceUi;
};

export type IdentityFieldErrors = {
    name?: string;
    emoji?: string;
    description?: string;
    primaryAbilities?: string;
    savingThrows?: string;
};

export type CustomClassEditorProps = {
    visible: boolean;
    initial?: ClassDetailsFieldsFragment | null;
    onClose: () => void;
    onSaved?: () => void;
};

export type StageProps = {
    draft: Draft;
    locked: boolean;
    onChange: (patch: Partial<Draft>) => void;
};

export type IdentityStageProps = StageProps & {
    errors?: IdentityFieldErrors;
};

/** Stage indexes Review can jump back to (everything except Review itself). */
export type EditableStageIndex = 0 | 1 | 2 | 3 | 4;
