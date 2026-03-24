import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { rechargeLabel } from '@/lib/featuresTabUtils';
import type { FeatureRow } from '@/components/character-sheet/features/features.types';
import CardDivider from '../CardDivider';
import InlineField from '../edit-mode/InlineField';
import RemoveButton from '../edit-mode/RemoveButton';
import SectionHeader from '../edit-mode/SectionHeader';
import SheetCard from '../SheetCard';

/**
 * Props for a grouped feature section card.
 */
type FeatureSectionCardProps = {
    title: string;
    features: FeatureRow[];
    emptyText: string;
    category: 'class' | 'racial' | 'feat';
    index: number;
    editMode: boolean;
    onAdd: () => void;
    onChangeFeature: (featureId: string, changes: Partial<FeatureRow>) => void;
    onRemoveFeature: (featureId: string) => void;
};

/**
 * Visual icon metadata for a feature category.
 */
type IconStyle = {
    label: string;
    backgroundColor: string;
};

/**
 * Returns the icon label/color for a given feature category.
 */
function iconStyle(category: FeatureSectionCardProps['category']): IconStyle {
    if (category === 'racial') {
        return { label: 'R', backgroundColor: 'rgba(26,74,26,0.1)' };
    }

    if (category === 'feat') {
        return { label: 'F', backgroundColor: 'rgba(26,42,74,0.1)' };
    }

    return { label: 'C', backgroundColor: 'rgba(139,26,26,0.1)' };
}

/**
 * Displays a titled list of class, racial, or feat features.
 */
export default function FeatureSectionCard({
    title,
    features,
    emptyText,
    category,
    index,
    editMode,
    onAdd,
    onChangeFeature,
    onRemoveFeature,
}: FeatureSectionCardProps) {
    const icon = iconStyle(category);

    return (
        <SheetCard index={index}>
            <SectionHeader title={title} editMode={editMode} onAdd={onAdd} addLabel="+ Add" />

            {features.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>{emptyText}</Text>
                </View>
            ) : (
                <View style={styles.list}>
                    {features.map((feature, featureIndex) => {
                        const recharge = rechargeLabel(feature.recharge);

                        return (
                            <View key={feature.id}>
                                <View style={styles.row}>
                                    <View style={[styles.iconWrap, { backgroundColor: icon.backgroundColor }]}>
                                        <Text style={styles.iconLabel}>{icon.label}</Text>
                                    </View>

                                    <View style={styles.content}>
                                        <InlineField
                                            value={feature.name}
                                            onChangeText={(value: string) => onChangeFeature(feature.id, { name: value })}
                                            editMode={editMode}
                                            style={styles.featureName}
                                            placeholder="Feature name"
                                        />
                                        <Text style={styles.featureSource}>{feature.source}</Text>

                                        <InlineField
                                            value={feature.description}
                                            onChangeText={(value: string) => onChangeFeature(feature.id, { description: value })}
                                            editMode={editMode}
                                            style={styles.featureDescription}
                                            placeholder="Describe this feature..."
                                            multiline
                                        />

                                        {recharge && (
                                            <View style={styles.useRow}>
                                                <View style={styles.rechargeBadge}>
                                                    <Text style={styles.rechargeBadgeText}>{recharge}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <RemoveButton
                                        editMode={editMode}
                                        accessibilityLabel={`Remove ${feature.name || 'feature'}`}
                                        onPress={() => onRemoveFeature(feature.id)}
                                    />
                                </View>
                                {featureIndex < features.length - 1 && <CardDivider />}
                            </View>
                        );
                    })}
                </View>
            )}
        </SheetCard>
    );
}

/** Styles for feature section rows, labels, and badges. */
const styles = StyleSheet.create({
    list: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 11,
    },
    iconWrap: {
        width: 34,
        height: 34,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    iconLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
    },
    content: {
        flex: 1,
        minWidth: 0,
    },
    featureName: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontWeight: '600',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 17,
    },
    featureSource: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.45,
        fontStyle: 'italic',
        marginTop: 2,
    },
    featureDescription: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.75,
        lineHeight: 18,
        marginTop: 6,
    },
    useRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    useLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
    },
    rechargeBadge: {
        marginLeft: 'auto',
        borderRadius: 10,
        backgroundColor: 'rgba(139,90,43,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    rechargeBadgeText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.65,
    },
    emptyState: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 16,
    },
    emptyStateText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        fontStyle: 'italic',
    },
});
