import { useCallback, useMemo, useRef } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { HelperText, Text, TextInput } from 'react-native-paper';
import BottomSheetShell from '@/components/sheets/BottomSheetShell';
import useBottomSheetMotion from '@/hooks/useBottomSheetMotion';
import useConfirm from '@/hooks/useConfirm';
import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    areCustomSubclassDraftsEqual,
    type CustomSubclassFormDraft,
    type CustomSubclassFormMode,
} from './subclassManager.types';

type CustomSubclassFormSheetProps = {
    visible: boolean;
    mode: CustomSubclassFormMode;
    draft: CustomSubclassFormDraft;
    initialDraft: CustomSubclassFormDraft;
    pending: boolean;
    errorMessage: string | null;
    lockedClassSelection: boolean;
    lockedClassMessage: string;
    onChangeDraft: (draft: CustomSubclassFormDraft) => void;
    onDismissError: () => void;
    onClose: () => void;
    onSave: () => void;
};

// NOTE: keep these max lengths in sync with the matching constants in
// server/resolvers/character/customSubclassManager.ts. No shared module exists
// yet, so the values must be mirrored by hand.
const CUSTOM_SUBCLASS_NAME_MAX_LENGTH = 100;
const CUSTOM_SUBCLASS_DESCRIPTION_MAX_LENGTH = 10000;
const CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH = 100;
const CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH = 10000;

/**
 * Modal sheet for creating and editing reusable custom subclasses.
 */
export default function CustomSubclassFormSheet({
    visible,
    mode,
    draft,
    initialDraft,
    pending,
    errorMessage,
    lockedClassSelection,
    lockedClassMessage,
    onChangeDraft,
    onDismissError,
    onClose,
    onSave,
}: CustomSubclassFormSheetProps) {
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const { confirm, confirmDialogElement } = useConfirm();
    const skipDiscardCheckRef = useRef(false);
    const requestSheetCloseRef = useRef<() => void>(() => {});
    const featureClientIdCounterRef = useRef(0);
    const useStackedFeatureFields = windowWidth < fantasyTokens.breakpoints.tablet;
    const isDirty = useMemo(
        () => !areCustomSubclassDraftsEqual(draft, initialDraft),
        [draft, initialDraft],
    );
    const featureRowsAreValid = (() => {
        const seenKeys = new Set<string>();

        return draft.features.every((feature) => {
            const level = Number(feature.level);
            const name = feature.name.trim();

            if (
                name.length === 0
                || feature.description.trim().length === 0
                || !Number.isInteger(level)
                || level < 1
            ) {
                return false;
            }

            const duplicateKey = `${level}:${name.toLowerCase()}`;

            if (seenKeys.has(duplicateKey)) {
                return false;
            }

            seenKeys.add(duplicateKey);

            return true;
        });
    })();
    const canSave = draft.name.trim().length > 0
        && draft.classId.trim().length > 0
        && draft.description.trim().length > 0
        && featureRowsAreValid
        && !pending;

    const handleRequestClose = useCallback((): boolean | void => {
        if (pending) return false;

        if (!skipDiscardCheckRef.current && isDirty) {
            confirm({
                title: 'Discard changes?',
                message: 'You have unsaved changes to this subclass. Are you sure you want to discard them?',
                confirmLabel: 'Discard',
                cancelLabel: 'Keep Editing',
                onConfirm: () => {
                    skipDiscardCheckRef.current = true;
                    requestSheetCloseRef.current();
                    skipDiscardCheckRef.current = false;
                },
            });
            return false;
        }
    }, [confirm, isDirty, pending]);

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
        onRequestClose: handleRequestClose,
        onClose,
    });

    requestSheetCloseRef.current = requestSheetClose;

    const title = mode === 'edit' ? 'Edit Subclass' : 'Create Subclass';

    function addFeature() {
        featureClientIdCounterRef.current += 1;
        const clientId = `feature-${featureClientIdCounterRef.current}`;

        onChangeDraft({
            ...draft,
            features: [
                ...draft.features,
                {
                    clientId,
                    name: '',
                    description: '',
                    level: '',
                },
            ],
        });
    }

    function updateFeature(
        clientId: string,
        updates: Partial<CustomSubclassFormDraft['features'][number]>,
    ) {
        onChangeDraft({
            ...draft,
            features: draft.features.map((feature) => (
                feature.clientId === clientId ? { ...feature, ...updates } : feature
            )),
        });
    }

    function removeFeature(clientId: string) {
        onChangeDraft({
            ...draft,
            features: draft.features.filter((feature) => feature.clientId !== clientId),
        });
    }

    return (
        <>
            {confirmDialogElement}
            <BottomSheetShell
            isRendered={isRendered}
            backdropOpacity={backdropOpacity}
            sheetTranslateY={sheetTranslateY}
            sheetDismissGesture={sheetDismissGesture}
            sheetStyle={{ height: '80%' }}
            onRequestClose={requestSheetClose}
            closeAccessibilityLabel="Close custom subclass form"
            testID="custom-subclass-form-sheet"
            overlayZIndex={30}
        >
            <KeyboardAwareScrollView
                {...keyboardAwareScrollProps}
                bottomOffset={keyboardAwareBottomOffset}
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                <View style={styles.headerRow}>
                    <View style={styles.headerText}>
                        <Text style={styles.sheetTitle}>{title}</Text>
                    </View>
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Subclass Name</Text>
                    <TextInput
                        placeholder="e.g. Oath of the Ancients"
                        placeholderTextColor={fantasyTokens.colors.inkSoft}
                        value={draft.name}
                        onChangeText={(name) => onChangeDraft({ ...draft, name })}
                        maxLength={CUSTOM_SUBCLASS_NAME_MAX_LENGTH}
                        autoCapitalize="words"
                        mode="outlined"
                        style={styles.input}
                        textColor={fantasyTokens.colors.inkDark}
                        outlineColor={fantasyTokens.colors.gold}
                        activeOutlineColor={fantasyTokens.colors.crimson}
                        testID="custom-subclass-name-input"
                    />
                </View>

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
                            {lockedClassMessage}
                        </Text>
                    )}
                </View>

                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Description</Text>
                    <TextInput
                        placeholder="Describe the subclass features, flavour, and abilities"
                        placeholderTextColor={fantasyTokens.colors.inkSoft}
                        value={draft.description}
                        onChangeText={(description) => {
                            onChangeDraft({ ...draft, description });
                            if (errorMessage) onDismissError();
                        }}
                        mode="outlined"
                        multiline
                        numberOfLines={6}
                        maxLength={CUSTOM_SUBCLASS_DESCRIPTION_MAX_LENGTH}
                        style={[styles.input, styles.descriptionInput]}
                        textColor={fantasyTokens.colors.inkDark}
                        outlineColor={fantasyTokens.colors.gold}
                        activeOutlineColor={fantasyTokens.colors.crimson}
                        testID="custom-subclass-description-input"
                    />
                    <Text
                        style={styles.descriptionCounter}
                        testID="custom-subclass-description-counter"
                    >
                        {draft.description.length}/{CUSTOM_SUBCLASS_DESCRIPTION_MAX_LENGTH}
                    </Text>
                </View>

                <View style={styles.featuresSection}>
                    <View style={styles.featuresHeader}>
                        <Text style={styles.fieldLabel}>Subclass Features</Text>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Add subclass feature"
                            onPress={addFeature}
                            disabled={pending}
                            style={({ pressed }) => [
                                styles.addFeatureButton,
                                pressed && styles.addFeatureButtonPressed,
                            ]}
                            testID="add-custom-subclass-feature"
                        >
                            <Ionicons name="add" size={18} color={fantasyTokens.colors.parchment} />
                            <Text style={styles.addFeatureButtonText}>Add Feature</Text>
                        </Pressable>
                    </View>

                    {draft.features.length === 0 ? (
                        <Text style={styles.emptyFeaturesText}>No subclass features yet.</Text>
                    ) : (
                        draft.features.map((feature, index) => (
                            <View
                                key={feature.clientId}
                                style={styles.featureCard}
                                testID={`custom-subclass-feature-${index}`}
                            >
                                <View style={styles.featureCardHeader}>
                                    <Text style={styles.featureCardTitle}>Feature {index + 1}</Text>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={`Remove feature ${index + 1}`}
                                        onPress={() => removeFeature(feature.clientId)}
                                        disabled={pending}
                                        style={({ pressed }) => [
                                            styles.removeFeatureButton,
                                            pressed && styles.removeFeatureButtonPressed,
                                        ]}
                                        testID={`remove-custom-subclass-feature-${index}`}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={fantasyTokens.colors.crimson} />
                                    </Pressable>
                                </View>

                                <View
                                    style={[
                                        styles.featureInlineFields,
                                        useStackedFeatureFields && styles.featureInlineFieldsStacked,
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.featureLevelField,
                                            useStackedFeatureFields && styles.featureStackedField,
                                        ]}
                                    >
                                        <Text style={styles.featureFieldLabel}>Level</Text>
                                        <TextInput
                                            placeholder="3"
                                            placeholderTextColor={fantasyTokens.colors.inkSoft}
                                            value={feature.level}
                                            onChangeText={(level) => updateFeature(feature.clientId, {
                                                level: level.replace(/[^0-9]/g, ''),
                                            })}
                                            keyboardType="number-pad"
                                            inputMode="numeric"
                                            mode="outlined"
                                            style={styles.input}
                                            textColor={fantasyTokens.colors.inkDark}
                                            outlineColor={fantasyTokens.colors.gold}
                                            activeOutlineColor={fantasyTokens.colors.crimson}
                                            testID={`custom-subclass-feature-level-${index}`}
                                        />
                                    </View>

                                    <View
                                        style={[
                                            styles.featureNameField,
                                            useStackedFeatureFields && styles.featureStackedField,
                                        ]}
                                    >
                                        <Text style={styles.featureFieldLabel}>Name</Text>
                                        <TextInput
                                            placeholder="e.g. Moonlit Ward"
                                            placeholderTextColor={fantasyTokens.colors.inkSoft}
                                            value={feature.name}
                                            onChangeText={(name) => updateFeature(feature.clientId, { name })}
                                            maxLength={CUSTOM_SUBCLASS_FEATURE_NAME_MAX_LENGTH}
                                            autoCapitalize="words"
                                            mode="outlined"
                                            style={styles.input}
                                            textColor={fantasyTokens.colors.inkDark}
                                            outlineColor={fantasyTokens.colors.gold}
                                            activeOutlineColor={fantasyTokens.colors.crimson}
                                            testID={`custom-subclass-feature-name-${index}`}
                                        />
                                    </View>
                                </View>

                                <View style={styles.field}>
                                    <Text style={styles.featureFieldLabel}>Description</Text>
                                    <TextInput
                                        placeholder="Describe what this feature grants"
                                        placeholderTextColor={fantasyTokens.colors.inkSoft}
                                        value={feature.description}
                                        onChangeText={(description) => updateFeature(feature.clientId, { description })}
                                        mode="outlined"
                                        multiline
                                        numberOfLines={4}
                                        maxLength={CUSTOM_SUBCLASS_FEATURE_DESCRIPTION_MAX_LENGTH}
                                        style={[styles.input, styles.featureDescriptionInput]}
                                        textColor={fantasyTokens.colors.inkDark}
                                        outlineColor={fantasyTokens.colors.gold}
                                        activeOutlineColor={fantasyTokens.colors.crimson}
                                        testID={`custom-subclass-feature-description-${index}`}
                                    />
                                </View>
                            </View>
                        ))
                    )}
                </View>

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
            </KeyboardAwareScrollView>
        </BottomSheetShell>
        </>
    );
}

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
    sheetTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
    },
    field: {
        gap: fantasyTokens.spacing.sm,
    },
    input: {
        backgroundColor: fantasyTokens.colors.parchment,
    },
    descriptionInput: {
        minHeight: 132,
    },
    descriptionCounter: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        opacity: 0.72,
        textAlign: 'right',
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
        justifyContent: 'center',
    },
    classButton: {
        width: 110,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
        textAlign: 'center',
    },
    classButtonTextSelected: {
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
    },
    lockedText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
    featuresSection: {
        gap: fantasyTokens.spacing.sm,
    },
    featuresHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
    },
    addFeatureButton: {
        minHeight: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.xs,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    addFeatureButtonPressed: {
        opacity: 0.9,
    },
    addFeatureButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    emptyFeaturesText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        opacity: 0.72,
    },
    featureCard: {
        gap: fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.rail.borderStrong,
        backgroundColor: fantasyTokens.rail.pressed,
        padding: fantasyTokens.spacing.md,
    },
    featureCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
    },
    featureCardTitle: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchment,
        fontWeight: '700',
    },
    removeFeatureButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.rail.borderStrong,
    },
    removeFeatureButtonPressed: {
        backgroundColor: fantasyTokens.colors.crimsonSoft,
    },
    featureInlineFields: {
        flexDirection: 'row',
        gap: fantasyTokens.spacing.sm,
    },
    featureInlineFieldsStacked: {
        flexDirection: 'column',
    },
    featureLevelField: {
        width: 86,
        gap: fantasyTokens.spacing.xs,
    },
    featureNameField: {
        flex: 1,
        minWidth: 0,
        gap: fantasyTokens.spacing.xs,
    },
    featureStackedField: {
        width: '100%',
    },
    featureFieldLabel: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
    featureDescriptionInput: {
        minHeight: 104,
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
