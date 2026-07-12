import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { FantasyFormTextInput } from '@/components/FantasyFormTextInput';
import { NightFormCard } from '@/components/sheets/NightFormCard';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';

/**
 * Props for the custom entry card component.
 * Used for custom invocation/metamagic entries and invocation swap inputs.
 */
type CustomEntryCardProps = {
    firstLabel: string;
    firstValue: string;
    onFirstChange: (text: string) => void;
    firstPlaceholder?: string;
    firstTestID?: string;
    secondLabel: string;
    secondValue: string;
    onSecondChange: (text: string) => void;
    secondPlaceholder?: string;
    secondTestID?: string;
    secondMultiline?: boolean;
    onRemove: () => void;
    removeLabel: string;
    removeTestID?: string;
    cardTestID?: string;
};

/**
 * Reusable card for custom entry inputs with two text fields and a remove button.
 * Used in invocation picker, metamagic picker, and invocation swap section.
 */
export default function CustomEntryCard({
    firstLabel,
    firstValue,
    onFirstChange,
    firstPlaceholder,
    firstTestID,
    secondLabel,
    secondValue,
    onSecondChange,
    secondPlaceholder,
    secondTestID,
    secondMultiline,
    onRemove,
    removeLabel,
    removeTestID,
    cardTestID,
}: CustomEntryCardProps) {
    return (
        <NightFormCard style={styles.customEntryCard} testID={cardTestID}>
            <FantasyFormTextInput
                label={firstLabel}
                value={firstValue}
                onChangeText={onFirstChange}
                placeholder={firstPlaceholder}
                testID={firstTestID}
            />
            <FantasyFormTextInput
                label={secondLabel}
                value={secondValue}
                onChangeText={onSecondChange}
                placeholder={secondPlaceholder}
                multiline={secondMultiline}
                testID={secondTestID}
            />
            <Pressable
                onPress={onRemove}
                style={styles.removeCustomButton}
                testID={removeTestID}
                accessibilityLabel={removeLabel}
            >
                <Text style={styles.removeCustomButtonText}>{removeLabel}</Text>
            </Pressable>
        </NightFormCard>
    );
}

const styles = StyleSheet.create({
    customEntryCard: {
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.sm,
    },
    removeCustomButton: {
        alignSelf: 'flex-end',
    },
    removeCustomButtonText: {
        ...nightFormStyles.dashedAddButtonText,
    },
});
