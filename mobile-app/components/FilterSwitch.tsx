import { StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type FilterSwitchProps = {
    label: string;
    value: boolean;
    onToggle: () => void;
};

/** A labelled on/off switch row. */
export default function FilterSwitch({ label, value, onToggle }: FilterSwitchProps) {
    return (
        <View style={styles.switchRow}>
            <Text style={styles.sectionLabel}>{label}</Text>
            <Switch
                value={value}
                onValueChange={onToggle}
                color={fantasyTokens.colors.crimson}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    sectionLabel: {
        fontSize: 14,
        fontFamily: fantasyTokens.fonts.regular,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        marginTop: fantasyTokens.spacing.md,
        marginBottom: fantasyTokens.spacing.sm,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: fantasyTokens.spacing.md,
    },
});
