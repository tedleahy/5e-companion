import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type SectionLabelProps = {
    children: string;
};

export default function SectionLabel({ children }: SectionLabelProps) {
    return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
    label: {
        ...fantasyTokens.typography.sectionLabel,
        fontWeight: 'bold',
        color: fantasyTokens.colors.crimson,
        opacity: 0.8,
        paddingHorizontal: 18,
        paddingTop: 14,
    },
});
