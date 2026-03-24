import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { ParchmentPanel, DetailRow } from '@/components/FantasyPrimitives';
import { ABILITY_ABBREVIATIONS, ABILITY_KEYS, abilityModifier, SKILL_DEFINITIONS } from '@/lib/characterSheetUtils';
import { BACKGROUND_SKILL_PROFICIENCIES, CLASS_SAVING_THROWS } from '@/lib/characterCreation/classRules';
import { applyRacialBonuses } from '@/lib/characterCreation/raceRules';
import { CREATE_CHARACTER_ROUTES } from '@/lib/characterCreation/routes';
import {
    classLabel,
    formatDraftClassSummary,
    formatClassRowLabel,
    sortClassRowsForDisplay,
    startingClassRow,
} from '@/lib/characterCreation/multiclass';

export default function StepReview() {
    const { draft } = useCharacterDraft();
    const router = useRouter();

    const finalScores = applyRacialBonuses(draft.abilityScores, draft.race);

    const bgSkills = BACKGROUND_SKILL_PROFICIENCIES[draft.background] ?? [];
    const allProfSkills = new Set([...draft.skillProficiencies, ...bgSkills]);
    const proficientSkillDefs = SKILL_DEFINITIONS.filter((s) => allProfSkills.has(s.key));
    const startingClass = startingClassRow(draft.classes, draft.startingClassId);
    const savingThrows = CLASS_SAVING_THROWS[startingClass?.classId ?? ''] ?? [];
    const displayClassRows = sortClassRowsForDisplay(draft.classes, draft.startingClassId);

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Ready to begin?</Text>
            <Text style={styles.sub}>Review your character before entering the world.</Text>

            <Pressable onPress={() => router.push(CREATE_CHARACTER_ROUTES.identity)}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Identity</Text>
                    <Text style={styles.editHint}>Edit {'\u203A'}</Text>
                </View>
            </Pressable>
            <ParchmentPanel style={styles.card}>
                <DetailRow label="Name" value={draft.name} />
                <DetailRow label="Race" value={draft.race} />
                <DetailRow label="Level" value={String(draft.level)} />
                <DetailRow label="Background" value={draft.background} />
                <DetailRow label="Alignment" value={draft.alignment || 'Not set'} />
            </ParchmentPanel>

            <Pressable onPress={() => router.push(CREATE_CHARACTER_ROUTES.class)}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>Class Composition</Text>
                    <Text style={styles.editHint}>Edit {'\u203A'}</Text>
                </View>
            </Pressable>
            <ParchmentPanel style={styles.card}>
                <DetailRow label="Summary" value={formatDraftClassSummary(draft.classes, draft.startingClassId)} />
                <DetailRow label="Starting Class" value={startingClass ? classLabel(startingClass.classId) : 'Not set'} />
                <View style={styles.classList}>
                    {displayClassRows.map((classRow, index) => (
                        <View key={`${classRow.classId || 'class'}-${index}`} style={styles.classListRow}>
                            <View>
                                <Text style={styles.classListValue}>{formatClassRowLabel(classRow)}</Text>
                                <Text style={styles.classListMeta}>
                                    Level {classRow.level}
                                    {classRow.classId === draft.startingClassId ? ' - starting class' : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ParchmentPanel>

            <Pressable onPress={() => router.push(CREATE_CHARACTER_ROUTES.abilities)}>
                <View style={[styles.sectionHeader, styles.sectionGap]}>
                    <Text style={styles.sectionLabel}>Ability Scores</Text>
                    <Text style={styles.editHint}>Edit {'\u203A'}</Text>
                </View>
            </Pressable>
            <View style={styles.abilityRow}>
                {ABILITY_KEYS.map((key) => {
                    const score = finalScores[key];
                    const mod = abilityModifier(score);
                    const modStr = mod >= 0 ? `+${mod}` : String(mod);
                    return (
                        <View key={key} style={styles.abilityBox}>
                            <Text style={styles.abilityAbbr}>{ABILITY_ABBREVIATIONS[key]}</Text>
                            <Text style={styles.abilityScore}>{score}</Text>
                            <Text style={styles.abilityMod}>{modStr}</Text>
                        </View>
                    );
                })}
            </View>

            {/* Skills & Proficiencies — tap to edit */}
            <Pressable onPress={() => router.push(CREATE_CHARACTER_ROUTES.skills)}>
                <View style={[styles.sectionHeader, styles.sectionGap]}>
                    <Text style={styles.sectionLabel}>Proficiencies</Text>
                    <Text style={styles.editHint}>Edit {'\u203A'}</Text>
                </View>
            </Pressable>

            {savingThrows.length > 0 && (
                <View style={styles.profSubSection}>
                    <Text style={styles.profSubLabel}>Saving Throws</Text>
                    <View style={styles.profChipRow}>
                        {savingThrows.map((a) => (
                            <View key={a} style={styles.profChip}>
                                <Text style={styles.profChipText}>{ABILITY_ABBREVIATIONS[a]}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <View style={styles.profSubSection}>
                <Text style={styles.profSubLabel}>
                    Skills ({proficientSkillDefs.length})
                </Text>
                {proficientSkillDefs.length === 0 ? (
                    <Text style={styles.profNone}>None selected</Text>
                ) : (
                    <View style={styles.profTable}>
                        {proficientSkillDefs.map((skill) => {
                            const isExpert = draft.expertiseSkills.includes(skill.key);
                            return (
                                <View key={skill.key} style={styles.profRow}>
                                    <Text style={styles.profSkillName}>{skill.label}</Text>
                                    <Text style={styles.profSkillAbility}>
                                        {ABILITY_ABBREVIATIONS[skill.ability]}
                                    </Text>
                                    {isExpert && (
                                        <Text style={styles.profExpertTag}>EXP</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
            <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                    Spells, equipment, features and the rest can all be filled in from your character
                    sheet after creation.
                </Text>
            </View>
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
        opacity: 0.8,
        marginBottom: 8,
    },
    editHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 1,
        color: 'rgba(201,146,42,0.4)',
        marginBottom: 8,
    },
    sectionGap: {
        marginTop: 4,
    },
    card: {
        marginBottom: 12,
    },
    classList: {
        marginTop: 8,
        gap: 10,
    },
    classListRow: {
        paddingTop: 2,
    },
    classListValue: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        color: fantasyTokens.colors.inkDark,
    },
    classListMeta: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        color: fantasyTokens.colors.inkSoft,
        marginTop: 2,
    },
    abilityRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 12,
    },
    abilityBox: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 8,
        paddingVertical: 8,
    },
    abilityAbbr: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 2,
    },
    abilityScore: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 18,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
    },
    abilityMod: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        color: 'rgba(201,146,42,0.55)',
        marginTop: 1,
    },
    profSubSection: {
        marginBottom: 12,
    },
    profSubLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.45)',
        marginBottom: 6,
    },
    profChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    profChip: {
        backgroundColor: 'rgba(42,122,42,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(42,122,42,0.2)',
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
    },
    profChipText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        letterSpacing: 1,
        color: '#2a7a2a',
    },
    profNone: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.3)',
    },
    profTable: {
        backgroundColor: 'rgba(240,224,188,0.04)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.12)',
        borderRadius: 8,
        overflow: 'hidden',
    },
    profRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.06)',
    },
    profSkillName: {
        flex: 1,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        color: fantasyTokens.colors.parchment,
    },
    profSkillAbility: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 1,
        color: 'rgba(201,146,42,0.4)',
        marginRight: 8,
    },
    profExpertTag: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
        letterSpacing: 1,
        color: 'rgba(106,79,212,0.7)',
        textTransform: 'uppercase',
    },
    noteBox: {
        marginTop: 14,
        backgroundColor: 'rgba(201,146,42,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.12)',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    noteText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 13,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.4)',
        lineHeight: 20,
        textAlign: 'center',
    },
});
