import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import OptionGrid from '@/components/wizard/OptionGrid';

export default function StepClass() {
    const { draft, updateDraft } = useCharacterDraft();

    function handleClassSelect(value: string) {
        if (value !== draft.class) {
            updateDraft({ class: value, subclass: '' });
        }
    }

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Choose your class.</Text>
            <Text style={styles.sub}>Your calling defines your path.</Text>

            <OptionGrid
                options={CLASS_OPTIONS}
                selected={draft.class}
                onSelect={handleClassSelect}
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
});
