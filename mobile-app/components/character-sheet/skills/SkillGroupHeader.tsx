import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatSignedNumber } from '@/lib/characterSheetUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SkillGroupHeaderProps = {
    abilityLabel: string;
    abilityScore: number;
    abilityModifier: number;
    isHighestAbility: boolean;
};

export default function SkillGroupHeader({
    abilityLabel,
    abilityScore,
    abilityModifier: modifier,
    isHighestAbility,
}: SkillGroupHeaderProps) {
    return (
        <View style={styles.groupHeader}>
            <Text style={styles.groupLabel}>{abilityLabel}</Text>
            <View style={styles.groupLine} />
            <Text style={[styles.groupValue, isHighestAbility && styles.groupValueHighest]}>
                {abilityScore} / {formatSignedNumber(modifier)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 4,
    },
    groupLabel: {
        fontFamily: 'serif',
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.45,
    },
    groupLine: {
        flex: 1,
        height: 1,
        backgroundColor: fantasyTokens.colors.divider,
    },
    groupValue: {
        fontFamily: 'serif',
        fontSize: 10,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
        opacity: 0.5,
    },
    groupValueHighest: {
        color: fantasyTokens.colors.gold,
        opacity: 1,
    },
});
