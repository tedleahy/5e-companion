import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { Currency } from '@/types/generated_graphql_types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import InlineField from '../edit-mode/InlineField';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

type CurrencyCardProps = {
    currency: Currency;
    editMode: boolean;
    onChangeCurrency: (key: CurrencyKey, value: number) => void;
};

type CurrencyKey = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

const CURRENCY_FIELDS: readonly { key: CurrencyKey; label: string }[] = [
    { key: 'cp', label: 'CP' },
    { key: 'sp', label: 'SP' },
    { key: 'ep', label: 'EP' },
    { key: 'gp', label: 'GP' },
    { key: 'pp', label: 'PP' },
];

/**
 * Parses a currency text field into a numeric value.
 */
function parseCurrencyValue(value: string): number {
    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue)) return 0;
    return parsedValue;
}

export default function CurrencyCard({ currency, editMode, onChangeCurrency }: CurrencyCardProps) {
    return (
        <SheetCard index={0}>
            <SectionLabel>Currency</SectionLabel>
            <View style={styles.currencyRow}>
                {CURRENCY_FIELDS.map((field) => (
                    <View key={field.key} style={styles.currencyItem}>
                        <InlineField
                            value={String(currency[field.key])}
                            onChangeText={(value: string) => onChangeCurrency(field.key, parseCurrencyValue(value))}
                            editMode={editMode}
                            testID={`currency-${field.key}-amount`}
                            style={[
                                styles.currencyAmount,
                                field.key === 'gp' && styles.currencyAmountGold,
                            ]}
                            keyboardType="number-pad"
                            align="center"
                        />
                        <Text style={styles.currencyLabel}>{field.label}</Text>
                    </View>
                ))}
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    currencyRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 16,
    },
    currencyItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 4,
        paddingVertical: 10,
    },
    currencyAmount: {
        fontFamily: 'serif',
        fontSize: 18,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 20,
    },
    currencyAmountGold: {
        color: fantasyTokens.colors.gold,
    },
    currencyLabel: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.8,
        marginTop: 2,
    },
});
