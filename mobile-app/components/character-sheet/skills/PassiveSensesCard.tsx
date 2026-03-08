import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

type PassiveSensesCardProps = {
    passivePerception: number;
    passiveInvestigation: number;
    passiveInsight: number;
};

export default function PassiveSensesCard({
    passivePerception,
    passiveInvestigation,
    passiveInsight,
}: PassiveSensesCardProps) {
    return (
        <SheetCard index={0}>
            <SectionLabel>Passive Senses</SectionLabel>
            <View style={styles.passiveRow}>
                <PassiveBlock label="Perception" value={passivePerception} testID="passive-perception-value" />
                <PassiveBlock label="Investigation" value={passiveInvestigation} testID="passive-investigation-value" />
                <PassiveBlock label="Insight" value={passiveInsight} testID="passive-insight-value" />
            </View>
        </SheetCard>
    );
}

type PassiveBlockProps = {
    label: string;
    value: number;
    testID: string;
};

function PassiveBlock({ label, value, testID }: PassiveBlockProps) {
    return (
        <View style={styles.passiveBlock}>
            <Text style={styles.passiveValue} testID={testID}>
                {value}
            </Text>
            <Text style={styles.passiveLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    passiveRow: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 16,
        gap: 8,
    },
    passiveBlock: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    passiveValue: {
        fontFamily: 'serif',
        fontSize: 24,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 24,
    },
    passiveLabel: {
        fontFamily: 'serif',
        fontSize: 8,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.5,
        marginTop: 4,
    },
});
