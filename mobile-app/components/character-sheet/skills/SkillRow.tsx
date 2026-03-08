import { Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import {
    ABILITY_ABBREVIATIONS,
    formatSignedNumber,
    type AbilityKey,
    type SkillKey,
} from '@/lib/characterSheetUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { ProficiencyLevel } from '@/types/generated_graphql_types';
import ProficiencyDot from '../ProficiencyDot';

type SkillRowProps = {
    skillKey: SkillKey;
    skillLabel: string;
    ability: AbilityKey;
    proficiencyLevel: ProficiencyLevel;
    modifier: number;
    onPress: (skillKey: SkillKey) => void;
};

export default function SkillRow({
    skillKey,
    skillLabel,
    ability,
    proficiencyLevel,
    modifier,
    onPress,
}: SkillRowProps) {
    const isExpert = proficiencyLevel === ProficiencyLevel.Expert;
    const isProficient = proficiencyLevel !== ProficiencyLevel.None;

    return (
        <Pressable
            onPress={() => onPress(skillKey)}
            style={styles.skillRow}
            accessibilityRole="button"
            accessibilityLabel={`Cycle proficiency for ${skillLabel}`}
            testID={`skills-tab-row-${skillKey}`}
        >
            <ProficiencyDot level={proficiencyLevel} />
            <Text style={[styles.skillName, isProficient && styles.skillNameEmphasis]}>
                {skillLabel}
            </Text>
            <Text style={styles.skillAttribute}>{ABILITY_ABBREVIATIONS[ability]}</Text>
            <Text
                style={[
                    styles.skillModifier,
                    modifier > 0 && styles.skillModifierPositive,
                    modifier < 0 && styles.skillModifierNegative,
                    isExpert && styles.skillModifierExpert,
                ]}
            >
                {formatSignedNumber(modifier)}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    skillRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139,90,43,0.12)',
    },
    skillName: {
        flex: 1,
        fontFamily: 'serif',
        fontSize: 14,
        color: fantasyTokens.colors.inkLight,
    },
    skillNameEmphasis: {
        color: fantasyTokens.colors.inkDark,
        fontWeight: '600',
    },
    skillAttribute: {
        width: 24,
        textAlign: 'center',
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.4,
    },
    skillModifier: {
        minWidth: 34,
        textAlign: 'right',
        fontFamily: 'serif',
        fontSize: 13,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
    },
    skillModifierPositive: {
        color: fantasyTokens.colors.greenDark,
    },
    skillModifierNegative: {
        color: fantasyTokens.colors.crimson,
    },
    skillModifierExpert: {
        color: fantasyTokens.colors.gold,
    },
});
