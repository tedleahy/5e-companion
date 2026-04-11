import { SRD_METAMAGIC_OPTIONS } from '@/lib/characterLevelUp/advancedClassChoices';
import type { LevelUpMetamagicState } from '@/lib/characterLevelUp/advancedClassChoices';
import OptionPickerList from './OptionPickerList';

type LevelUpMetamagicPickerProps = {
    gainCount: number;
    state: LevelUpMetamagicState;
    onToggle: (metamagicId: string) => void;
    onChangeCustom: (custom: { name: string; description: string } | null) => void;
};

/**
 * Picker for selecting sorcerer Metamagic options from the SRD list
 * plus a custom entry option.
 */
export default function LevelUpMetamagicPicker({
    gainCount,
    state,
    onToggle,
    onChangeCustom,
}: LevelUpMetamagicPickerProps) {
    return (
        <OptionPickerList
            title="Choose Metamagic"
            gainCount={gainCount}
            options={SRD_METAMAGIC_OPTIONS}
            selectedIds={state.selectedMetamagicIds}
            onToggle={onToggle}
            customEntry={state.customMetamagic}
            onChangeCustom={onChangeCustom}
            testIdPrefix="level-up-metamagic"
            addCustomLabel="+ Custom Metamagic"
            customNameLabel="Metamagic name"
            customDescriptionLabel="Description"
            removeCustomLabel="Remove custom metamagic"
        />
    );
}
