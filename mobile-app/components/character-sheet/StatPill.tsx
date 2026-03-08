import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type StatPillProps = {
    value: string;
    label: string;
    onPress?: () => void;
    accessibilityLabel?: string;
    isActive?: boolean;
};

export default function StatPill({
    value,
    label,
    onPress,
    accessibilityLabel,
    isActive = false,
}: StatPillProps) {
    if (onPress) {
        return (
            <Pressable
                style={styles.pill}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
            >
                <Text style={[styles.pillValue, isActive && styles.activeText]}>{value}</Text>
                <Text style={[styles.pillLabel, isActive && styles.activeText]}>{label}</Text>
            </Pressable>
        );
    }

    return (
        <View style={styles.pill}>
            <Text style={[styles.pillValue, isActive && styles.activeText]}>{value}</Text>
            <Text style={[styles.pillLabel, isActive && styles.activeText]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 7.5,
        alignItems: 'center',
    },
    pillValue: {
        fontFamily: 'serif',
        fontSize: 20,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
    },
    pillLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
        marginTop: 3,
    },
    activeText: {
        color: fantasyTokens.colors.crimson,
        opacity: 1,
    },
});
