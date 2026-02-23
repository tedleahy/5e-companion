import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { SKILL_DEFINITIONS, ABILITY_ABBREVIATIONS } from '@/lib/characterSheetUtils';
import ProficiencyItem from '@/components/wizard/ProficiencyItem';

export default function StepSkills() {
    const { draft, toggleSkillProficiency } = useCharacterDraft();

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Choose your skills.</Text>
            <Text style={styles.sub}>
                Select the proficiencies that suit your character&apos;s background and class.
            </Text>

            <Text style={styles.sectionLabel}>Skill Proficiencies</Text>

            <View style={styles.list}>
                {SKILL_DEFINITIONS.map((skill) => (
                    <ProficiencyItem
                        key={skill.key}
                        name={skill.label}
                        abilityAbbr={ABILITY_ABBREVIATIONS[skill.ability]}
                        selected={draft.skillProficiencies.includes(skill.key)}
                        onToggle={() => toggleSkillProficiency(skill.key)}
                    />
                ))}
            </View>

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
        opacity: 0.75,
        marginBottom: 8,
    },
    list: {
        gap: 6,
    },
    hint: {
        fontFamily: 'serif',
        fontSize: 12,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.3)',
        marginTop: 10,
        lineHeight: 17,
    },
});
