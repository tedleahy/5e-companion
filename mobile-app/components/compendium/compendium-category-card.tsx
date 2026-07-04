import type { DimensionValue } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumCategoryCardProps = {
    icon: string;
    label: string;
    summary?: string;
    width: DimensionValue;
    testID: string;
    onPress?: () => void;
};

/** Parchment category tile used by the Compendium hub. */
export default function CompendiumCategoryCard({
    icon,
    label,
    summary,
    width,
    testID,
    onPress,
}: CompendiumCategoryCardProps) {
    const enabled = onPress != null;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${label}`}
            accessibilityHint={enabled ? summary : `${label} is coming soon`}
            accessibilityState={{ disabled: !enabled }}
            disabled={!enabled}
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                styles.card,
                { width },
                !enabled && styles.cardDisabled,
                pressed && styles.cardPressed,
            ]}
        >
            {!enabled && (
                <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming soon</Text>
                </View>
            )}
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.name}>{label}</Text>
            {summary != null && <Text style={styles.summary}>{summary}</Text>}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        minHeight: fantasyTokens.spacing.xxl * 3,
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.colors.cardBg,
        justifyContent: 'flex-end',
    },
    cardDisabled: {
        opacity: 0.62,
    },
    cardPressed: {
        transform: [{ scale: 0.98 }],
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    comingSoonBadge: {
        position: 'absolute',
        top: fantasyTokens.spacing.sm,
        right: fantasyTokens.spacing.sm,
    },
    comingSoonText: {
        color: fantasyTokens.colors.ember,
        ...fantasyTokens.typography.eyebrow,
        fontSize: fantasyTokens.fontSizes.utility,
        opacity: 0.7,
    },
    icon: {
        fontSize: fantasyTokens.fontSizes.headline,
        marginBottom: fantasyTokens.spacing.sm,
    },
    name: {
        color: fantasyTokens.colors.inkDark,
        ...fantasyTokens.typography.sectionTitle,
        fontWeight: '700',
    },
    summary: {
        color: fantasyTokens.colors.ember,
        ...fantasyTokens.typography.bodySmall,
        marginTop: fantasyTokens.spacing.xs,
        fontWeight: '500',
    },
});
