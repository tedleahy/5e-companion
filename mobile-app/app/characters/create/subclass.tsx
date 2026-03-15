import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { SUBCLASS_OPTIONS } from '@/lib/characterCreation/options';
import OptionGrid from '@/components/wizard/OptionGrid';

export default function StepSubclass() {
    const { draft, updateDraft } = useCharacterDraft();
    const subclassOptions = SUBCLASS_OPTIONS[draft.class];

    if (!subclassOptions || subclassOptions.length === 0) {
        return (
            <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
                <Text style={styles.heading}>No subclass available.</Text>
                <Text style={styles.sub}>
                    {draft.class || 'Your class'} does not have selectable subclasses at this time.
                </Text>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Choose your subclass.</Text>
            <Text style={styles.sub}>Specialise within your chosen path.</Text>

            <OptionGrid
                options={subclassOptions}
                selected={draft.subclass}
                onSelect={(value) => updateDraft({ subclass: value })}
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
