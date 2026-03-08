import { StyleSheet, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

export default function CardDivider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    divider: {
        height: 1,
        backgroundColor: fantasyTokens.colors.divider,
        marginHorizontal: 18,
    },
});
