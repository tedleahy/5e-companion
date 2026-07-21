import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useQuery } from '@apollo/client/react';
import { GET_PROFICIENCIES } from '@/graphql/class.operations';
import type { ProficienciesQuery } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import PrerequisiteBuilder from './PrerequisiteBuilder';
import ProficiencyGrantEditor from './ProficiencyGrantEditor';
import { fieldStyles } from './fields';
import type { StageProps } from './types';

type GrantTab = 'STARTING' | 'MULTICLASS';

/**
 * Proficiencies stage: Starting / Multiclass category editors, with prereqs on Multiclass.
 */
export default function ProficienciesStage({ draft, locked, onChange }: StageProps) {
    const [tab, setTab] = useState<GrantTab>('STARTING');
    const { data, loading, error } = useQuery<ProficienciesQuery>(GET_PROFICIENCIES);

    const options = useMemo(
        () =>
            (data?.proficiencies ?? []).filter((item) => item.type !== 'SAVING_THROW'),
        [data?.proficiencies],
    );

    if (loading && !data) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator color={fantasyTokens.colors.gold} />
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
        <View style={styles.root}>
            <View style={styles.tabs} accessibilityRole="tablist">
                <Pressable
                    style={[styles.tab, tab === 'STARTING' && styles.tabActive]}
                    onPress={() => setTab('STARTING')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: tab === 'STARTING' }}
                    testID="proficiency-tab-STARTING"
                >
                    <Text style={[styles.tabLabel, tab === 'STARTING' && styles.tabLabelActive]}>
                        Starting
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, tab === 'MULTICLASS' && styles.tabActive]}
                    onPress={() => setTab('MULTICLASS')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: tab === 'MULTICLASS' }}
                    testID="proficiency-tab-MULTICLASS"
                >
                    <Text style={[styles.tabLabel, tab === 'MULTICLASS' && styles.tabLabelActive]}>
                        Multiclass
                    </Text>
                </Pressable>
            </View>

            {/* Keep both panels mounted so in-session choice-pool stashes survive tab switches. */}
            <View
                style={[styles.panel, tab !== 'STARTING' && styles.panelHidden]}
                testID="proficiency-panel-STARTING"
                pointerEvents={tab === 'STARTING' ? 'auto' : 'none'}
            >
                <Text style={fieldStyles.helper}>
                    What a brand-new character gets at level 1. Grants and pick-N pools live side by
                    side per type.
                </Text>
                <ProficiencyGrantEditor
                    grant="STARTING"
                    draft={draft}
                    options={options}
                    locked={locked}
                    onChange={(proficiencies) => onChange({ proficiencies })}
                />
            </View>
            <View
                style={[styles.panel, tab !== 'MULTICLASS' && styles.panelHidden]}
                testID="proficiency-panel-MULTICLASS"
                pointerEvents={tab === 'MULTICLASS' ? 'auto' : 'none'}
            >
                <PrerequisiteBuilder
                    value={draft.multiclassPrerequisites}
                    locked={locked}
                    onChange={(multiclassPrerequisites) => onChange({ multiclassPrerequisites })}
                />
                <Text style={fieldStyles.helper}>
                    Granted when someone multiclasses into this class. Same fixed + optional-choice
                    layout — usually fewer picks.
                </Text>
                <ProficiencyGrantEditor
                    grant="MULTICLASS"
                    draft={draft}
                    options={options}
                    locked={locked}
                    onChange={(proficiencies) => onChange({ proficiencies })}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        gap: fantasyTokens.spacing.md,
    },
    centered: {
        paddingVertical: fantasyTokens.spacing.xl,
        alignItems: 'center',
    },
    error: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.goldLight,
    },
    tabs: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
        overflow: 'hidden',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: fantasyTokens.spacing.sm + 2,
        backgroundColor: 'transparent',
    },
    tabActive: {
        backgroundColor: fantasyTokens.colors.crimson,
    },
    tabLabel: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.85,
    },
    tabLabelActive: {
        color: fantasyTokens.colors.parchment,
        opacity: 1,
    },
    panel: {
        gap: fantasyTokens.spacing.md,
    },
    panelHidden: {
        display: 'none',
    },
});
