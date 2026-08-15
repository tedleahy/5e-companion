import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumDisclosureProps = {
    title: string;
    summary: string;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
    testID?: string;
};

export default function CompendiumDisclosure({
    title,
    summary,
    expanded,
    onToggle,
    children,
    testID,
}: CompendiumDisclosureProps) {
    return (
        <View style={styles.disclosure}>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={onToggle}
                style={({ pressed }) => [styles.header, pressed && styles.pressed]}
                testID={testID}
            >
                <View style={styles.copy}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.summary}>{summary}</Text>
                </View>
                <Ionicons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={fantasyTokens.fontSizes.title}
                    color={fantasyTokens.colors.claret}
                />
            </Pressable>
            {expanded ? <View style={styles.body}>{children}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    disclosure: {
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
    },
    header: {
        minHeight: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.colors.parchmentDeep,
    },
    copy: {
        flex: 1,
        gap: fantasyTokens.spacing.xs,
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    summary: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
    },
    pressed: {
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    body: {
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
    },
});
