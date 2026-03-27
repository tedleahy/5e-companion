import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { formatSignedNumber } from '@/lib/characterSheetUtils';
import { spellSlotKindLabel } from '@/lib/characterClassSummary';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { SpellcastingProfile } from '@/types/generated_graphql_types';
import SheetCard from '../SheetCard';
import SectionLabel from '../SectionLabel';
import StatPill from '../StatPill';

type SpellcastingStatsCardProps = {
    spellcastingProfiles: SpellcastingProfile[];
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
    spellcastingProfiles,
}: SpellcastingStatsCardProps) {
    return (
        <SheetCard index={0}>
            <SectionLabel>Spellcasting</SectionLabel>
            <View style={styles.content}>
                {spellcastingProfiles.map((profile) => (
                    <View key={`${profile.slotKind}-${profile.classId}`} style={styles.profileBlock}>
                        <View style={styles.profileHeader}>
                            <Text style={styles.profileName}>{profile.className}</Text>
                            {spellcastingProfiles.length > 1 && (
                                <Text style={styles.profileKind}>{spellSlotKindLabel(profile.slotKind)}</Text>
                            )}
                        </View>
                        <View style={styles.row}>
                            <StatPill label="Ability" value={abilityAbbreviation(profile.spellcastingAbility)} />
                            <StatPill label="Atk Bonus" value={spellAttackLabel(profile.spellAttackBonus)} />
                            <StatPill label="Save DC" value={spellSaveDCLabel(profile.spellSaveDC)} />
                        </View>
                    </View>
                ))}
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    content: {
        paddingVertical: 12,
        paddingHorizontal: 18,
        gap: 12,
    },
    profileBlock: {
        gap: 8,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    profileName: {
        color: fantasyTokens.colors.inkDark,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        fontWeight: '700',
    },
    profileKind: {
        color: fantasyTokens.colors.gold,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    row: {
        flexDirection: 'row',
        gap: 7,
    },
    summaryRow: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
    },
    summaryPillWrap: {
        width: 104,
    },
});
