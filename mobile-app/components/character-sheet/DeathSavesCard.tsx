import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SheetCard from './SheetCard';
import SectionLabel from './SectionLabel';
import PipTrack from './PipTrack';

type DeathSavesCardProps = {
    successes: number;
    failures: number;
    onUpdate: (successes: number, failures: number) => void;
};

/**
 * Death saves card with tappable circles for successes and failures.
 *
 * **React Native learning note:**
 * We use `Pressable` instead of `TouchableOpacity` here because Pressable is
 * the newer, more flexible API. Each circle is individually tappable — tapping
 * a hollow circle fills it (increments), tapping a filled circle unfills it
 * (decrements). This gives a natural toggle feel matching the HTML prototype.
 */
export default function DeathSavesCard({ successes, failures, onUpdate }: DeathSavesCardProps) {
    function handleSuccessTap(index: number) {
        const newSuccesses = index < successes ? index : index + 1;
        onUpdate(Math.min(newSuccesses, 3), failures);
    }

    function handleFailureTap(index: number) {
        const newFailures = index < failures ? index : index + 1;
        onUpdate(successes, Math.min(newFailures, 3));
    }

    return (
        <SheetCard index={3}>
            <SectionLabel>Death Saves</SectionLabel>
            <View style={styles.row}>
                <View style={styles.column}>
                    <Text style={styles.columnLabel}>Successes</Text>
                    <PipTrack
                        count={3}
                        filledCount={successes}
                        onPressPip={handleSuccessTap}
                        getAccessibilityLabel={(index) => `Death save success ${index + 1}`}
                        getTestID={(index) => `death-save-success-circle-${index + 1}`}
                        size={16}
                        gap={6}
                        borderWidth={1.5}
                        filledColor={fantasyTokens.colors.greenDark}
                        filledBorderColor={fantasyTokens.colors.greenDark}
                        emptyBorderColor={fantasyTokens.colors.divider}
                    />
                </View>

                <View style={styles.column}>
                    <Text style={styles.columnLabel}>Failures</Text>
                    <PipTrack
                        count={3}
                        filledCount={failures}
                        onPressPip={handleFailureTap}
                        getAccessibilityLabel={(index) => `Death save failure ${index + 1}`}
                        getTestID={(index) => `death-save-failure-circle-${index + 1}`}
                        size={16}
                        gap={6}
                        borderWidth={1.5}
                        filledColor={fantasyTokens.colors.crimson}
                        filledBorderColor={fantasyTokens.colors.crimson}
                        emptyBorderColor={fantasyTokens.colors.divider}
                    />
                </View>
            </View>
        </SheetCard>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 16,
    },
    column: {
        flex: 1,
        alignItems: 'center',
    },
    columnLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(61,43,31,0.45)',
        marginBottom: 8,
    },
});
