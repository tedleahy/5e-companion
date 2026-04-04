/* eslint-disable react/no-unescaped-entities */
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Text } from 'react-native-paper';
import ClassAllocationRow from '@/components/wizard/ClassAllocationRow';
import ClassOptionGrid from '@/components/wizard/ClassOptionGrid';
import NumericStepper from '@/components/wizard/NumericStepper';
import OptionGrid from '@/components/wizard/OptionGrid';
import {
    availableClassOptions,
    createCharacterClassDraft,
    isSubclassUnlocked,
    normaliseStartingClassId,
    remainingClassLevels,
    sanitiseCharacterClassRow,
    validateCharacterClassDraft,
} from '@/lib/characterCreation/multiclass';
import { SUBCLASS_OPTIONS } from '@/lib/characterCreation/options';
import { useCharacterDraft } from '@/store/characterDraft';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Class selection step for the create-character wizard.
 *
 * Defaults to single-class mode (pick one class from a grid).
 * For characters level 2+, offers an opt-in toggle to multiclass mode.
 */
export default function StepClass() {
    const { draft, updateDraft } = useCharacterDraft();
    const [multiclassMode, setMulticlassMode] = useState(
        () => draft.classes.length > 1,
    );

    const selectedClass = draft.classes[0];
    const selectedClassId = selectedClass?.classId ?? '';

    /* ── multiclass helpers (reused from previous implementation) ── */

    const availableClasses = availableClassOptions(draft.classes);
    const validation = validateCharacterClassDraft(
        draft.classes,
        draft.level,
        draft.startingClassId,
    );
    const remainingLevelsCount = remainingClassLevels(draft.classes, draft.level);
    const displayClassRows = draft.classes.map((classRow, originalIndex) => ({
        ...classRow,
        originalIndex,
    }));

    const scrollViewRef = useRef<ScrollView>(null);
    const [pendingScrollIndex, setPendingScrollIndex] = useState<number | null>(null);

    /* ── level stepper ── */

    function adjustLevel(delta: number) {
        const next = Math.max(1, Math.min(20, draft.level + delta));

        if (!multiclassMode && selectedClassId) {
            // In single-class mode, the single class row tracks the character level
            updateDraft({
                level: next,
                classes: [{ ...draft.classes[0]!, level: next }],
            });
        } else {
            updateDraft({ level: next });
        }

        // Auto-exit multiclass mode when level drops below 2
        if (next < 2 && multiclassMode) {
            exitMulticlassMode();
        }
    }

    /* ── single-class selection ── */

    function handleSelectSingleClass(classId: string) {
        const classRow = createCharacterClassDraft(classId, draft.level);
        updateDraft({
            classes: [classRow],
            startingClassId: classId,
        });
    }

    function handleSelectSingleSubclass(subclassId: string) {
        if (!selectedClass) return;
        updateDraft({
            classes: [{ ...selectedClass, subclassId }],
        });
    }

    /* ── multiclass toggle ── */

    function enterMulticlassMode() {
        setMulticlassMode(true);
    }

    function exitMulticlassMode() {
        setMulticlassMode(false);
        // Keep only the starting class and give it all levels
        if (draft.classes.length > 0) {
            const startingRow = draft.classes.find(
                (c) => c.classId === draft.startingClassId,
            ) ?? draft.classes[0]!;
            const sanitised = sanitiseCharacterClassRow({
                ...startingRow,
                level: draft.level,
            });
            updateDraft({
                classes: [sanitised],
                startingClassId: sanitised.classId,
            });
        }
    }

    /* ── multiclass row handlers ── */

    function scrollToClassRow(event: LayoutChangeEvent) {
        scrollViewRef.current?.scrollTo({ y: event.nativeEvent.layout.y, animated: true });
    }

    function updateClasses(nextClasses: typeof draft.classes, nextStartingClassId = draft.startingClassId) {
        const sanitisedClasses = nextClasses.map(sanitiseCharacterClassRow);
        updateDraft({
            classes: sanitisedClasses,
            startingClassId: normaliseStartingClassId(sanitisedClasses, nextStartingClassId),
        });
    }

    function handleAddClass(classId: string) {
        if (remainingLevelsCount <= 0) return;
        setPendingScrollIndex(draft.classes.length);
        updateClasses(
            [...draft.classes, createCharacterClassDraft(classId)],
            draft.startingClassId || classId,
        );
    }

    function handleClassRowLayout(index: number, event: LayoutChangeEvent) {
        if (pendingScrollIndex !== index) return;
        scrollToClassRow(event);
        setPendingScrollIndex(null);
    }

    function handleChangeClassLevel(index: number, delta: number) {
        const classRow = draft.classes[index];
        if (!classRow) return;
        const nextLevel = classRow.level + delta;
        if (nextLevel < 1) return;
        if (delta > 0 && remainingLevelsCount <= 0) return;
        updateClasses(
            draft.classes.map((c, i) =>
                i === index ? { ...c, level: nextLevel } : c,
            ),
        );
    }

    function handleRemoveClass(index: number) {
        const nextClasses = draft.classes.filter((_, i) => i !== index);
        const removedClassId = draft.classes[index]?.classId ?? '';
        const nextStartingClassId =
            removedClassId === draft.startingClassId ? '' : draft.startingClassId;
        updateClasses(nextClasses, nextStartingClassId);

        // If only one class remains, auto-switch back to single-class mode
        if (nextClasses.length <= 1) {
            setMulticlassMode(false);
            if (nextClasses.length === 1) {
                const solo = { ...nextClasses[0]!, level: draft.level };
                updateDraft({
                    classes: [sanitiseCharacterClassRow(solo)],
                    startingClassId: solo.classId,
                });
            }
        }
    }

    function handleSelectSubclass(index: number, subclassId: string) {
        updateClasses(
            draft.classes.map((c, i) =>
                i === index ? { ...c, subclassId } : c,
            ),
        );
    }

    /* ── subclass options for single-class mode ── */

    const singleSubclassOptions = SUBCLASS_OPTIONS[selectedClassId] ?? [];
    const singleSubclassUnlocked = selectedClass ? isSubclassUnlocked(selectedClass) : false;

    /* ── render ── */

    return (
        <ScrollView ref={scrollViewRef} style={styles.scroll} contentContainerStyle={styles.container}>
            <Text style={styles.heading}>Choose your class and level.</Text>

            {/* ── Level stepper (both modes) ── */}
            <Text style={fantasyTokens.text.formLabel}>Starting Level</Text>
            <NumericStepper
                value={draft.level}
                canDecrease={draft.level > 1}
                canIncrease={draft.level < 20}
                decrementLabel="Decrease starting level"
                incrementLabel="Increase starting level"
                onDecrease={() => adjustLevel(-1)}
                onIncrease={() => adjustLevel(1)}
            />
            <Text style={styles.hint}>Most campaigns start at level 1. Check with your DM.</Text>

            <View style={styles.divider} />

            {!multiclassMode ? (
                /* ── Single-class mode ── */
                <>
                    <ClassOptionGrid
                        selected={selectedClassId}
                        onSelect={handleSelectSingleClass}
                    />

                    {/* Inline subclass picker when unlocked */}
                    {selectedClassId !== '' && singleSubclassUnlocked && singleSubclassOptions.length > 0 && (
                        <View style={styles.subclassSection}>
                            <Text style={styles.sectionLabel}>Subclass</Text>
                            <OptionGrid
                                options={singleSubclassOptions}
                                selected={selectedClass?.subclassId ?? ''}
                                onSelect={handleSelectSingleSubclass}
                            />
                        </View>
                    )}

                    {/* Multiclass prompt (only when level > 1 and a class is selected) */}
                    {selectedClassId !== '' && draft.level > 1 && (
                        <View style={styles.multiclassPrompt}>
                            <Text style={styles.multiclassHeading}>Want to multiclass?</Text>
                            <Text style={styles.multiclassBody}>
                                If you like, you can split your levels between multiple classes.
                            </Text>
                            <Pressable
                                onPress={enterMulticlassMode}
                                style={({ pressed }) => [
                                    styles.multiclassBtn,
                                    pressed && styles.multiclassBtnPressed,
                                ]}
                            >
                                <Text style={styles.multiclassBtnText}>Choose additional classes</Text>
                            </Pressable>
                        </View>
                    )}
                </>
            ) : (
                /* ── Multiclass mode ── */
                <>
                    <Pressable
                        onPress={exitMulticlassMode}
                        style={({ pressed }) => [
                            styles.singleClassBtn,
                            pressed && styles.singleClassBtnPressed,
                        ]}
                    >
                        <Text style={styles.singleClassBtnText}>Use a single class</Text>
                    </Pressable>

                    {draft.classes.length > 0 && (
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryHeader}>
                                <Text style={styles.summaryLabel}>Allocation</Text>
                            </View>
                            <Text style={styles.summaryValue}>
                                {draft.level} total level{draft.level === 1 ? '' : 's'}
                            </Text>
                            {remainingLevelsCount === 0 ? (
                                <Text style={styles.summaryHint}>All levels assigned.</Text>
                            ) : (
                                <>
                                    <Text style={styles.summaryHint}>
                                        {remainingLevelsCount} level{remainingLevelsCount === 1 ? '' : 's'} still to allocate.
                                    </Text>
                                    <Text style={styles.sub}>
                                        You can either increase the levels in the
                                        class{draft.classes.length > 1 ? 'es' : ''} you've chosen, or take levels in
                                        additional classes.
                                    </Text>
                                </>
                            )}
                        </View>
                    )}

                    {displayClassRows.map((classRow, displayIndex) => (
                        <ClassAllocationRow
                            key={`${classRow.classId || 'class'}-${classRow.originalIndex}`}
                            canDecreaseLevel={classRow.level > 1}
                            canIncreaseLevel={remainingLevelsCount > 0}
                            canRemove
                            classRow={classRow}
                            index={displayIndex}
                            isStartingClass={classRow.classId === draft.startingClassId}
                            onDecreaseLevel={() => handleChangeClassLevel(classRow.originalIndex, -1)}
                            onIncreaseLevel={() => handleChangeClassLevel(classRow.originalIndex, 1)}
                            onLayout={(event) => handleClassRowLayout(displayIndex, event)}
                            onRemove={() => handleRemoveClass(classRow.originalIndex)}
                            onSelectStartingClass={() => updateDraft({ startingClassId: classRow.classId })}
                            onSelectSubclass={(subclassId) => handleSelectSubclass(classRow.originalIndex, subclassId)}
                            showStartingClassSelector={draft.classes.length > 1}
                            subclassOptions={SUBCLASS_OPTIONS[classRow.classId] ?? []}
                            subclassUnlocked={isSubclassUnlocked(classRow)}
                        />
                    ))}

                    {availableClasses.length > 0 && remainingLevelsCount > 0 ? (
                        <View style={styles.addSection}>
                            {draft.classes.length > 0 && (
                                <Text style={styles.sectionLabel}>
                                    Add another class
                                </Text>
                            )}
                            <ClassOptionGrid
                                options={availableClasses}
                                selected=""
                                onSelect={handleAddClass}
                                getOptionTestId={(option) => `add-class-${option.value}`}
                            />
                        </View>
                    ) : null}

                    {validation.errors.length > 0 ? (
                        <View style={styles.errorBox}>
                            {validation.errors.map((error) => (
                                <Text key={error} style={styles.errorText}>
                                    {`\u2022 ${error}`}
                                </Text>
                            ))}
                        </View>
                    ) : null}
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    container: {
        padding: 20,
        paddingBottom: 40,
    },
    heading: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.headline,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        marginBottom: 4,
    },
    sub: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.12)',
        marginVertical: 16,
    },

    /* Level stepper */
    hint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.3)',
        marginTop: 6,
    },

    /* Single-class subclass section */
    subclassSection: {
        marginTop: 16,
    },
    sectionLabel: {
        fontFamily: fantasyTokens.fonts.bold,
        fontSize: fantasyTokens.fontSizes.body,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
        opacity: 0.75,
        marginBottom: 8,
    },

    /* Multiclass prompt (single-class mode) */
    multiclassPrompt: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.15)',
        backgroundColor: 'rgba(240,224,188,0.04)',
        borderRadius: 14,
        padding: 16,
    },
    multiclassHeading: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        marginBottom: 4,
    },
    multiclassBody: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.45)',
        marginBottom: 12,
    },
    multiclassBtn: {
        backgroundColor: 'rgba(201,146,42,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.3)',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    multiclassBtnPressed: {
        backgroundColor: 'rgba(201,146,42,0.2)',
    },
    multiclassBtnText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        color: fantasyTokens.colors.gold,
    },

    /* "Use a single class" button (multiclass mode) */
    singleClassBtn: {
        backgroundColor: 'rgba(201,146,42,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        marginBottom: 14,
    },
    singleClassBtnPressed: {
        backgroundColor: 'rgba(201,146,42,0.16)',
    },
    singleClassBtnText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        color: 'rgba(245,230,200,0.6)',
    },

    /* Multiclass allocation summary */
    summaryCard: {
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderRadius: 14,
        padding: 14,
        marginBottom: 14,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    summaryLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.55)',
    },
    summaryValue: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.titleLarge,
        color: fantasyTokens.colors.parchment,
        marginBottom: 4,
    },
    summaryHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        color: 'rgba(245,230,200,0.45)',
    },

    /* Add-class grid (multiclass mode) */
    addSection: {
        marginTop: 6,
    },
    /* Validation errors */
    errorBox: {
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.3)',
        backgroundColor: 'rgba(139,26,26,0.08)',
        padding: 12,
        gap: 6,
    },
    errorText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        color: fantasyTokens.colors.parchment,
    },
});
