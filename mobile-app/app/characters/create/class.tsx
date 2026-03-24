import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';
import ClassAllocationRow from '@/components/wizard/ClassAllocationRow';
import {
    availableClassOptions,
    createCharacterClassDraft,
    isSubclassUnlocked,
    normaliseStartingClassId,
    remainingClassLevels,
    sanitiseCharacterClassRow,
    sortClassRowsForDisplay,
    validateCharacterClassDraft,
} from '@/lib/characterCreation/multiclass';
import { SUBCLASS_OPTIONS } from '@/lib/characterCreation/options';
import { useCharacterDraft } from '@/store/characterDraft';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Multiclass allocation step for the create-character wizard.
 */
export default function StepClass() {
    const { draft, updateDraft } = useCharacterDraft();
    const [showStartingClassInfo, setShowStartingClassInfo] = useState(false);
    const availableClasses = availableClassOptions(draft.classes);
    const validation = validateCharacterClassDraft(
        draft.classes,
        draft.level,
        draft.startingClassId,
    );
    const remainingLevelsCount = remainingClassLevels(draft.classes, draft.level);
    const displayClassRows = sortClassRowsForDisplay(
        draft.classes.map((classRow, originalIndex) => ({ ...classRow, originalIndex })),
        draft.startingClassId,
    );

    /**
     * Writes new class rows back into the draft and keeps the starting class valid.
     */
    function updateClasses(nextClasses: typeof draft.classes, nextStartingClassId = draft.startingClassId) {
        const sanitisedClasses = nextClasses.map(sanitiseCharacterClassRow);

        updateDraft({
            classes: sanitisedClasses,
            startingClassId: normaliseStartingClassId(sanitisedClasses, nextStartingClassId),
        });
    }

    /**
     * Adds a new class row at level 1 when there is room in the allocation.
     */
    function handleAddClass(classId: string) {
        if (remainingLevelsCount <= 0) {
            return;
        }

        updateClasses(
            [...draft.classes, createCharacterClassDraft(classId)],
            draft.startingClassId || classId,
        );
    }

    /**
     * Adjusts one class row's level while preserving the total allocation rules.
     */
    function handleChangeClassLevel(index: number, delta: number) {
        const classRow = draft.classes[index];

        if (!classRow) {
            return;
        }

        const nextLevel = classRow.level + delta;

        if (nextLevel < 1) {
            return;
        }

        if (delta > 0 && remainingLevelsCount <= 0) {
            return;
        }

        updateClasses(
            draft.classes.map((currentClassRow, currentIndex) => (
                currentIndex === index
                    ? { ...currentClassRow, level: nextLevel }
                    : currentClassRow
            )),
        );
    }

    /**
     * Removes one class row and keeps the starting-class selection valid.
     */
    function handleRemoveClass(index: number) {
        const nextClasses = draft.classes.filter((_, currentIndex) => currentIndex !== index);
        const removedClassId = draft.classes[index]?.classId ?? '';
        const nextStartingClassId = removedClassId === draft.startingClassId ? '' : draft.startingClassId;

        updateClasses(nextClasses, nextStartingClassId);
    }

    /**
     * Stores one subclass choice for the selected class row.
     */
    function handleSelectSubclass(index: number, subclassId: string) {
        updateClasses(
            draft.classes.map((classRow, currentIndex) => (
                currentIndex === index
                    ? { ...classRow, subclassId }
                    : classRow
            )),
        );
    }

    return (
        <>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
                <Text style={styles.heading}>Build your class path.</Text>
                <Text style={styles.sub}>
                    Split your levels across classes and choose which one was your first adventuring class.
                </Text>

                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Text style={styles.summaryLabel}>Allocation</Text>
                        <Pressable
                            onPress={() => setShowStartingClassInfo(true)}
                            style={({ pressed }) => [styles.infoButton, pressed && styles.infoButtonPressed]}
                            testID="starting-class-info"
                        >
                            <Text style={styles.infoButtonText}>What is a starting class?</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.summaryValue}>
                        {draft.level} total level{draft.level === 1 ? '' : 's'}
                    </Text>
                    <Text style={styles.summaryHint}>
                        {remainingLevelsCount === 0
                            ? 'All levels assigned.'
                            : remainingLevelsCount > 0
                                ? `${remainingLevelsCount} level${remainingLevelsCount === 1 ? '' : 's'} still to allocate.`
                                : `${Math.abs(remainingLevelsCount)} level${remainingLevelsCount === -1 ? '' : 's'} over the limit.`}
                    </Text>
                </View>

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
                        onRemove={() => handleRemoveClass(classRow.originalIndex)}
                        onSelectStartingClass={() => updateDraft({ startingClassId: classRow.classId })}
                        onSelectSubclass={(subclassId) => handleSelectSubclass(classRow.originalIndex, subclassId)}
                        subclassOptions={SUBCLASS_OPTIONS[classRow.classId] ?? []}
                        subclassUnlocked={isSubclassUnlocked(classRow)}
                    />
                ))}

                {availableClasses.length > 0 && remainingLevelsCount > 0 ? (
                    <View style={styles.addSection}>
                        <Text style={styles.sectionLabel}>Add another class</Text>
                        <View style={styles.addGrid}>
                            {availableClasses.map((classOption) => (
                                <Pressable
                                    key={classOption.value}
                                    onPress={() => handleAddClass(classOption.value)}
                                    style={({ pressed }) => [
                                        styles.addCard,
                                        pressed && styles.addCardPressed,
                                    ]}
                                    testID={`add-class-${classOption.value}`}
                                >
                                    <Text style={styles.addIcon}>{classOption.icon}</Text>
                                    <Text style={styles.addName}>{classOption.label}</Text>
                                    {classOption.hint ? (
                                        <Text style={styles.addHint}>{classOption.hint}</Text>
                                    ) : null}
                                </Pressable>
                            ))}
                        </View>
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
            </ScrollView>

            <Portal>
                <Modal
                    contentContainerStyle={styles.modal}
                    dismissable
                    onDismiss={() => setShowStartingClassInfo(false)}
                    visible={showStartingClassInfo}
                >
                    <Text style={styles.modalTitle}>Starting class</Text>
                    <Text style={styles.modalCopy}>
                        In D&amp;D multiclassing, your starting class is the one you began at level 1.
                        It determines your saving throw proficiencies and your full set of opening
                        class proficiencies. Later classes add only the reduced multiclass proficiencies.
                    </Text>
                    <Pressable
                        onPress={() => setShowStartingClassInfo(false)}
                        style={({ pressed }) => [
                            styles.modalButton,
                            pressed && styles.modalButtonPressed,
                        ]}
                    >
                        <Text style={styles.modalButtonText}>Close</Text>
                    </Pressable>
                </Modal>
            </Portal>
        </>
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
        fontSize: 22,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        lineHeight: 26,
        marginBottom: 4,
    },
    sub: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(201,146,42,0.5)',
        marginBottom: 20,
        lineHeight: 20,
    },
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
        fontSize: 9,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.55)',
    },
    infoButton: {
        paddingVertical: 4,
    },
    infoButtonPressed: {
        opacity: 0.75,
    },
    infoButtonText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        color: fantasyTokens.colors.gold,
    },
    summaryValue: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 20,
        color: fantasyTokens.colors.parchment,
        marginBottom: 4,
    },
    summaryHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        color: 'rgba(245,230,200,0.45)',
        lineHeight: 18,
    },
    addSection: {
        marginTop: 6,
    },
    sectionLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
        opacity: 0.75,
        marginBottom: 8,
    },
    addGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    addCard: {
        width: '48%',
        backgroundColor: 'rgba(240,224,188,0.06)',
        borderWidth: 1.5,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        alignItems: 'center',
    },
    addCardPressed: {
        backgroundColor: 'rgba(201,146,42,0.12)',
    },
    addIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    addName: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.parchment,
    },
    addHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        fontStyle: 'italic',
        color: 'rgba(245,230,200,0.35)',
        marginTop: 3,
        textAlign: 'center',
    },
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
        fontSize: 12,
        color: fantasyTokens.colors.parchment,
        lineHeight: 18,
    },
    modal: {
        margin: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: fantasyTokens.colors.night,
        padding: 20,
    },
    modalTitle: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 20,
        color: fantasyTokens.colors.parchment,
        marginBottom: 10,
    },
    modalCopy: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 14,
        color: 'rgba(245,230,200,0.8)',
        lineHeight: 22,
    },
    modalButton: {
        marginTop: 16,
        alignSelf: 'flex-end',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.25)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    modalButtonPressed: {
        backgroundColor: 'rgba(201,146,42,0.16)',
    },
    modalButtonText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
    },
});
