import Ionicons from '@expo/vector-icons/Ionicons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompendiumRowAction } from '@/components/compendium/compendium-collection.types';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumCollectionRowProps = {
    value: string;
    name: string;
    isCustom: boolean;
    mark: ReactNode;
    meta: ReactNode;
    extra?: ReactNode;
    actions?: CompendiumRowAction[];
    onSelect: (value: string) => void;
    testID?: string;
};

/** Shared parchment list row for the browse-only Compendium collections. */
export default function CompendiumCollectionRow({
    value,
    name,
    isCustom,
    mark,
    meta,
    extra,
    actions = [],
    onSelect,
    testID,
}: CompendiumCollectionRowProps) {
    const sourceLabel = isCustom ? 'Custom' : 'SRD';

    return (
        <View style={styles.row}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${name}, ${sourceLabel}`}
                accessibilityHint="Open details"
                onPress={() => onSelect(value)}
                style={({ pressed }) => [styles.main, pressed && styles.pressed]}
                testID={testID}
            >
                <View style={styles.mark}>{mark}</View>
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={styles.title} numberOfLines={1}>{name}</Text>
                        <View style={[styles.sourcePill, isCustom && styles.customPill]}>
                            <Text style={[styles.sourceLabel, isCustom && styles.customLabel]}>
                                {sourceLabel}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.meta} numberOfLines={2}>{meta}</Text>
                    {extra}
                </View>
                <Ionicons
                    name="chevron-forward"
                    size={fantasyTokens.fontSizes.title}
                    color={fantasyTokens.colors.inkSoft}
                />
            </Pressable>
            {actions.length > 0 ? (
                <View style={styles.actions}>
                    {actions.map((action) => (
                        <Pressable
                            key={action.accessibilityLabel}
                            accessibilityRole="button"
                            accessibilityLabel={action.accessibilityLabel}
                            onPress={action.onPress}
                            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
                            testID={action.testID}
                        >
                            <Ionicons
                                name={action.icon}
                                size={fantasyTokens.fontSizes.title}
                                color={action.destructive
                                    ? fantasyTokens.colors.crimson
                                    : fantasyTokens.colors.inkLight}
                            />
                        </Pressable>
                    ))}
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    main: {
        flex: 1,
        minHeight: fantasyTokens.spacing.xxl + fantasyTokens.spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    pressed: {
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        paddingLeft: fantasyTokens.spacing.sm,
    },
    action: {
        width: fantasyTokens.spacing.xl,
        height: fantasyTokens.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
    },
    actionPressed: {
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    mark: {
        width: fantasyTokens.spacing.xl * 2,
        height: fantasyTokens.spacing.xl * 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    content: {
        flex: 1,
        gap: fantasyTokens.spacing.xs,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    title: {
        flexShrink: 1,
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    sourcePill: {
        paddingHorizontal: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.lg,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    customPill: {
        borderColor: fantasyTokens.colors.claretSubtle,
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    sourceLabel: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    customLabel: {
        color: fantasyTokens.colors.claret,
    },
    meta: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
    },
});
