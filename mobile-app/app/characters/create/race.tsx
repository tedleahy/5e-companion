import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { RACE_OPTIONS } from '@/lib/dndHelpers';
import OptionGrid from '@/components/wizard/OptionGrid';

export default function StepRace() {
    const { draft, updateDraft } = useCharacterDraft();

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Choose your race.</Text>
            <Text style={styles.sub}>Your lineage shapes who you are.</Text>

            <OptionGrid
                options={RACE_OPTIONS}
                selected={draft.race}
                onSelect={(value) => updateDraft({ race: value })}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        padding: 20,
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
});
