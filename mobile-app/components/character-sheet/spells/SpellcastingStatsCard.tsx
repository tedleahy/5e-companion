import { StyleSheet, View } from 'react-native';
import { formatSignedNumber } from '@/lib/characterSheetUtils';
import SheetCard from '../SheetCard';
import SectionLabel from '../SectionLabel';
import StatPill from '../StatPill';

type SpellcastingStatsCardProps = {
    spellcastingAbility?: string | null;
    spellSaveDC?: number | null;
    spellAttackBonus?: number | null;
    preparedCount: number;
};

function abilityAbbreviation(ability: string | null | undefined): string {
    if (!ability) return '\u2014';
    return ability.slice(0, 3).toUpperCase();
}

function spellAttackLabel(spellAttackBonus: number | null | undefined): string {
    if (spellAttackBonus == null) return '\u2014';
    return formatSignedNumber(spellAttackBonus);
}

function spellSaveDCLabel(spellSaveDC: number | null | undefined): string {
    if (spellSaveDC == null) return '\u2014';
    return String(spellSaveDC);
}

export default function SpellcastingStatsCard({
    spellcastingAbility,
    spellSaveDC,
    spellAttackBonus,
    preparedCount,
}: SpellcastingStatsCardProps) {
    return (
        <SheetCard index={0}>
            <SectionLabel>Spellcasting</SectionLabel>
            <View style={styles.row}>
                <StatPill label="Ability" value={abilityAbbreviation(spellcastingAbility)} />
                <StatPill label="Atk Bonus" value={spellAttackLabel(spellAttackBonus)} />
                <StatPill label="Save DC" value={spellSaveDCLabel(spellSaveDC)} />
                <StatPill label="Prepared" value={String(preparedCount)} />
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 7,
        paddingVertical: 12,
        paddingHorizontal: 18,
        paddingBottom: 16,
    },
});
