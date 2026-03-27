import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { hpPercentage } from '@/lib/characterSheetUtils';
import InlineField from './edit-mode/InlineField';
import SheetCard from './SheetCard';
import SectionLabel from './SectionLabel';
import CardDivider from './CardDivider';

type VitalsCardProps = {
    hp: { current: number; max: number; temp: number };
    ac: number;
    speed: number;
    conditions: string[];
    editMode: boolean;
    onChangeHpCurrent: (value: number) => void;
    onChangeHpMax: (value: number) => void;
    onChangeHpTemp: (value: number) => void;
    onChangeAc: (value: number) => void;
    onChangeSpeed: (value: number) => void;
};

/**
 * Parses a numeric field value while preserving 0 for blank/invalid input.
 */
function parseNumericInput(value: string): number {
    const parsedValue = Number.parseInt(value, 10);
    if (Number.isNaN(parsedValue)) return 0;
    return parsedValue;
}

export default function VitalsCard({
    hp,
    ac,
    speed,
    conditions,
    editMode,
    onChangeHpCurrent,
    onChangeHpMax,
    onChangeHpTemp,
    onChangeAc,
    onChangeSpeed,
}: VitalsCardProps) {
    const hpPct = hpPercentage(hp.current, hp.max);

    return (
        <SheetCard index={0}>
            <SectionLabel>Vitals</SectionLabel>

            <View style={styles.vitalsRow}>
                <View style={[styles.vitalBlock, editMode && styles.vitalBlockEditable]}>
                    <View style={styles.hpEditWrap}>
                        <InlineField
                            value={String(hp.current)}
                            onChangeText={(value: string) => onChangeHpCurrent(parseNumericInput(value))}
                            editMode={editMode}
                            style={[styles.hpMain, styles.hpColor]}
                            keyboardType="number-pad"
                            align="center"
                        />
                        <Text style={styles.hpSeparator}>/</Text>
                        <InlineField
                            value={String(hp.max)}
                            onChangeText={(value: string) => onChangeHpMax(parseNumericInput(value))}
                            editMode={editMode}
                            style={[styles.hpMaxValue, styles.hpColor]}
                            keyboardType="number-pad"
                            align="center"
                        />
                    </View>
                    <Text style={styles.vitalLabel}>Hit Points</Text>
                    {!editMode && hp.temp > 0 && (
                        <Text style={styles.vitalSub}>+{hp.temp} temp</Text>
                    )}
                </View>

                <View style={[styles.vitalBlock, styles.vitalBlockBorder, editMode && styles.vitalBlockEditable]}>
                    <InlineField
                        value={String(ac)}
                        onChangeText={(value: string) => onChangeAc(parseNumericInput(value))}
                        editMode={editMode}
                        style={[styles.vitalValue, styles.acColor]}
                        keyboardType="number-pad"
                        align="center"
                    />
                    <Text style={styles.vitalLabel}>Armour Class</Text>
                </View>

                <View style={[styles.vitalBlock, styles.vitalBlockBorder, editMode && styles.vitalBlockEditable]}>
                    <InlineField
                        value={String(speed)}
                        onChangeText={(value: string) => onChangeSpeed(parseNumericInput(value))}
                        editMode={editMode}
                        style={[styles.vitalValue, styles.speedColor]}
                        keyboardType="number-pad"
                        align="center"
                    />
                    <Text style={styles.vitalLabel}>Speed</Text>
                </View>
            </View>

            <View style={styles.hpBarWrap}>
                <View style={styles.hpBarTrack}>
                    <View style={[styles.hpBarFill, { width: `${hpPct}%` }]} />
                </View>
            </View>

            <CardDivider />

            <View style={styles.tempHpRow}>
                <Text style={styles.tempHpLabel}>Temp HP</Text>
                <InlineField
                    value={hp.temp > 0 ? String(hp.temp) : ''}
                    onChangeText={(value: string) => onChangeHpTemp(parseNumericInput(value))}
                    editMode={editMode}
                    style={styles.tempHpValue}
                    keyboardType="number-pad"
                    placeholder="0"
                />
            </View>

            <View style={styles.conditionRow}>
                {conditions.length > 0 ? (
                    conditions.map((condition) => (
                        <View key={condition} style={styles.conditionTag}>
                            <Text style={styles.conditionText}>{condition}</Text>
                        </View>
                    ))
                ) : (
                    <View style={[styles.conditionTag, styles.conditionNone]}>
                        <Text style={styles.conditionTextNone}>No conditions</Text>
                    </View>
                )}
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    vitalsRow: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 18,
        gap: 10,
        alignItems: 'flex-start',
    },
    vitalBlock: {
        flex: 1,
        alignItems: 'center',
    },
    vitalBlockEditable: {
        paddingHorizontal: 2,
        paddingVertical: 4,
        borderRadius: 6,
    },
    vitalBlockBorder: {
        borderLeftWidth: 1,
        borderLeftColor: fantasyTokens.colors.divider,
    },
    vitalValue: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.stat,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
    },
    hpColor: {
        color: fantasyTokens.colors.crimson,
    },
    hpMax: {
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        opacity: 0.45,
        color: fantasyTokens.colors.crimson,
    },
    hpEditWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: 40,
    },
    hpMain: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.stat,
        fontWeight: '700',
        minWidth: 28,
    },
    hpSeparator: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        color: fantasyTokens.colors.crimson,
        opacity: 0.45,
        marginHorizontal: 1,
    },
    hpMaxValue: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        fontWeight: '700',
        opacity: 0.5,
        minWidth: 18,
    },
    acColor: {
        color: fantasyTokens.colors.greenDark,
    },
    speedColor: {
        color: fantasyTokens.colors.blueDark,
    },
    vitalLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        marginTop: 6,
        minHeight: 14,
        textAlign: 'center',
    },
    vitalSub: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
        marginTop: 2,
    },
    hpBarWrap: {
        paddingHorizontal: 18,
        paddingBottom: 14,
    },
    hpBarTrack: {
        height: 6,
        backgroundColor: 'rgba(139,26,26,0.15)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    hpBarFill: {
        height: '100%',
        backgroundColor: fantasyTokens.colors.crimson,
        borderRadius: 3,
    },
    tempHpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 18,
        paddingBottom: 12,
    },
    tempHpLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.65,
        fontWeight: '700',
    },
    tempHpValue: {
        flex: 1,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontWeight: '700',
        color: fantasyTokens.colors.inkLight,
    },
    conditionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
    },
    conditionTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.crimson,
        backgroundColor: 'rgba(139,26,26,0.08)',
    },
    conditionText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
    },
    conditionNone: {
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'transparent',
    },
    conditionTextNone: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(61,43,31,0.4)',
    },
});
