import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

export default function CompendiumBodyText({ children }: { children: ReactNode }) {
    return <Text style={styles.body} selectable>{children}</Text>;
}

const styles = StyleSheet.create({
    body: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
});
