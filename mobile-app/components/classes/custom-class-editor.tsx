import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { BackHandler, StyleSheet, useWindowDimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import ConfirmDialog from '@/components/ConfirmDialog';
import BottomSheetShell from '@/components/sheets/BottomSheetShell';
import { CREATE_CUSTOM_CLASS, GET_AVAILABLE_CLASSES, GET_CUSTOM_CLASSES, UPDATE_CUSTOM_CLASS } from '@/graphql/class.operations';
import useBottomSheetMotion from '@/hooks/useBottomSheetMotion';
import useDismissKeyboardAction from '@/hooks/useDismissKeyboardAction';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { createDraft, identityFieldErrors, serialiseDraft, stageError } from './custom-class-editor/draft';
import EditorChrome from './custom-class-editor/EditorChrome';
import EquipmentStage from './custom-class-editor/EquipmentStage';
import FeaturesStage from './custom-class-editor/FeaturesStage';
import IdentityStage from './custom-class-editor/IdentityStage';
import ProficienciesStage from './custom-class-editor/ProficienciesStage';
import ProgressionStage from './custom-class-editor/ProgressionStage';
import ReviewStage from './custom-class-editor/ReviewStage';
import type { CustomClassEditorProps, Draft, EditableStageIndex } from './custom-class-editor/types';
import { STAGES } from './custom-class-editor/types';

/**
 * Bottom-sheet editor for creating or editing a custom class across six stages.
 */
export default function CustomClassEditor({ visible, initial, onClose, onSaved }: CustomClassEditorProps) {
    const initialDraft = useMemo(() => createDraft(initial), [initial]);
    const [draft, setDraft] = useState(initialDraft);
    const [stage, setStage] = useState(0);
    const [progressionLevel, setProgressionLevel] = useState(1);
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [discardVisible, setDiscardVisible] = useState(false);
    const [createClass, createState] = useMutation(CREATE_CUSTOM_CLASS);
    const [updateClass, updateState] = useMutation(UPDATE_CUSTOM_CLASS);
    const pending = createState.loading || updateState.loading;
    const locked = initial?.mechanicsLocked ?? false;
    const dirty = JSON.stringify(draft) !== JSON.stringify(initialDraft);

    const scrollViewRef = useRef<ComponentRef<typeof KeyboardAwareScrollView>>(null);
    const skipDiscardCheckRef = useRef(false);
    const dirtyRef = useRef(dirty);
    const requestSheetCloseRef = useRef<() => void>(() => {});
    const { height: windowHeight } = useWindowDimensions();
    const dismissKeyboardAndRun = useDismissKeyboardAction();

    dirtyRef.current = dirty;

    /**
     * Gates sheet dismissal behind a discard confirmation while the draft is dirty.
     * Reads dirty via ref so the first keystroke does not recreate sheet dismiss gestures.
     */
    const onRequestClose = useCallback(() => {
        if (!skipDiscardCheckRef.current && dirtyRef.current) {
            setDiscardVisible(true);
            return false;
        }
    }, []);

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
        onRequestClose,
        onClose,
    });

    requestSheetCloseRef.current = requestSheetClose;

    // Start each opening from a clean draft so reopening for another class never shows stale edits.
    useEffect(() => {
        if (!visible) return;
        setDraft(initialDraft);
        setStage(0);
        setProgressionLevel(1);
        setValidationMessage(null);
        setDiscardVisible(false);
    }, [visible, initialDraft]);

    useEffect(() => {
        if (!visible) return;
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, [visible, stage]);

    // Restore hardware-back dismissal now that the editor is a state overlay rather than a route.
    useEffect(() => {
        if (!visible) return undefined;
        const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
            requestSheetClose();
            return true;
        });
        return () => subscription.remove();
    }, [visible, requestSheetClose]);

    function update(patch: Partial<Draft>) {
        setDraft((value) => ({ ...value, ...patch }));
        setValidationMessage(null);
    }

    function move(delta: number) {
        if (delta > 0) {
            const error = stageError(stage, draft);
            if (error) {
                setValidationMessage(error);
                return;
            }
        }
        setStage((value) => Math.max(0, Math.min(STAGES.length - 1, value + delta)));
    }

    /** Jump from Review Edit › links to a prior stage without re-validating. */
    function jumpToStage(target: EditableStageIndex) {
        setValidationMessage(null);
        setStage(target);
    }

    async function submit() {
        for (let index = 0; index < STAGES.length - 1; index += 1) {
            const error = stageError(index, draft);
            if (error) {
                setStage(index);
                setValidationMessage(error);
                return;
            }
        }
        try {
            if (initial) {
                await updateClass({
                    variables: { id: initial.id, input: serialiseDraft(draft) },
                    refetchQueries: [GET_AVAILABLE_CLASSES, GET_CUSTOM_CLASSES],
                });
            } else {
                await createClass({
                    variables: { input: serialiseDraft(draft) },
                    refetchQueries: [GET_AVAILABLE_CLASSES, GET_CUSTOM_CLASSES],
                });
            }
            onSaved?.();
            skipDiscardCheckRef.current = true;
            requestSheetCloseRef.current();
            skipDiscardCheckRef.current = false;
        } catch (error) {
            setValidationMessage(error instanceof Error ? error.message : 'Unable to save custom class.');
        }
    }

    /**
     * Confirms a discard, dismissing the sheet through the shared animated close path.
     */
    function confirmDiscard() {
        setDiscardVisible(false);
        skipDiscardCheckRef.current = true;
        requestSheetCloseRef.current();
        skipDiscardCheckRef.current = false;
    }

    const stageProps = { draft, locked, onChange: update };

    return (
        <>
            <BottomSheetShell
                isRendered={isRendered}
                backdropOpacity={backdropOpacity}
                sheetTranslateY={sheetTranslateY}
                sheetDismissGesture={sheetDismissGesture}
                closeAccessibilityLabel="Dismiss custom class editor"
                testID="custom-class-editor-sheet"
                overlayZIndex={30}
                sheetStyle={styles.tallSheet}
                onRequestClose={() => dismissKeyboardAndRun(requestSheetClose)}
            >
                <EditorChrome
                    title={initial ? 'Edit custom class' : 'New custom class'}
                    stage={stage}
                    locked={locked}
                    lockReason={initial?.mechanicsLockedReason}
                    pending={pending}
                    validationMessage={stage === 0 ? null : validationMessage}
                    onBack={() => dismissKeyboardAndRun(() => move(-1))}
                    onContinue={() => dismissKeyboardAndRun(() => move(1))}
                    onSave={() => dismissKeyboardAndRun(() => void submit())}
                >
                    <KeyboardAwareScrollView
                        {...keyboardAwareScrollProps}
                        ref={scrollViewRef}
                        style={styles.scroll}
                        bottomOffset={keyboardAwareBottomOffset}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {stage === 0 ? (
                            <IdentityStage
                                {...stageProps}
                                errors={validationMessage ? identityFieldErrors(draft) : undefined}
                            />
                        ) : null}
                        {stage === 1 ? <ProficienciesStage {...stageProps} /> : null}
                        {stage === 2 ? <EquipmentStage {...stageProps} /> : null}
                        {stage === 3 ? (
                            <ProgressionStage
                                {...stageProps}
                                progressionLevel={progressionLevel}
                                onProgressionLevelChange={setProgressionLevel}
                            />
                        ) : null}
                        {stage === 4 ? <FeaturesStage {...stageProps} /> : null}
                        {stage === 5 ? (
                            <ReviewStage
                                draft={draft}
                                locked={locked}
                                onJumpToStage={(target) => dismissKeyboardAndRun(() => jumpToStage(target))}
                            />
                        ) : null}
                    </KeyboardAwareScrollView>
                </EditorChrome>
            </BottomSheetShell>

            <ConfirmDialog
                visible={discardVisible}
                title="Discard custom class draft?"
                message="Your unsaved class changes will be lost."
                confirmLabel="Discard"
                onConfirm={confirmDiscard}
                onCancel={() => setDiscardVisible(false)}
            />
        </>
    );
}

const styles = StyleSheet.create({
    tallSheet: {
        height: fantasyTokens.sheet.tallHeight,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.lg,
        paddingBottom: fantasyTokens.spacing.xxl,
    },
});
