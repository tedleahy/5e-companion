import { Pressable, StyleSheet, Text } from 'react-native';
import useProtectedNavigation from '@/hooks/useProtectedNavigation';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Returns from a Compendium category to the category hub. */
export default function CompendiumBackButton() {
    const protectedRouter = useProtectedNavigation();

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to all Compendium categories"
            onPress={() => {
                void protectedRouter.replace('/compendium');
            }}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
            <Text style={styles.chevron}>‹</Text>
            <Text style={styles.label}>Back to Compendium</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
    },
    buttonPressed: {
        backgroundColor: fantasyTokens.rail.pressed,
    },
    chevron: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.bold,
        fontSize: fantasyTokens.fontSizes.titleLarge,
        lineHeight: fantasyTokens.fontSizes.titleLarge,
    },
    label: {
        color: fantasyTokens.colors.crimson,
        fontFamily: fantasyTokens.fonts.semiBold,
        fontSize: fantasyTokens.fontSizes.caption,
    },
});
