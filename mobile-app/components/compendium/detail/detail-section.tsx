import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useCompendiumDetailScroll } from '@/components/compendium/compendium-detail-scroll';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Titled block on a Compendium detail, optionally registered as a jump target. */
export default function CompendiumDetailSection({
    title,
    sectionId,
    children,
}: {
    title: string;
    sectionId?: string;
    children: ReactNode;
}) {
    const scroll = useCompendiumDetailScroll();

    function handleLayout(event: LayoutChangeEvent) {
        if (sectionId == null) return;
        scroll?.registerSection(sectionId, event.nativeEvent.layout.y);
    }

    return (
        <View
            onLayout={handleLayout}
            style={styles.section}
            testID={sectionId == null ? undefined : `compendium-section-${sectionId}`}
        >
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
