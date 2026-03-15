import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { SKILL_DEFINITIONS, ABILITY_ABBREVIATIONS, type AbilityKey, type SkillKey } from '@/lib/characterSheetUtils';
import {
    BACKGROUND_SKILL_PROFICIENCIES,
    CLASS_ARMOUR_PROFICIENCIES,
    CLASS_SAVING_THROWS,
    CLASS_SKILL_OPTIONS,
    CLASS_WEAPON_PROFICIENCIES,
} from '@/lib/dndHelpers';
import ProficiencyItem from '@/components/wizard/ProficiencyItem';

export default function StepSkills() {
    const { draft, toggleSkillProficiency, toggleExpertise } = useCharacterDraft();
    const savingThrows = CLASS_SAVING_THROWS[draft.class] ?? [];

    const backgroundSkillProfs: SkillKey[] = BACKGROUND_SKILL_PROFICIENCIES[draft.background] ?? [];
    const backgroundSkills = SKILL_DEFINITIONS.filter((skill) => backgroundSkillProfs.includes(skill.key));

    const classOpts = CLASS_SKILL_OPTIONS[draft.class];
    const classOptions: SkillKey[] = classOpts?.options ?? [];
    const classPickLimit = classOpts?.pick ?? 0;

    const armourProfs = CLASS_ARMOUR_PROFICIENCIES[draft.class] ?? [];
    const weaponProfs = CLASS_WEAPON_PROFICIENCIES[draft.class] ?? [];

    const classPickCount = draft.skillProficiencies.filter(
        (skill) => classOptions.includes(skill) && !backgroundSkillProfs.includes(skill),
    ).length;
    const atClassLimit = classPickCount >= classPickLimit;

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Choose your skills.</Text>
            <Text style={styles.sub}>
                Select the proficiencies that suit your character&apos;s background and class.
            </Text>

            {savingThrows.length > 0 && (
                <>
                    <Text style={styles.sectionLabel}>Saving Throw Proficiencies</Text>
                    <Text style={styles.savingThrowNote}>
                        Granted by your class ({draft.class})
                    </Text>
                    <View style={styles.savingThrowRow}>
                        {savingThrows.map((ability: AbilityKey) => (
                            <View key={ability} style={styles.savingThrowChip}>
                                <Text style={styles.savingThrowChipText}>
                                    {ABILITY_ABBREVIATIONS[ability]}
                                </Text>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {backgroundSkills.length > 0 && (
                <>
                    <Text style={styles.sectionLabel}>
                        Background Skills ({draft.background})
                    </Text>
                    <View style={styles.list}>
                        {backgroundSkills.map((skill) => (
                            <ProficiencyItem
                                key={skill.key}
                                name={skill.label}
                                abilityAbbr={ABILITY_ABBREVIATIONS[skill.ability]}
                                selected
                                locked
                                onToggle={() => {}}
                            />
                        ))}
                    </View>
                </>
            )}

            {classOptions.length > 0 && (
                <>
                    <Text style={[styles.sectionLabel, backgroundSkills.length > 0 && styles.sectionGap]}>
                        Class Skills — Pick {classPickLimit}
                        {classPickLimit > 0 && ` (${classPickCount}/${classPickLimit})`}
                    </Text>
                    <View style={styles.list}>
                        {SKILL_DEFINITIONS.filter(
                            (s) => classOptions.includes(s.key) && !backgroundSkillProfs.includes(s.key),
                        ).map((skill) => {
                            const isSelected = draft.skillProficiencies.includes(skill.key);
                            const isDisabled = !isSelected && atClassLimit;
                            const isExpert = draft.expertiseSkills.includes(skill.key);
                            return (
                                <ProficiencyItem
                                    key={skill.key}
                                    name={skill.label}
                                    abilityAbbr={ABILITY_ABBREVIATIONS[skill.ability]}
                                    selected={isSelected}
                                    disabled={isDisabled}
                                    expertise={isExpert}
                                    onToggle={() => toggleSkillProficiency(skill.key)}
                                    onToggleExpertise={() => toggleExpertise(skill.key)}
                                />
                            );
                        })}
                    </View>
                    <Text style={styles.expertiseHint}>
                        Long-press a selected skill to toggle expertise.
                    </Text>
                </>
            )}

            {(armourProfs.length > 0 || weaponProfs.length > 0) && (
                <View style={styles.equipSection}>
                    {armourProfs.length > 0 && (
                        <>
                            <Text style={styles.sectionLabel}>Armour Proficiencies</Text>
                            <View style={styles.chipRow}>
                                {armourProfs.map((p) => (
                                    <View key={p} style={styles.equipChip}>
                                        <Text style={styles.equipChipText}>{p}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                    {weaponProfs.length > 0 && (
                        <>
                            <Text style={[styles.sectionLabel, armourProfs.length > 0 && styles.sectionGap]}>
                                Weapon Proficiencies
                            </Text>
                            <View style={styles.chipRow}>
                                {weaponProfs.map((p) => (
                                    <View key={p} style={styles.equipChip}>
                                        <Text style={styles.equipChipText}>{p}</Text>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            )}

            <Text style={styles.hint}>
                You can add more proficiencies later from the Skills tab on your character sheet.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    heading: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 22,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        lineHeight: 26,
        marginBottom: 4,
    },
    sub: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
    },
    sectionLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
        opacity: 0.75,
        marginBottom: 8,
    },
    savingThrowNote: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.45)',
        marginBottom: 8,
    },
    savingThrowRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    savingThrowChip: {
        backgroundColor: 'rgba(42,122,42,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(42,122,42,0.25)',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    savingThrowChipText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        letterSpacing: 1,
        color: '#2a7a2a',
        fontWeight: '600',
    },
    sectionGap: {
        marginTop: 16,
    },
    list: {
        gap: 6,
    },
    equipSection: {
        marginTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.12)',
        paddingTop: 16,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    equipChip: {
        backgroundColor: 'rgba(201,146,42,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.18)',
        borderRadius: 8,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    equipChipText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        color: 'rgba(201,146,42,0.6)',
    },
    expertiseHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        fontStyle: 'italic',
        color: 'rgba(106,79,212,0.45)',
        marginTop: 6,
    },
    hint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.3)',
        marginTop: 10,
        lineHeight: 17,
    },
});
