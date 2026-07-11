import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { ABILITIES } from './types';

export function Field({
    label,
    helper,
    errorMessage,
    ...props
}: Omit<React.ComponentProps<typeof TextInput>, 'error'> & {
    label: string;
    helper?: string;
    errorMessage?: string;
}) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            {helper ? <Text style={styles.helper}>{helper}</Text> : null}
            <TextInput
                mode="outlined"
                outlineColor={errorMessage ? fantasyTokens.colors.crimson : fantasyTokens.colors.accordionBorder}
                activeOutlineColor={errorMessage ? fantasyTokens.colors.crimson : fantasyTokens.colors.claret}
                textColor={fantasyTokens.colors.inkDark}
                style={styles.input}
                error={Boolean(errorMessage)}
                {...props}
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        </View>
    );
}

export function Chip({
    label,
    selected,
    disabled,
    onPress,
}: {
    label: string;
    selected: boolean;
    disabled?: boolean;
    onPress: () => void;
}) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={[styles.chip, selected && styles.chipSelected, disabled && styles.disabled]}
        >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
        </Pressable>
    );
}

export function AbilityPicker({
    label,
    selected,
    disabled,
    errorMessage,
    onPress,
}: {
    label: string;
    selected: string[];
    disabled?: boolean;
    errorMessage?: string;
    onPress: (value: string) => void;
}) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.chips}>
                {ABILITIES.map((ability) => (
                    <Chip
                        key={ability.value}
                        label={ability.label}
                        selected={selected.includes(ability.value)}
                        disabled={disabled}
                        onPress={() => onPress(ability.value)}
                    />
                ))}
            </View>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        </View>
    );
}

export const fieldStyles = StyleSheet.create({
    field: { gap: fantasyTokens.spacing.xs },
    label: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.ember,
    },
    helper: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
    },
    error: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.crimson,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    checkbox: {
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
    },
    checkboxSelected: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: fantasyTokens.colors.claretSoft,
    },
    checkboxText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    disabled: { opacity: 0.5 },
});

const styles = StyleSheet.create({
    field: fieldStyles.field,
    label: fieldStyles.label,
    helper: fieldStyles.helper,
    error: fieldStyles.error,
    input: { backgroundColor: fantasyTokens.colors.parchmentLight },
    chips: fieldStyles.chips,
    chip: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
    },
    chipSelected: {
        backgroundColor: fantasyTokens.colors.claret,
        borderColor: fantasyTokens.colors.claret,
    },
    chipText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
    },
    chipTextSelected: { color: fantasyTokens.colors.parchment },
    disabled: fieldStyles.disabled,
});
