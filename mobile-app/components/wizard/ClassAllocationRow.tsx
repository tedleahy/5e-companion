import { Pressable, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import { ParchmentPanel } from '@/components/FantasyPrimitives';
import {
    classLabel,
    formatClassRowLabel,
    subclassUnlockLevel,
    type CharacterClassDraft,
} from '@/lib/characterCreation/multiclass';
import type { OptionItem } from '@/lib/characterCreation/options';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { useState } from 'react';

type Props = {
    canDecreaseLevel: boolean;
    canIncreaseLevel: boolean;
    canRemove: boolean;
    classRow: CharacterClassDraft;
    index: number;
    isStartingClass: boolean;
    onDecreaseLevel: () => void;
    onIncreaseLevel: () => void;
    onLayout?: (event: LayoutChangeEvent) => void;
    onRemove: () => void;
    onSelectStartingClass: () => void;
    onSelectSubclass: (subclassId: string) => void;
    showStartingClassSelector: boolean;
    subclassOptions: OptionItem[];
    subclassUnlocked: boolean;
};

/**
 * Renders one editable multiclass row in the character-creation wizard.
 */
export default function ClassAllocationRow({
    canDecreaseLevel,
    canIncreaseLevel,
    canRemove,
    classRow,
    index,
    isStartingClass,
    onDecreaseLevel,
    onIncreaseLevel,
    onLayout,
    onRemove,
    onSelectStartingClass,
    onSelectSubclass,
    showStartingClassSelector,
    subclassOptions,
    subclassUnlocked,
}: Props) {
    const [showStartingClassInfo, setShowStartingClassInfo] = useState(false);
    const unlockLevel = subclassUnlockLevel(classRow.classId);

    return (
        <View onLayout={onLayout}>
            <ParchmentPanel style={styles.card}>
                <View style={styles.headerRow}>
                    <View style={styles.titleColumn}>
                        <Text style={styles.rowLabel}>{`Class ${index + 1}`}</Text>
                        <Text style={styles.className}>{formatClassRowLabel(classRow)}</Text>
                    </View>

                    {(!canDecreaseLevel && !canIncreaseLevel) ? (
                        <Text style={styles.subclassHeading}>
                            Level {classRow.level}
                        </Text>
                    ) : (
                        <View style={styles.levelStepper}>
                            <Pressable
                                accessibilityRole="button"
                                disabled={!canDecreaseLevel}
                                onPress={onDecreaseLevel}
                                style={({ pressed }) => [
                                    styles.levelButton,
                                    !canDecreaseLevel && styles.levelButtonDisabled,
                                    pressed && canDecreaseLevel && styles.levelButtonPressed,
                                ]}
                                testID={`class-row-level-down-${index}`}
                            >
                                <Text style={styles.levelButtonText}>{'\u2212'}</Text>
                            </Pressable>
                            <Text style={styles.levelValue}>{classRow.level}</Text>
                            <Pressable
                                accessibilityRole="button"
                                disabled={!canIncreaseLevel}
                                onPress={onIncreaseLevel}
                                style={({ pressed }) => [
                                    styles.levelButton,
                                    !canIncreaseLevel && styles.levelButtonDisabled,
                                    pressed && canIncreaseLevel && styles.levelButtonPressed,
                                ]}
                                testID={`class-row-level-up-${index}`}
                            >
                                <Text style={styles.levelButtonText}>+</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {showStartingClassSelector ? (
                    <Pressable
                        accessibilityRole="radio"
                        onPress={onSelectStartingClass}
                        style={styles.startingRow}
                        testID={`class-row-starting-${index}`}
                    >
                        <RadioButton
                            color={fantasyTokens.colors.gold}
                            status={isStartingClass ? 'checked' : 'unchecked'}
                            uncheckedColor="rgba(201,146,42,0.4)"
                            value={`starting-class-${index}`}
                        />
                        <View style={styles.startingCopy}>
                            <View style={styles.startingLabelRow}>
                                <Text style={styles.startingLabel}>Starting class</Text>
                                <Pressable
                                    onPress={() => setShowStartingClassInfo(!showStartingClassInfo)}
                                    testID="starting-class-info"
                                    style={styles.infoButton}
                                    hitSlop={8}
                                >
                                    <Text style={styles.infoButtonIcon}>
                                        {'\u{1F6C8}'}
                                    </Text>
                                    <Text style={styles.infoButtonLabel}>What is this?</Text>
                                </Pressable>
                            </View>

                            {showStartingClassInfo && (
                                <Text style={styles.startingHint}>
                                    This is the class your character began with at level 1. It determines
                                    your saving throw proficiencies and your full set of opening class proficiencies.
                                    Later classes add only the reduced multiclass proficiencies.
                                </Text>
                            )}
                        </View>
                    </Pressable>
                ) : null}

                {subclassOptions.length > 0 ? (
                    <View style={styles.subclassSection}>
                        <Text style={styles.subclassHeading}>
                            {classLabel(classRow.classId)} subclass
                        </Text>
                        {subclassUnlocked ? (
                            <View style={styles.subclassList}>
                                {subclassOptions.map((subclassOption) => {
                                    const isSelected = classRow.subclassId === subclassOption.value;
                                    return (
                                        <Pressable
                                            key={subclassOption.value}
                                            accessibilityRole="button"
                                            onPress={() => onSelectSubclass(isSelected ? '' : subclassOption.value)}
                                            style={({ pressed }) => [
                                                styles.subclassOption,
                                                isSelected && styles.subclassOptionSelected,
                                                pressed && styles.subclassOptionPressed,
                                            ]}
                                            testID={`class-row-subclass-${index}-${subclassOption.value}`}
                                        >
                                            <Text style={styles.subclassIcon}>{subclassOption.icon}</Text>
                                            <View style={styles.subclassText}>
                                                <Text style={[styles.subclassName, isSelected && styles.subclassNameSelected]}>
                                                    {subclassOption.label}
                                                </Text>
                                                {subclassOption.hint ? (
                                                    <Text style={styles.subclassHint}>{subclassOption.hint}</Text>
                                                ) : null}
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        ) : (
                            <Text style={styles.lockedHint}>
                                Unlocks at {classLabel(classRow.classId)} level {unlockLevel}.
                            </Text>
                        )}
                    </View>
                ) : null}

                <View style={styles.controlsRow}>
                    <Pressable
                        accessibilityRole="button"
                        disabled={!canRemove}
                        onPress={onRemove}
                        style={({ pressed }) => [
                            styles.removeButton,
                            !canRemove && styles.controlButtonDisabled,
                            pressed && canRemove && styles.removeButtonPressed,
                        ]}
                        testID={`class-row-remove-${index}`}
                    >
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </Pressable>
                </View>

            </ParchmentPanel>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 12,
        padding: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    titleColumn: {
        flex: 1,
    },
    rowLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkSoft,
        marginBottom: 4,
    },
    className: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.title,
        color: fantasyTokens.colors.inkDark,
    },
    levelStepper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    levelButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(201,146,42,0.08)',
    },
    levelButtonPressed: {
        backgroundColor: 'rgba(201,146,42,0.16)',
    },
    levelButtonDisabled: {
        opacity: 0.35,
    },
    levelButtonText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        color: fantasyTokens.colors.inkDark,
    },
    levelValue: {
        minWidth: 42,
        textAlign: 'center',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.bodyLarge,
        color: fantasyTokens.colors.inkDark,
    },
    startingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.16)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.16)',
    },
    startingCopy: {
        flex: 1,
    },
    startingLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        color: fantasyTokens.colors.inkDark,
    },
    startingHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        color: fantasyTokens.colors.inkSoft,
    },
    controlsRow: {
        alignItems: 'flex-end',
        marginTop: 12,
    },
    controlButtonDisabled: {
        opacity: 0.35,
    },
    removeButton: {
        minWidth: 120,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.25)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: 'center',
        backgroundColor: 'rgba(139,26,26,0.08)',
    },
    removeButtonPressed: {
        backgroundColor: 'rgba(139,26,26,0.14)',
    },
    removeButtonText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.crimson,
    },
    subclassSection: {
        marginTop: 14,
    },
    subclassHeading: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.8,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkSoft,
        marginBottom: 8,
    },
    subclassList: {
        gap: 8,
    },
    subclassOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        backgroundColor: 'rgba(240,224,188,0.35)',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    subclassOptionSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: 'rgba(201,146,42,0.12)',
    },
    subclassOptionPressed: {
        opacity: 0.9,
    },
    subclassIcon: {
        fontSize: fantasyTokens.fontSizes.titleLarge,
    },
    subclassText: {
        flex: 1,
    },
    subclassName: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        color: fantasyTokens.colors.inkDark,
    },
    subclassNameSelected: {
        color: fantasyTokens.colors.crimson,
    },
    subclassHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        color: fantasyTokens.colors.inkSoft,
        marginTop: 3,
    },
    lockedHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        fontStyle: 'italic',
        color: fantasyTokens.colors.inkSoft,
    },
    startingLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    infoButtonIcon: {
        fontSize: 14,
        color: fantasyTokens.colors.goldDark,
        paddingRight: 3
    },
    infoButton: {
        padding: 4,
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoButtonLabel: {
        fontSize: 12,
        color: fantasyTokens.colors.goldDark,
    },
});
