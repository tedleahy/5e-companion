import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

export default function CompendiumDetailSection({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <View style={styles.section}>
            <Text style={styles.title}>{title}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.accordionBorder,
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
});
