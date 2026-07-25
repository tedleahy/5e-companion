import { Modal, Pressable, StyleSheet, Text as NativeText, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type ConfirmDialogProps = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** When true, blocks confirm/cancel/dismiss and disables both actions. */
    pending?: boolean;
    /** Error shown inside the dialog (e.g. mutation failure while still open). */
    errorMessage?: string | null;
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
    pending = false,
    errorMessage = null,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;

    function handleCancel() {
        if (pending) return;
        onCancel();
    }

    function handleConfirm() {
        if (pending) return;
        onConfirm();
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.modalRoot}>
                <Pressable
                    style={styles.backdrop}
                    onPress={handleCancel}
                    disabled={pending}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss dialog"
                    accessibilityState={{ disabled: pending }}
                />
                <View style={[styles.dialog, isTablet && styles.dialogTablet]}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    {errorMessage ? (
                        <Text style={styles.error} testID="confirm-dialog-error">{errorMessage}</Text>
                    ) : null}
                    <View style={styles.actions}>
                        <View style={styles.buttonRow}>
                            <Pressable
                                onPress={handleCancel}
                                disabled={pending}
                                style={[styles.cancelButton, pending && styles.disabledButton]}
                                accessibilityRole="button"
                                accessibilityLabel={cancelLabel}
                                accessibilityState={{ disabled: pending }}
                                testID="confirm-dialog-cancel"
                            >
                                <NativeText style={styles.cancelButtonText}>{cancelLabel}</NativeText>
                            </Pressable>
                            <Pressable
                                onPress={handleConfirm}
                                disabled={pending}
                                style={[styles.confirmButton, pending && styles.disabledButton]}
                                accessibilityRole="button"
                                accessibilityLabel={confirmLabel}
                                accessibilityState={{ disabled: pending }}
                                testID="confirm-dialog-confirm"
                            >
                                <NativeText style={styles.confirmButtonText}>{confirmLabel}</NativeText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: fantasyTokens.spacing.lg,
        backgroundColor: fantasyTokens.sheet.backdrop,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    dialog: {
        backgroundColor: fantasyTokens.colors.parchment,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        maxWidth: 420,
        alignSelf: 'center',
        width: '90%',
        marginHorizontal: 'auto',
        padding: fantasyTokens.spacing.xl,
        gap: fantasyTokens.spacing.md,
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
    error: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.crimson,
    },
    actions: {
        paddingTop: fantasyTokens.spacing.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    cancelButton: {
        minHeight: fantasyTokens.spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderRadius: 8,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    cancelButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
    },
    confirmButton: {
        minHeight: fantasyTokens.spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fantasyTokens.colors.crimson,
        borderRadius: 8,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    confirmButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    disabledButton: {
        opacity: 0.55,
    },
});
