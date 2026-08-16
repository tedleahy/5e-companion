import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCompendiumDetailScroll } from '@/components/compendium/compendium-detail-scroll';
import { fantasyTokens } from '@/theme/fantasyTheme';

export type CompendiumJumpLink = {
    id: string;
    label: string;
    count?: number;
};

/** In-page navigation pills that scroll the open Compendium detail to a section. */
export default function CompendiumJumpLinks({
    links,
}: {
    links: CompendiumJumpLink[];
}) {
    const scroll = useCompendiumDetailScroll();

    return (
        <View style={styles.links}>
            {links.map((link) => {
                const countLabel = link.count == null ? '' : ` (${link.count})`;

                return (
                    <Pressable
                        key={link.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Jump to ${link.label}${countLabel}`}
                        onPress={() => scroll?.scrollToSection(link.id)}
                        style={({ pressed }) => [styles.link, pressed && styles.pressed]}
                        testID={`compendium-jump-${link.id}`}
                    >
                        <Text style={styles.label}>{link.label}</Text>
                        {link.count == null ? null : (
                            <Text style={styles.count}>{link.count}</Text>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    links: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    link: {
        minHeight: fantasyTokens.spacing.xl + fantasyTokens.spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        paddingHorizontal: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        paddingVertical: fantasyTokens.spacing.xs,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.radii.lg,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    pressed: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    label: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
    },
    count: {
        fontFamily: fantasyTokens.fonts.bold,
        fontSize: fantasyTokens.fontSizes.utility,
        fontWeight: '700',
        color: fantasyTokens.colors.claret,
    },
});
