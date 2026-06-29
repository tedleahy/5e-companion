import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH,
    CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH,
} from '@shared/constants/customSubclassLimits';
import { normaliseLevelInput } from './customSubclassFormDraft';
import type { CustomSubclassFeatureDraft } from './subclassManager.types';
import { FantasyFormTextInput } from './FantasyFormTextInput';

type CustomSubclassFeatureCardProps = {
    feature: CustomSubclassFeatureDraft;
    index: number;
    pending: boolean;
    useStackedFields: boolean;
    onUpdate: (clientId: string, updates: Partial<CustomSubclassFeatureDraft>) => void;
    onRemove: (clientId: string) => void;
};

export default function CustomSubclassFeatureCard({
    feature,
    index,
    pending,
    useStackedFields,
    onUpdate,
    onRemove,
}: CustomSubclassFeatureCardProps) {
    return (
        <View
            style={styles.featureCard}
            testID={`custom-subclass-feature-${index}`}
        >
            <View style={styles.featureCardHeader}>
                <Text style={styles.featureCardTitle}>Feature {index + 1}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove feature ${index + 1}`}
                    onPress={() => onRemove(feature.clientId)}
                    disabled={pending}
                    style={({ pressed }) => [
                        styles.removeFeatureButton,
                        pressed && styles.removeFeatureButtonPressed,
                    ]}
                    testID={`remove-custom-subclass-feature-${index}`}
                >
                    <Ionicons name="trash-outline" size={18} color={fantasyTokens.colors.crimson} />
                </Pressable>
            </View>

            <View
                style={[
                    styles.featureInlineFields,
                    useStackedFields && styles.featureInlineFieldsStacked,
                ]}
            >
                <View
                    style={[
                        styles.featureLevelField,
                        useStackedFields && styles.featureStackedField,
                    ]}
                >
                    <Text style={styles.featureFieldLabel}>Level</Text>
                    <FantasyFormTextInput
                        placeholder="3"
                        value={feature.level}
                        onChangeText={(level) => onUpdate(feature.clientId, {
                            level: normaliseLevelInput(level),
                        })}
                        keyboardType="number-pad"
                        inputMode="numeric"
                        testID={`custom-subclass-feature-level-${index}`}
                    />
                </View>

                <View
                    style={[
                        styles.featureNameField,
                        useStackedFields && styles.featureStackedField,
                    ]}
                >
                    <Text style={styles.featureFieldLabel}>Name</Text>
                    <FantasyFormTextInput
                        placeholder="e.g. Moonlit Ward"
                        value={feature.name}
                        onChangeText={(name) => onUpdate(feature.clientId, { name })}
                        maxLength={CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH}
                        autoCapitalize="words"
                        testID={`custom-subclass-feature-name-${index}`}
                    />
                </View>
            </View>

            <View style={styles.field}>
                <Text style={styles.featureFieldLabel}>Description</Text>
                <FantasyFormTextInput
                    placeholder="Describe what this feature grants"
                    value={feature.description}
                    onChangeText={(description) => onUpdate(feature.clientId, { description })}
                    multiline
                    numberOfLines={4}
                    maxLength={CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH}
                    style={styles.featureDescriptionInput}
                    testID={`custom-subclass-feature-description-${index}`}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    field: {
        gap: fantasyTokens.spacing.sm,
    },
    featureCard: {
        gap: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.rail.borderStrong,
        backgroundColor: fantasyTokens.rail.pressed,
        padding: fantasyTokens.spacing.md,
    },
    featureCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
    },
    featureCardTitle: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
    },
    removeFeatureButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.rail.borderStrong,
    },
    removeFeatureButtonPressed: {
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    featureInlineFields: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
    },
    featureInlineFieldsStacked: {
        flexDirection: 'column',
    },
    featureLevelField: {
        width: 86,
        gap: fantasyTokens.spacing.xs,
    },
    featureNameField: {
        flex: 1,
        minWidth: 0,
        gap: fantasyTokens.spacing.xs,
    },
    featureStackedField: {
        width: '100%',
    },
    featureFieldLabel: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
    featureDescriptionInput: {
        minHeight: 104,
    },
});
