import { Modal, Pressable, StyleSheet, Text as NativeText, View, useWindowDimensions } from 'react-native';
import { Text } from 'react-native-paper';
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
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.modalRoot}>
                <Pressable
                    style={styles.backdrop}
                    onPress={onCancel}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss dialog"
                />
                <View style={[styles.dialog, isTablet && styles.dialogTablet]}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.actions}>
                        <View style={styles.buttonRow}>
                            <Pressable
                                onPress={onCancel}
                                style={styles.cancelButton}
                                accessibilityRole="button"
                                accessibilityLabel={cancelLabel}
                            >
                                <NativeText style={styles.cancelButtonText}>{cancelLabel}</NativeText>
                            </Pressable>
                            <Pressable
                                onPress={onConfirm}
                                style={styles.confirmButton}
                                accessibilityRole="button"
                                accessibilityLabel={confirmLabel}
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
});
