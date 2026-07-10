import { formatProficiencies, parseProficiencies } from './draft';
import { Field } from './fields';
import type { StageProps } from './types';

/**
 * Proficiencies stage: multiclass prerequisites and starting/multiclass proficiency grants.
 */
export default function ProficienciesStage({ draft, locked, onChange }: StageProps) {
    return (
        <>
            <Field
                label="Multiclass prerequisites"
                helper="One per line: ability:minimum:group (for example str:13:1)"
                editable={!locked}
                value={draft.multiclassPrerequisites
                    .map((item) => `${item.abilityIndex}:${item.minimum}:${item.group}`)
                    .join('\n')}
                multiline
                onChangeText={(text) =>
                    onChange({
                        multiclassPrerequisites: text
                            .split('\n')
                            .filter(Boolean)
                            .map((line) => {
                                const [abilityIndex, minimum, group] = line.split(':');
                                return {
                                    abilityIndex: abilityIndex?.trim() ?? '',
                                    minimum: Number(minimum),
                                    group: Number(group),
                                };
                            }),
                    })
                }
            />
            <Field
                label="Starting proficiencies"
                helper="Comma-separated proficiency values. Use value|group|count for a choice."
                editable={!locked}
                value={formatProficiencies(draft, 'STARTING')}
                multiline
                onChangeText={(text) =>
                    onChange({
                        proficiencies: [
                            ...draft.proficiencies.filter((item) => item.grant !== 'STARTING'),
                            ...parseProficiencies(text, 'STARTING'),
                        ],
                    })
                }
            />
            <Field
                label="Multiclass proficiencies"
                helper="Comma-separated proficiency values."
                editable={!locked}
                value={formatProficiencies(draft, 'MULTICLASS')}
                multiline
                onChangeText={(text) =>
                    onChange({
                        proficiencies: [
                            ...draft.proficiencies.filter((item) => item.grant !== 'MULTICLASS'),
                            ...parseProficiencies(text, 'MULTICLASS'),
                        ],
                    })
                }
            />
        </>
    );
}
