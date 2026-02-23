import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useCharacterDraft } from '@/store/characterDraft';
import { CLASS_OPTIONS } from '@/lib/dndHelpers';
import OptionGrid from '@/components/wizard/OptionGrid';

export default function StepClass() {
    const { draft, updateDraft } = useCharacterDraft();

    function adjustLevel(delta: number) {
        const next = Math.max(1, Math.min(20, draft.level + delta));
        updateDraft({ level: next });
    }

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Choose your class.</Text>
            <Text style={styles.sub}>Your calling defines your path.</Text>

            <OptionGrid
                options={CLASS_OPTIONS}
                selected={draft.class}
                onSelect={(value) => updateDraft({ class: value })}
            />

            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Starting Level</Text>

            <View style={styles.stepper}>
                <Pressable
                    onPress={() => adjustLevel(-1)}
                    style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                >
                    <Text style={styles.stepperBtnText}>{'\u2212'}</Text>
                </Pressable>
                <Text style={styles.stepperVal}>{draft.level}</Text>
                <Pressable
                    onPress={() => adjustLevel(1)}
                    style={({ pressed }) => [styles.stepperBtn, pressed && styles.stepperBtnPressed]}
                >
                    <Text style={styles.stepperBtnText}>+</Text>
                </Pressable>
            </View>
            <Text style={styles.hint}>Most campaigns start at level 1. Check with your DM.</Text>
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
    divider: {
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.12)',
        marginVertical: 16,
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
    stepper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    stepperBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperBtnPressed: {
        backgroundColor: 'rgba(201,146,42,0.08)',
    },
    stepperBtnText: {
        fontFamily: 'serif',
        fontSize: 18,
        color: 'rgba(201,146,42,0.5)',
    },
    stepperVal: {
        flex: 1,
        textAlign: 'center',
        fontFamily: 'serif',
        fontSize: 20,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
    },
    hint: {
        fontFamily: 'serif',
        fontSize: 12,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.3)',
        marginTop: 6,
        lineHeight: 17,
    },
});
