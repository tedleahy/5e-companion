import { Field } from './fields';
import type { StageProps } from './types';

/**
 * Equipment stage: starting equipment as pipe-delimited lines.
 */
export default function EquipmentStage({ draft, locked, onChange }: StageProps) {
    return (
        <Field
            label="Starting equipment"
            helper="One per line: name|quantity|choice group|choice count. Choice fields may be blank."
            editable={!locked}
            value={draft.equipment
                .map(
                    (item) =>
                        `${item.name}|${item.quantity}|${item.choiceGroup ?? ''}|${item.choiceCount ?? ''}`,
                )
                .join('\n')}
            multiline
            onChangeText={(text) =>
                onChange({
                    equipment: text
                        .split('\n')
                        .filter(Boolean)
                        .map((line) => {
                            const [name, quantity, group, count] = line.split('|');
                            return {
                                name: name?.trim() ?? '',
                                quantity: Number(quantity || 1),
                                choiceGroup: group ? Number(group) : null,
                                choiceCount: count ? Number(count) : null,
                            };
                        }),
                })
            }
        />
    );
}
