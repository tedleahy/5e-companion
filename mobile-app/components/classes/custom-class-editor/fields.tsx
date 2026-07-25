import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { FantasyFormTextInput } from '@/components/FantasyFormTextInput';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import { ABILITIES } from './types';

export function Field({
    label,
    helper,
    errorMessage,
    accessibilityLabel,
    ...props
}: Omit<React.ComponentProps<typeof FantasyFormTextInput>, 'error'> & {
    label: string;
    helper?: string;
    errorMessage?: string;
}) {
    return (
        <View style={fieldStyles.field}>
            <Text style={fieldStyles.label}>{label}</Text>
            {helper ? <Text style={fieldStyles.helper}>{helper}</Text> : null}
            <FantasyFormTextInput
                {...props}
                accessibilityLabel={accessibilityLabel ?? label}
                error={Boolean(errorMessage)}
                accessibilityHint={errorMessage}
            />
            {errorMessage ? (
                <Text
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    style={fieldStyles.error}
                >
                    {errorMessage}
                </Text>
            ) : null}
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
            accessibilityRole="checkbox"
            accessibilityLabel={label}
            accessibilityState={{ checked: selected, disabled: Boolean(disabled) }}
            style={[fieldStyles.chip, selected && fieldStyles.chipSelected, disabled && fieldStyles.disabled]}
        >
            <Text style={[fieldStyles.chipText, selected && fieldStyles.chipTextSelected]}>{label}</Text>
        </Pressable>
    );
}

/** Selected proficiency/spell-style pill with an explicit × remove control. */
export function RemovableChip({
    label,
    disabled,
    onRemove,
    testID,
}: {
    label: string;
    disabled?: boolean;
    onRemove: () => void;
    testID?: string;
}) {
    return (
        <View style={fieldStyles.removableChip} testID={testID}>
            <Text style={fieldStyles.removableChipText}>{label}</Text>
            {!disabled ? (
                <Pressable
                    onPress={onRemove}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${label}`}
                    hitSlop={8}
                >
                    <Text style={fieldStyles.removableChipRemove}>×</Text>
                </Pressable>
            ) : null}
        </View>
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
        <View style={fieldStyles.field}>
            <Text style={fieldStyles.label}>{label}</Text>
            <View style={fieldStyles.chips}>
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
            {errorMessage ? (
                <Text
                    accessibilityRole="alert"
                    accessibilityLiveRegion="polite"
                    style={fieldStyles.error}
                >
                    {errorMessage}
                </Text>
            ) : null}
        </View>
    );
}

export const fieldStyles = StyleSheet.create({
    field: { gap: fantasyTokens.spacing.xs },
    label: {
        ...nightFormStyles.label,
    },
    helper: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
    error: {
        ...nightFormStyles.errorText,
    },
    /** Tall multiline field — RN has no textarea element; this is the equivalent. */
    textArea: {
        minHeight: fantasyTokens.spacing.xxl * 3 + fantasyTokens.spacing.md,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    chip: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        borderRadius: fantasyTokens.radii.sm,
    },
    chipSelected: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderColor: fantasyTokens.colors.gold,
    },
    chipText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    chipTextSelected: { color: fantasyTokens.colors.parchment, fontWeight: '700' },
    removableChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.sheet.form.card,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.xs,
    },
    removableChipText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    removableChipRemove: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
    checkbox: {
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
    },
    checkboxSelected: {
        borderColor: fantasyTokens.colors.crimson,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    checkboxText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    disabled: { opacity: 0.5 },
});
