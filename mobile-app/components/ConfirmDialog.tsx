import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Dialog, Portal, Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type ConfirmDialogProps = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

/**
 * Cross-platform confirmation dialog built on React Native Paper's Portal + Dialog.
 * Works on web and native, styled to match the fantasy UI.
 */
export default function ConfirmDialog({
    visible,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={onCancel}
                style={[styles.dialog, isTablet && styles.dialogTablet]}
            >
                <Dialog.Title style={styles.title}>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text style={styles.message}>{message}</Text>
                </Dialog.Content>
                <Dialog.Actions style={styles.actions}>
                    <View style={styles.buttonRow}>
                        <Pressable
                            onPress={onCancel}
                            style={styles.cancelButton}
                            accessibilityRole="button"
                            accessibilityLabel={cancelLabel}
                        >
                            <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
                        </Pressable>
                        <Pressable
                            onPress={onConfirm}
                            style={styles.confirmButton}
                            accessibilityRole="button"
                            accessibilityLabel={confirmLabel}
                        >
                            <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
                        </Pressable>
                    </View>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    dialog: {
        backgroundColor: fantasyTokens.colors.parchment,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        maxWidth: 420,
        alignSelf: 'center',
        width: '90%',
        marginHorizontal: 'auto',
    },
    dialogTablet: {
        maxWidth: 480,
        width: 480,
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    message: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    actions: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.md,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
        justifyContent: 'flex-end',
        flex: 1,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    cancelButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
    },
    confirmButton: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    confirmButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
});
