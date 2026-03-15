import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { abilityModifier, formatSignedNumber, ABILITY_ABBREVIATIONS, type AbilityKey } from '@/lib/characterSheetUtils';

type Props = {
    ability: AbilityKey;
    score: number;
    onIncrement: () => void;
    onDecrement: () => void;
    /** Racial ability bonus to display (e.g. +2). */
    racialBonus?: number;
};

export default function AbilityBlock({ ability, score, onIncrement, onDecrement, racialBonus }: Props) {
    const mod = abilityModifier(score);
    const modStr = formatSignedNumber(mod);
    const isPositive = mod > 0;
    const isNegative = mod < 0;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{ABILITY_ABBREVIATIONS[ability]}</Text>
            <View style={styles.row}>
                <Pressable
                    onPress={onDecrement}
                    style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                    hitSlop={4}
                >
                    <Text style={styles.btnText}>{'\u2212'}</Text>
                </Pressable>
                <Text style={styles.value}>{score}</Text>
                {racialBonus != null && racialBonus !== 0 && (
                    <Text style={styles.bonusTag}>+{racialBonus}</Text>
                )}
                <Pressable
                    onPress={onIncrement}
                    style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
                    hitSlop={4}
                >
                    <Text style={styles.btnText}>+</Text>
                </Pressable>
            </View>
            <View style={[styles.modPill, isPositive && styles.modPositive, isNegative && styles.modNegative]}>
                <Text
                    style={[
                        styles.modText,
                        isPositive && styles.modTextPositive,
                        isNegative && styles.modTextNegative,
                    ]}
                >
                    {modStr}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    label: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    btn: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: 'rgba(201,146,42,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPressed: {
        backgroundColor: 'rgba(201,146,42,0.18)',
    },
    btnText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        color: 'rgba(201,146,42,0.6)',
    },
    value: {
        flex: 1,
        textAlign: 'center',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 22,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
    },
    modPill: {
        borderRadius: 12,
        paddingVertical: 1,
        paddingHorizontal: 6,
        alignSelf: 'center',
        marginTop: 4,
        backgroundColor: 'rgba(139,26,26,0.1)',
    },
    modPositive: {
        backgroundColor: 'rgba(42,122,42,0.1)',
    },
    modNegative: {
        backgroundColor: 'rgba(139,26,26,0.1)',
    },
    modText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        fontWeight: '600',
        color: fantasyTokens.colors.crimson,
        textAlign: 'center',
    },
    modTextPositive: {
        color: '#2a7a2a',
    },
    modTextNegative: {
        color: fantasyTokens.colors.crimson,
    },
    bonusTag: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        fontWeight: '600',
        color: '#2a7a2a',
        position: 'absolute',
        right: 6,
        top: 4,
    },
});
