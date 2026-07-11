import {
    equipmentChoiceGroups,
    fixedEquipment,
    withEquipmentChoiceGroups,
    withFixedEquipment,
} from './draft';
import EquipmentEditor from './EquipmentEditor';
import type { StageProps } from './types';

/**
 * Equipment stage: starting equipment as fixed grants and choice groups.
 */
export default function EquipmentStage({ draft, locked, onChange }: StageProps) {
    return (
        <EquipmentEditor
            fixedItems={fixedEquipment(draft)}
            choiceGroups={equipmentChoiceGroups(draft)}
            locked={locked}
            onChangeFixed={(items) => onChange({ equipment: withFixedEquipment(draft, items) })}
            onChangeChoiceGroups={(groups) =>
                onChange({ equipment: withEquipmentChoiceGroups(draft, groups) })
            }
        />
    );
}
