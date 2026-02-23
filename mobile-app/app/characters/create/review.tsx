import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { ParchmentPanel, DetailRow } from '@/components/FantasyPrimitives';
import { ABILITY_ABBREVIATIONS, SKILL_DEFINITIONS, type AbilityKey } from '@/lib/characterSheetUtils';

export default function StepReview() {
    const { draft } = useCharacterDraft();

    const strDexCon = ['strength', 'dexterity', 'constitution'] as AbilityKey[];
    const intWisCha = ['intelligence', 'wisdom', 'charisma'] as AbilityKey[];
    const formatScoreRow = (keys: AbilityKey[]) =>
        keys.map((k) => draft.abilityScores[k]).join(' \u00B7 ');
    const formatAbbrRow = (keys: AbilityKey[]) =>
        keys.map((k) => ABILITY_ABBREVIATIONS[k]).join(' / ');

    const proficientSkills = SKILL_DEFINITIONS
        .filter((s) => draft.skillProficiencies.includes(s.key))
        .map((s) => s.label);

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Ready to begin?</Text>
            <Text style={styles.sub}>Review your character before entering the world.</Text>

            {/* Identity */}
            <Text style={styles.sectionLabel}>Identity</Text>
            <ParchmentPanel style={styles.card}>
                <DetailRow label="Name" value={draft.name} />
                <DetailRow label="Race" value={draft.race} />
                <DetailRow label="Class" value={draft.class} />
                <DetailRow label="Level" value={String(draft.level)} />
                <DetailRow label="Background" value={draft.background} />
                <DetailRow label="Alignment" value={draft.alignment || 'Not set'} />
            </ParchmentPanel>

            {/* Ability Scores */}
            <Text style={[styles.sectionLabel, styles.sectionGap]}>Ability Scores</Text>
            <ParchmentPanel style={styles.card}>
                <DetailRow label={formatAbbrRow(strDexCon)} value={formatScoreRow(strDexCon)} />
                <DetailRow label={formatAbbrRow(intWisCha)} value={formatScoreRow(intWisCha)} />
            </ParchmentPanel>

            {/* Skills */}
            <Text style={[styles.sectionLabel, styles.sectionGap]}>Skills</Text>
            <ParchmentPanel style={styles.card}>
                <DetailRow
                    label="Proficiencies"
                    value={proficientSkills.length > 0 ? proficientSkills.join(', ') : 'None selected'}
                />
            </ParchmentPanel>

            {/* Post-creation note */}
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
        fontFamily: 'serif',
        fontSize: 22,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        lineHeight: 26,
        marginBottom: 4,
    },
    sub: {
        fontFamily: 'serif',
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
    },
    sectionLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
        opacity: 0.8,
        marginBottom: 8,
    },
    sectionGap: {
        marginTop: 4,
    },
    card: {
        marginBottom: 12,
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
        fontFamily: 'serif',
        fontSize: 13,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.4)',
        lineHeight: 20,
        textAlign: 'center',
    },
});
