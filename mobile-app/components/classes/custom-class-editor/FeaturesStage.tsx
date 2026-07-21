import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import CardRemoveButton from './CardRemoveButton';
import ClassSpellListEditor from './ClassSpellListEditor';
import { MAX_CLASS_LEVEL } from './draft';
import { Field, fieldStyles } from './fields';
import type { DraftFeature, StageProps } from './types';

/**
 * Features stage: class feature list and class spell list via the shared spell picker.
 */
export default function FeaturesStage({ draft, locked, onChange }: StageProps) {
    function updateFeature(key: string, patch: Partial<DraftFeature>) {
        onChange({
            features: draft.features.map((item) =>
                item.key === key ? { ...item, ...patch } : item,
            ),
        });
    }

    function removeFeature(key: string) {
        onChange({
            features: draft.features.filter((item) => item.key !== key),
        });
    }

    function addFeature() {
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
        });
    }

    return (
        <View style={styles.root}>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Class features</Text>
                    {draft.features.length > 0 ? (
                        <Text style={styles.countBadge}>{draft.features.length}</Text>
                    ) : null}
                </View>
                <Text style={styles.sectionHelper}>
                    Level-gated abilities this class grants. Name and rules text stay editable even
                    when mechanics are locked.
                </Text>

                {draft.features.length === 0 ? (
                    <View style={styles.emptyHint}>
                        <Text style={styles.emptyHintText}>No features yet — add your first below.</Text>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {draft.features.map((feature, index) => {
                            const title = feature.name.trim() || `Feature ${index + 1}`;
                            return (
                                <View
                                    key={feature.key}
                                    style={styles.featureCard}
                                    testID={`custom-class-feature-${index}`}
                                >
                                    <View style={styles.featureHeader}>
                                        <View style={styles.levelBadge}>
                                            <Text style={styles.levelBadgeEyebrow}>Lvl</Text>
                                            <Text style={styles.levelBadgeValue}>{feature.level}</Text>
                                        </View>
                                        <View style={styles.featureMeta}>
                                            <Text style={styles.featureEyebrow}>
                                                Feature {index + 1}
                                            </Text>
                                            <Text style={styles.featureTitle} numberOfLines={1}>
                                                {title}
                                            </Text>
                                        </View>
                                        {!locked ? (
                                            <CardRemoveButton
                                                accessibilityLabel={`Remove feature ${index + 1}`}
                                                onPress={() => removeFeature(feature.key)}
                                                testID={`remove-custom-class-feature-${index}`}
                                                style={styles.removeButton}
                                            />
                                        ) : null}
                                    </View>

                                    <View style={styles.levelRow}>
                                        <Text style={styles.levelRowLabel}>Gained at level</Text>
                                        <NumericStepper
                                            size="compact"
                                            value={feature.level}
                                            canDecrease={!locked && feature.level > 1}
                                            canIncrease={!locked && feature.level < MAX_CLASS_LEVEL}
                                            decrementLabel={`Decrease level for ${title}`}
                                            incrementLabel={`Increase level for ${title}`}
                                            tone="night"
                                            valueTestID={`feature-level-${index}`}
                                            onDecrease={() =>
                                                updateFeature(feature.key, {
                                                    level: Math.max(1, feature.level - 1),
                                                })
                                            }
                                            onIncrease={() =>
                                                updateFeature(feature.key, {
                                                    level: Math.min(MAX_CLASS_LEVEL, feature.level + 1),
                                                })
                                            }
                                        />
                                    </View>

                                    <Field
                                        label="Name"
                                        value={feature.name}
                                        placeholder="e.g. Fighting Style"
                                        onChangeText={(name) => updateFeature(feature.key, { name })}
                                    />
                                    <Field
                                        label="Description"
                                        value={feature.description}
                                        multiline
                                        numberOfLines={4}
                                        style={fieldStyles.textArea}
                                        placeholder="What this feature does"
                                        onChangeText={(description) =>
                                            updateFeature(feature.key, { description })
                                        }
                                    />
                                </View>
                            );
                        })}
                    </View>
                )}

                {!locked ? (
                    <Pressable
                        style={styles.addButton}
                        onPress={addFeature}
                        accessibilityRole="button"
                        accessibilityLabel="Add feature"
                        testID="add-custom-class-feature"
                    >
                        <Text style={styles.addLabel}>+ Add feature</Text>
                    </Pressable>
                ) : null}
            </View>

            {draft.spellcastingMode !== 'NONE' ? (
                <ClassSpellListEditor
                    spells={draft.spells}
                    locked={locked}
                    onChangeSpells={(spells) => onChange({ spells })}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        gap: fantasyTokens.spacing.lg,
    },
    section: {
        gap: fantasyTokens.spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    sectionTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
    },
    sectionHelper: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        marginTop: -fantasyTokens.spacing.xs,
    },
    countBadge: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: fantasyTokens.fontSizes.utility - 2,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: 3,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        color: fantasyTokens.colors.goldLight,
    },
    emptyHint: {
        paddingVertical: fantasyTokens.spacing.md,
        paddingHorizontal: fantasyTokens.spacing.md,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: fantasyTokens.sheet.form.border,
    },
    emptyHintText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        fontStyle: 'italic',
        opacity: 0.85,
        textAlign: 'center',
    },
    list: {
        gap: fantasyTokens.spacing.md,
    },
    featureCard: {
        ...nightFormStyles.card,
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
    },
    levelBadge: {
        width: fantasyTokens.spacing.xxl + fantasyTokens.spacing.sm,
        height: fantasyTokens.spacing.xxl + fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 2,
        borderColor: fantasyTokens.colors.goldLight,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelBadgeEyebrow: {
        ...fantasyTokens.typography.eyebrow,
        fontSize: fantasyTokens.fontSizes.utility - 3,
        letterSpacing: 1,
        color: fantasyTokens.colors.goldLight,
        lineHeight: fantasyTokens.fontSizes.utility - 1,
    },
    levelBadgeValue: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        lineHeight: fantasyTokens.fontSizes.title,
    },
    featureMeta: {
        flex: 1,
        minWidth: 0,
        gap: 2,
    },
    featureEyebrow: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontSize: fantasyTokens.fontSizes.utility - 1,
    },
    featureTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        fontSize: fantasyTokens.fontSizes.body,
    },
    removeButton: {
        width: 36,
        height: 36,
        flexShrink: 0,
    },
    levelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
    },
    levelRowLabel: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
        fontSize: fantasyTokens.fontSizes.caption,
        flexShrink: 1,
    },
    addButton: {
        ...nightFormStyles.dashedAddButton,
    },
    addLabel: {
        ...nightFormStyles.dashedAddButtonText,
    },
});
