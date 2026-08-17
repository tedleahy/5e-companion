import { StyleSheet, Text } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

/** Claret emblem shown in the mark slot of a browse row. */
export default function CompendiumRowMark({
    children,
    italic = false,
}: {
    children: string;
    italic?: boolean;
}) {
    return <Text style={[styles.mark, italic && styles.italic]}>{children}</Text>;
}

const styles = StyleSheet.create({
    mark: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
    },
    italic: {
        fontStyle: 'italic',
    },
});
