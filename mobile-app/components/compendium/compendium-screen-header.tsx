import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COMPENDIUM_BACK_SLOT_WIDTH } from '@/components/compendium/compendium-back-control';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumScreenHeaderProps = {
    eyebrow: string;
    title: string;
    /** Left slot for the F3 back control; right slot mirrors its width to keep the title centred. */
    leading?: ReactNode;
};

/** Shared title treatment for the Compendium hub and category screens. */
export default function CompendiumScreenHeader({
    eyebrow,
    title,
    leading,
}: CompendiumScreenHeaderProps) {
    if (leading == null) {
        return (
            <View style={styles.header}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title}>{title}</Text>
            </View>
        );
    }

    return (
        <View style={styles.codexBar}>
            <View style={styles.sideSlot}>{leading}</View>
            <View style={styles.center}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Text style={styles.title}>{title}</Text>
            </View>
            <View style={styles.sideSlot} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingHorizontal: fantasyTokens.spacing.xl,
        paddingTop: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.rail.border,
    },
    codexBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.md - fantasyTokens.spacing.xs / 2,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.rail.border,
    },
    sideSlot: {
        width: COMPENDIUM_BACK_SLOT_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        alignItems: 'center',
    },
    eyebrow: {
        color: fantasyTokens.colors.gold,
        opacity: 0.7,
        ...fantasyTokens.typography.eyebrow,
        textAlign: 'center',
    },
    title: {
        color: fantasyTokens.colors.parchment,
        ...fantasyTokens.typography.pageTitle,
        marginTop: fantasyTokens.spacing.xs,
        fontWeight: '700',
        textAlign: 'center',
    },
});
