import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Placeholder route for the upcoming character creation wizard.
 */
export default function CharacterCreatePlaceholderScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.kicker}>Character Creation</Text>
            <Text style={styles.title}>Wizard coming next</Text>
            <Text style={styles.body}>
                This route is now wired in. The multi-step creation flow will be implemented here next.
            </Text>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Return to characters"
                onPress={() => router.replace('/characters')}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                testID="character-create-placeholder-back"
            >
                <Text style={styles.buttonText}>Back to characters</Text>
            </Pressable>
        </View>
    );
}

/** Styles for the character creation placeholder screen. */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: fantasyTokens.spacing.xl,
        backgroundColor: fantasyTokens.colors.night,
        gap: fantasyTokens.spacing.sm,
    },
    kicker: {
        color: 'rgba(201,146,42,0.7)',
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontFamily: 'serif',
        fontSize: 12,
    },
    title: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 32,
        lineHeight: 38,
        textAlign: 'center',
    },
    body: {
        maxWidth: 360,
        marginTop: fantasyTokens.spacing.xs,
        marginBottom: fantasyTokens.spacing.lg,
        color: fantasyTokens.colors.parchmentDeep,
        fontFamily: 'serif',
        fontSize: 17,
        lineHeight: 26,
        textAlign: 'center',
    },
    button: {
        minHeight: 52,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: fantasyTokens.spacing.lg,
    },
    buttonPressed: {
        backgroundColor: '#9f2121',
    },
    buttonText: {
        color: fantasyTokens.colors.parchment,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        fontFamily: 'serif',
        fontSize: 12,
    },
});
