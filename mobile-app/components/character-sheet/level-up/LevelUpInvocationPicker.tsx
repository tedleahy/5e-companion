import {
    SRD_INVOCATIONS,
    checkInvocationPrerequisite,
} from '@/lib/characterLevelUp/advancedClassChoices';
import type { SrdInvocation } from '@/lib/characterLevelUp/advancedClassChoices';
import type {
    InvocationPrerequisiteContext,
    LevelUpInvocationState,
} from '@/lib/characterLevelUp/types';
import OptionPickerList from './OptionPickerList';

type LevelUpInvocationPickerProps = {
    gainCount: number;
    state: LevelUpInvocationState;
    prerequisiteContext: InvocationPrerequisiteContext | null;
    onToggle: (invocationId: string) => void;
    onChangeCustom: (custom: { name: string; description: string } | null) => void;
};

/**
 * Picker for selecting new warlock Eldritch Invocations from the SRD list
 * plus a custom entry option.
 */
export default function LevelUpInvocationPicker({
    gainCount,
    state,
    prerequisiteContext,
    onToggle,
    onChangeCustom,
}: LevelUpInvocationPickerProps) {
    function getPrerequisite(invocation: SrdInvocation) {
        if (!prerequisiteContext || !invocation.prerequisite) return null;
        const result = checkInvocationPrerequisite(invocation.prerequisite, prerequisiteContext);
        return {
            text: invocation.prerequisite,
            met: result.met,
            reason: result.reason,
        };
    }

    return (
        <OptionPickerList
            title="Choose Eldritch Invocations"
            gainCount={gainCount}
            options={SRD_INVOCATIONS}
            selectedIds={state.selectedInvocations}
            onToggle={onToggle}
            customEntry={state.customInvocation}
            onChangeCustom={onChangeCustom}
            testIdPrefix="level-up-invocation"
            addCustomLabel="+ Custom Invocation"
            customNameLabel="Invocation name"
            customDescriptionLabel="Description"
            removeCustomLabel="Remove custom invocation"
            getPrerequisite={getPrerequisite}
        />
    );
}
