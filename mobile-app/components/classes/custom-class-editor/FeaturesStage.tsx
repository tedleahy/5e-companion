import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { Field } from './fields';
import type { StageProps } from './types';

/**
 * Features stage: class feature list and class spell IDs.
 */
export default function FeaturesStage({ draft, locked, onChange }: StageProps) {
    return (
        <>
            {draft.features.map((feature, index) => (
                <View key={feature.key} style={styles.featureCard}>
                    <View style={styles.featureHeader}>
                        <Text style={styles.featureTitle}>Feature {index + 1}</Text>
                        {!locked ? (
                            <Pressable
                                onPress={() =>
                                    onChange({
                                        features: draft.features.filter((item) => item.key !== feature.key),
                                    })
                                }
                            >
                                <Text style={styles.remove}>Remove</Text>
                            </Pressable>
                        ) : null}
                    </View>
                    <Field
                        label="Name"
                        value={feature.name}
                        onChangeText={(name) =>
                            onChange({
                                features: draft.features.map((item) =>
                                    item.key === feature.key ? { ...item, name } : item,
                                ),
                            })
                        }
                    />
                    <Field
                        label="Description"
                        value={feature.description}
                        multiline
                        onChangeText={(description) =>
                            onChange({
                                features: draft.features.map((item) =>
                                    item.key === feature.key ? { ...item, description } : item,
                                ),
                            })
                        }
                    />
                    <Field
                        label="Level"
                        value={String(feature.level)}
                        keyboardType="number-pad"
                        editable={!locked}
                        onChangeText={(value) =>
                            onChange({
                                features: draft.features.map((item) =>
                                    item.key === feature.key
                                        ? {
                                              ...item,
                                              level: Math.max(1, Math.min(20, Number(value) || 1)),
                                          }
                                        : item,
                                ),
                            })
                        }
                    />
                </View>
            ))}
            {!locked ? (
                <Pressable
                    style={styles.addButton}
                    onPress={() =>
                        onChange({
                            features: [
                                ...draft.features,
                                {
                                    key: `new-${Date.now()}`,
                                    name: '',
                                    description: '',
                                    level: 1,
                                },
                            ],
                        })
                    }
                >
                    <Text style={styles.addLabel}>+ Add feature</Text>
                </Pressable>
            ) : null}
            {draft.spellcastingMode !== 'NONE' ? (
                <Field
                    label="Class spell IDs"
                    helper="Comma-separated spell IDs from the Compendium."
                    editable={!locked}
                    value={draft.spellIds.join(', ')}
                    multiline
                    onChangeText={(text) =>
                        onChange({
                            spellIds: text
                                .split(',')
                                .map((value) => value.trim())
                                .filter(Boolean),
                        })
                    }
                />
            ) : null}
        </>
    );
}

const styles = StyleSheet.create({
    featureCard: {
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
    },
    featureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    featureTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    remove: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.crimson,
    },
    addButton: {
        alignItems: 'center',
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.sm,
    },
    addLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
});
