import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumCollectionStateProps = {
    title: string;
    body: string;
    action?: {
        label: string;
        onPress: () => void;
    };
    testID: string;
};

/** Shared empty-seal presentation for empty and failed collections. */
export default function CompendiumCollectionState({
    title,
    body,
    action,
    testID,
}: CompendiumCollectionStateProps) {
    return (
        <View style={styles.state} testID={testID}>
            <View style={styles.seal}><Text style={styles.sealMark}>◇</Text></View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
            {action != null ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={action.onPress}
                    style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
                >
                    <Text style={styles.actionLabel}>{action.label}</Text>
                </Pressable>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    state: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.xl,
    },
    seal: {
        width: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        height: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.spacing.xxl,
    },
    sealMark: {
        ...fantasyTokens.typography.pageTitle,
        color: fantasyTokens.colors.claret,
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        textAlign: 'center',
    },
    body: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkSoft,
        textAlign: 'center',
    },
    action: {
        marginTop: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.sm,
    },
    actionPressed: {
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    actionLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
});
