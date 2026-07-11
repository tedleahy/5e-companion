import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type StepperCardProps = {
    children: React.ReactNode;
    testID?: string;
};

/**
 * Parchment row that evenly spaces labeled numeric steppers.
 */
export function StepperCard({ children, testID }: StepperCardProps) {
    return (
        <View style={styles.card} testID={testID}>
            {children}
        </View>
    );
}

type StepperCardFieldProps = {
    label: string;
    children: React.ReactNode;
};

/**
 * Centered label + stepper cell for use inside {@link StepperCard}.
 */
export function StepperCardField({ label, children }: StepperCardFieldProps) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.md,
        paddingHorizontal: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
    },
    field: {
        flex: 1,
        gap: fantasyTokens.spacing.xs,
        alignItems: 'center',
    },
    label: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
        fontSize: fantasyTokens.fontSizes.caption,
        textAlign: 'center',
    },
});
