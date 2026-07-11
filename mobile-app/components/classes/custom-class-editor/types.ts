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
export type Draft = Omit<ManagedCustomClassInput, 'progression' | 'features' | 'equipment'> & {
    progression: DraftLevel[];
    features: DraftFeature[];
    equipment: DraftEquipment[];
};

export type IdentityFieldErrors = {
    name?: string;
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
