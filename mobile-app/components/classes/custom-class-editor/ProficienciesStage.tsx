import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import { GET_PROFICIENCIES } from '@/graphql/class.operations';
import type { ProficienciesQuery } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    fixedProficiencyValues,
    proficiencyChoiceGroups,
    withChoiceGroups,
    withFixedProficiencies,
} from './draft';
import PrerequisiteBuilder from './PrerequisiteBuilder';
import ProficiencyGrantEditor from './ProficiencyGrantEditor';
import type { StageProps } from './types';

/**
 * Proficiencies stage: multiclass prerequisites and starting/multiclass proficiency grants.
 */
export default function ProficienciesStage({ draft, locked, onChange }: StageProps) {
    const { data, loading, error } = useQuery<ProficienciesQuery>(GET_PROFICIENCIES);

    const options = useMemo(
        () =>
            (data?.proficiencies ?? []).filter((item) => item.type !== 'SAVING_THROW'),
        [data?.proficiencies],
    );

    if (loading && !data) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={fantasyTokens.colors.claret} />
            </View>
        );
    }

    if (error) {
        return (
            <Text style={styles.error}>
                Could not load proficiency options. Check your connection and try again.
            </Text>
        );
    }

    return (
        <>
            <PrerequisiteBuilder
                value={draft.multiclassPrerequisites}
                locked={locked}
                onChange={(multiclassPrerequisites) => onChange({ multiclassPrerequisites })}
            />
            <ProficiencyGrantEditor
                label="Starting proficiencies"
                grant="STARTING"
                fixedValues={fixedProficiencyValues(draft, 'STARTING')}
                choiceGroups={proficiencyChoiceGroups(draft, 'STARTING')}
                options={options}
                locked={locked}
                onChangeFixed={(values) =>
                    onChange({ proficiencies: withFixedProficiencies(draft, 'STARTING', values) })
                }
                onChangeChoiceGroups={(groups) =>
                    onChange({ proficiencies: withChoiceGroups(draft, 'STARTING', groups) })
                }
            />
            <ProficiencyGrantEditor
                label="Multiclass proficiencies"
                grant="MULTICLASS"
                fixedValues={fixedProficiencyValues(draft, 'MULTICLASS')}
                choiceGroups={proficiencyChoiceGroups(draft, 'MULTICLASS')}
                options={options}
                locked={locked}
                onChangeFixed={(values) =>
                    onChange({ proficiencies: withFixedProficiencies(draft, 'MULTICLASS', values) })
                }
                onChangeChoiceGroups={(groups) =>
                    onChange({ proficiencies: withChoiceGroups(draft, 'MULTICLASS', groups) })
                }
            />
        </>
    );
}

const styles = StyleSheet.create({
    centered: {
        paddingVertical: fantasyTokens.spacing.xl,
        alignItems: 'center',
    },
    error: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.crimson,
    },
});
