import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { ProficiencyLevel } from '@/types/generated_graphql_types';
import ProficiencyDot from '../ProficiencyDot';

export default function SkillsLegend() {
    return (
        <View style={styles.legend}>
            <LegendItem label="Untrained" level={ProficiencyLevel.None} />
            <LegendItem label="Proficient" level={ProficiencyLevel.Proficient} />
            <LegendItem label="Expertise" level={ProficiencyLevel.Expert} />
        </View>
    );
}

type LegendItemProps = {
    label: string;
    level: ProficiencyLevel;
};

function LegendItem({ label, level }: LegendItemProps) {
    return (
        <View style={styles.legendItem}>
            <ProficiencyDot level={level} />
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    legend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 14,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    legendText: {
        fontFamily: 'serif',
        fontSize: 11,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.55,
        fontStyle: 'italic',
    },
});
