import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Placeholder settings route while settings management is being built.
 */
export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.message}>Coming soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
        justifyContent: 'center',
        alignItems: 'center',
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.sm,
    },
    title: {
        fontFamily: 'serif',
        color: fantasyTokens.colors.parchment,
        fontSize: 24,
        letterSpacing: 0.3,
    },
    message: {
        fontFamily: 'serif',
        color: fantasyTokens.colors.gold,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});
