import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Text } from 'react-native-paper';
import { wizardStepStyles } from '@/components/character-creation-wizard/styles/wizardStepStyles';
import { CREATE_CHARACTER_ROUTES } from '@/lib/characterCreation/routes';
import { getCreateFeatureChoiceGroups } from '@/lib/srdFeatureChoices';
import { useCharacterDraft } from '@/store/characterDraft';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Feature-choice step for create-character flows that unlock parent/child SRD options.
 */
export default function StepFeatures() {
    const { draft, updateDraft } = useCharacterDraft();
    const featureChoiceGroups = getCreateFeatureChoiceGroups(draft.classes);

    if (featureChoiceGroups.length === 0) {
        return <Redirect href={CREATE_CHARACTER_ROUTES.abilities} />;
    }

    /**
     * Applies one chosen child feature for the given parent feature.
     */
    function selectFeatureChoice(parentSrdIndex: string, chosenChildSrdIndex: string) {
        updateDraft({
            featureChoices: [
                ...draft.featureChoices.filter((choice) => choice.parentSrdIndex !== parentSrdIndex),
                { parentSrdIndex, chosenChildSrdIndex },
            ],
        });
    }

    return (
        <ScrollView style={wizardStepStyles.scroll} contentContainerStyle={wizardStepStyles.container}>
            <Text style={wizardStepStyles.heading}>Choose your class features.</Text>
            <Text style={wizardStepStyles.sub}>
                Some classes grant a choice of feature instead of every option at once.
            </Text>

            {featureChoiceGroups.map((group) => {
                const selectedChildSrdIndex = draft.featureChoices.find(
                    (choice) => choice.parentSrdIndex === group.parentSrdIndex,
                )?.chosenChildSrdIndex ?? null;

                return (
                    <View key={group.parentSrdIndex} style={styles.groupCard}>
                        <Text style={styles.groupTitle}>{group.parentFeature.name}</Text>
                        <Text style={styles.groupSource}>
                            {`${group.parentFeature.className} ${group.parentFeature.level}`}
                        </Text>
                        <Text style={styles.groupDescription}>{group.parentFeature.description}</Text>

                        <View style={styles.optionList}>
                            {group.options.map((option) => {
                                const selected = option.childSrdIndex === selectedChildSrdIndex;

                                return (
                                    <Pressable
                                        key={option.childSrdIndex}
                                        onPress={() => selectFeatureChoice(group.parentSrdIndex, option.childSrdIndex)}
                                        accessibilityRole="radio"
                                        accessibilityState={{ checked: selected }}
                                        accessibilityLabel={`Choose ${option.name}`}
                                        style={[
                                            styles.optionCard,
                                            selected && styles.optionCardSelected,
                                        ]}
                                        testID={`create-feature-choice-${group.parentSrdIndex}-${option.childSrdIndex}`}
                                    >
                                        <View style={styles.optionHeader}>
                                            <View style={[styles.radioDot, selected && styles.radioDotSelected]} />
                                            <Text style={styles.optionName}>{option.name}</Text>
                                        </View>
                                        <Text style={styles.optionDescription}>{option.description}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    groupCard: {
        gap: fantasyTokens.spacing.sm,
        marginBottom: fantasyTokens.spacing.lg,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        backgroundColor: 'rgba(240,224,188,0.06)',
        padding: fantasyTokens.spacing.lg,
    },
    groupTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
    },
    groupSource: {
        ...fantasyTokens.typography.bodySmall,
        color: 'rgba(201,146,42,0.5)',
    },
    groupDescription: {
        ...fantasyTokens.typography.body,
        color: 'rgba(245,230,200,0.85)',
    },
    optionList: {
        gap: fantasyTokens.spacing.sm,
    },
    optionCard: {
        gap: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.16)',
        backgroundColor: 'rgba(240,224,188,0.04)',
        padding: fantasyTokens.spacing.md,
    },
    optionCardSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.12)',
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    radioDot: {
        width: 14,
        height: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.45)',
    },
    radioDotSelected: {
        backgroundColor: fantasyTokens.colors.gold,
        borderColor: fantasyTokens.colors.gold,
    },
    optionName: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
        flex: 1,
    },
    optionDescription: {
        ...fantasyTokens.typography.bodySmall,
        color: 'rgba(245,230,200,0.72)',
    },
});
