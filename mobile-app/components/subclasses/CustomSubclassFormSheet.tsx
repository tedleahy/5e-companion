import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import BottomSheetShell from '@/components/sheets/BottomSheetShell';
import useBottomSheetMotion from '@/hooks/useBottomSheetMotion';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CustomSubclassFormDraft, CustomSubclassFormMode } from './subclassManager.types';

type CustomSubclassFormSheetProps = {
    visible: boolean;
    mode: CustomSubclassFormMode;
    draft: CustomSubclassFormDraft;
    pending: boolean;
    errorMessage: string | null;
    lockedClassSelection: boolean;
    onChangeDraft: (draft: CustomSubclassFormDraft) => void;
    onDismissError: () => void;
    onClose: () => void;
    onSave: () => void;
};

const NAME_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 5000;

/**
 * Modal sheet for creating and editing reusable custom subclasses.
 */
export default function CustomSubclassFormSheet({
    visible,
    mode,
    draft,
    pending,
    errorMessage,
    lockedClassSelection,
    onChangeDraft,
    onDismissError,
    onClose,
    onSave,
}: CustomSubclassFormSheetProps) {
    const { height: windowHeight } = useWindowDimensions();
    const canSave = draft.name.trim().length > 0
        && draft.classId.trim().length > 0
        && draft.description.trim().length > 0
        && !pending;
    const {
        isRendered,
        backdropOpacity,
        sheetTranslateY,
        requestSheetClose,
        handleScroll,
        sheetDismissGesture,
    } = useBottomSheetMotion({
        visible,
        windowHeight,
        onRequestClose: () => {
            if (pending) return false;
            onClose();
            return undefined;
        },
    });

    const title = mode === 'edit' ? 'Edit Subclass' : 'Create Subclass';

    return (
        <BottomSheetShell
            isRendered={isRendered}
            backdropOpacity={backdropOpacity}
            sheetTranslateY={sheetTranslateY}
            sheetDismissGesture={sheetDismissGesture}
            onRequestClose={requestSheetClose}
            closeAccessibilityLabel="Close custom subclass form"
            testID="custom-subclass-form-sheet"
            overlayZIndex={30}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View style={styles.headerRow}>
                    <View style={styles.headerText}>
                        <Text style={styles.sheetLabel}>Custom Subclass</Text>
                        <Text style={styles.sheetTitle}>{title}</Text>
                    </View>
                </View>

                <TextInput
                    label="Subclass name"
                    value={draft.name}
                    onChangeText={(name) => onChangeDraft({ ...draft, name })}
                    maxLength={NAME_MAX_LENGTH}
                    autoCapitalize="words"
                    mode="outlined"
                    style={styles.input}
                    textColor={fantasyTokens.colors.inkDark}
                    outlineColor={fantasyTokens.colors.gold}
                    activeOutlineColor={fantasyTokens.colors.crimson}
                    testID="custom-subclass-name-input"
                />
                <Text style={styles.counter}>{draft.name.length}/{NAME_MAX_LENGTH}</Text>

                <View style={styles.classSection}>
                    <Text style={styles.fieldLabel}>Parent Class</Text>
                    <View style={styles.classGrid}>
                        {CLASS_OPTIONS.map((option) => {
                            const selected = draft.classId === option.value;

                            return (
                                <Pressable
                                    key={option.value}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Select ${option.label}`}
                                    accessibilityState={{ selected, disabled: lockedClassSelection }}
                                    disabled={lockedClassSelection}
                                    onPress={() => onChangeDraft({ ...draft, classId: option.value })}
                                    style={({ pressed }) => [
                                        styles.classButton,
                                        selected && styles.classButtonSelected,
                                        lockedClassSelection && styles.classButtonDisabled,
                                        pressed && styles.classButtonPressed,
                                    ]}
                                    testID={`custom-subclass-class-${option.value}`}
                                >
                                    <Text style={styles.classIcon}>{option.icon}</Text>
                                    <Text
                                        style={[styles.classButtonText, selected && styles.classButtonTextSelected]}
                                        numberOfLines={1}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                    {lockedClassSelection && (
                        <Text style={styles.lockedText}>
                            Parent class is locked while existing characters use this subclass.
                        </Text>
                    )}
                </View>

                <TextInput
                    label="Description"
                    value={draft.description}
                    onChangeText={(description) => {
                        onChangeDraft({ ...draft, description });
                        if (errorMessage) onDismissError();
                    }}
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    mode="outlined"
                    multiline
                    numberOfLines={6}
                    style={[styles.input, styles.descriptionInput]}
                    textColor={fantasyTokens.colors.inkDark}
                    outlineColor={fantasyTokens.colors.gold}
                    activeOutlineColor={fantasyTokens.colors.crimson}
                    testID="custom-subclass-description-input"
                />
                <Text style={styles.counter}>{draft.description.length}/{DESCRIPTION_MAX_LENGTH}</Text>

                {errorMessage && (
                    <HelperText type="error" visible style={styles.errorText}>
                        {errorMessage}
                    </HelperText>
                )}

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Cancel custom subclass form"
                        onPress={requestSheetClose}
                        disabled={pending}
                        style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
                        testID="cancel-custom-subclass-form"
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Save custom subclass"
                        accessibilityState={{ disabled: !canSave }}
                        onPress={onSave}
                        disabled={!canSave}
                        style={({ pressed }) => [
                            styles.saveButton,
                            !canSave && styles.saveButtonDisabled,
                            pressed && canSave && styles.saveButtonPressed,
                        ]}
                        testID="save-custom-subclass"
                    >
                        <Text style={styles.saveButtonText}>{pending ? 'Saving...' : 'Save'}</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </BottomSheetShell>
    );
}

export { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH };

const styles = StyleSheet.create({
    sheetContent: {
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.lg,
        paddingBottom: fantasyTokens.spacing.xxl,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    headerText: {
        flex: 1,
        minWidth: 0,
    },
    sheetLabel: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.gold,
    },
    sheetTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
    },
    input: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
    descriptionInput: {
        minHeight: 132,
    },
    counter: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        textAlign: 'right',
        fontVariant: ['tabular-nums'],
        marginTop: -fantasyTokens.spacing.sm,
    },
    classSection: {
        gap: fantasyTokens.spacing.sm,
    },
    fieldLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
    },
    classGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    classButton: {
        width: 124,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.rail.borderStrong,
        paddingHorizontal: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.rail.pressed,
    },
    classButtonSelected: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderColor: fantasyTokens.colors.gold,
    },
    classButtonDisabled: {
        opacity: 0.68,
    },
    classButtonPressed: {
        opacity: 0.86,
    },
    classIcon: {
        fontSize: fantasyTokens.fontSizes.bodyLarge,
    },
    classButtonText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.parchmentDeep,
        flex: 1,
        minWidth: 0,
    },
    classButtonTextSelected: {
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
    },
    lockedText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
    errorText: {
        color: fantasyTokens.colors.goldLight,
        fontFamily: fantasyTokens.fonts.regular,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: fantasyTokens.spacing.sm,
    },
    cancelButton: {
        minHeight: 44,
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.rail.borderStrong,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    cancelButtonPressed: {
        backgroundColor: fantasyTokens.rail.pressed,
    },
    cancelButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
    saveButton: {
        minHeight: 44,
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: fantasyTokens.spacing.lg,
    },
    saveButtonDisabled: {
        opacity: 0.45,
    },
    saveButtonPressed: {
        opacity: 0.9,
    },
    saveButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
        textAlign: 'center',
    },
});
