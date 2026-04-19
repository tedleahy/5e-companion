import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { levelUpHitDieLabel } from '@/lib/characterLevelUp/chooseClass';
import { averageLevelUpHitDieValue } from '@/lib/characterLevelUp/hitPoints';
import type { UseLevelUpWizardResult } from '@/hooks/useLevelUpWizard';
import { formatSignedNumber } from '@/lib/characterSheetUtils';
import { fantasyTokens } from '@/theme/fantasyTheme';

type LevelUpHitPointsStepProps = {
    wizard: UseLevelUpWizardResult;
};

/**
 * Renders the hit-points step for one level-up flow.
 */
export default function LevelUpHitPointsStep({
    wizard,
}: LevelUpHitPointsStepProps) {
    const { selectedClass, hitPointsState, rollHitPoints, takeAverageHitPoints } = wizard;
    const dieScale = useRef(new Animated.Value(1)).current;
    const dieRotate = useRef(new Animated.Value(0)).current;
    const dieShiftX = useRef(new Animated.Value(0)).current;
    const dieShiftY = useRef(new Animated.Value(0)).current;
    const dieGlow = useRef(new Animated.Value(0)).current;
    const rollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const rollingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [displayValue, setDisplayValue] = useState(levelUpHitDieLabel(selectedClass.classId));
    const [isRolling, setIsRolling] = useState(false);
    const hitDieLabel = levelUpHitDieLabel(selectedClass.classId);
    const averageHitPoints = averageLevelUpHitDieValue(selectedClass.classId);
    const breakdownRollLabel = hitPointsState?.method === 'average' ? 'Average Hit Die' : 'Hit Die Roll';
    const animatedBorderColour = dieGlow.interpolate({
        inputRange: [0, 1],
        outputRange: [fantasyTokens.colors.sheetDivider, fantasyTokens.colors.claret],
    });
    const animatedBackgroundColour = dieGlow.interpolate({
        inputRange: [0, 1],
        outputRange: [fantasyTokens.colors.parchmentLight, fantasyTokens.colors.parchmentDeep],
    });

    useEffect(() => {
        return () => {
            clearRollingTimers(rollingIntervalRef.current, rollingTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        clearRollingTimers(rollingIntervalRef.current, rollingTimeoutRef.current);
        rollingIntervalRef.current = null;
        rollingTimeoutRef.current = null;

        if (hitPointsState == null) {
            setDisplayValue(hitDieLabel);
            setIsRolling(false);
            dieGlow.setValue(0);
            return;
        }

        if (hitPointsState.method === 'average') {
            setIsRolling(false);
            setDisplayValue(String(hitPointsState.hitDieValue));
            playAverageAnimation(dieScale, dieRotate, dieShiftX, dieShiftY, dieGlow);
            return;
        }

        setIsRolling(true);
        setDisplayValue(String(randomHitDieFace(hitPointsState.hitDieSize)));
        rollingIntervalRef.current = setInterval(() => {
            setDisplayValue(String(randomHitDieFace(hitPointsState.hitDieSize)));
        }, 45);
        rollingTimeoutRef.current = setTimeout(() => {
            clearRollingTimers(rollingIntervalRef.current, rollingTimeoutRef.current);
            rollingIntervalRef.current = null;
            rollingTimeoutRef.current = null;
            setDisplayValue(String(hitPointsState.hitDieValue));
            setIsRolling(false);
        }, 560);

        playRollAnimation(dieScale, dieRotate, dieShiftX, dieShiftY, dieGlow);
    }, [dieGlow, dieRotate, dieScale, dieShiftX, dieShiftY, hitDieLabel, hitPointsState]);

    return (
        <View style={styles.section} testID="level-up-step-hit_points">
            <Text style={styles.bodyText}>
                {`Roll ${selectedClass.className}'s ${hitDieLabel} for this level, or take the average if you want the steady result.`}
            </Text>

            <View style={styles.dieWrap}>
                <Animated.View
                    style={[
                        styles.dieBox,
                        {
                            borderColor: animatedBorderColour,
                            backgroundColor: animatedBackgroundColour,
                            transform: [
                                { scale: dieScale },
                                { translateX: dieShiftX },
                                { translateY: dieShiftY },
                                {
                                    rotate: dieRotate.interpolate({
                                        inputRange: [-1, 0, 1],
                                        outputRange: ['-20deg', '0deg', '20deg'],
                                    }),
                                },
                            ],
                        },
                    ]}
                    testID="level-up-hit-points-die"
                >
                    <Text style={styles.dieValue} testID="level-up-hit-points-die-value">
                        {displayValue}
                    </Text>
                    <View style={styles.dieBadge}>
                        <Text style={styles.dieBadgeText}>{hitDieLabel}</Text>
                    </View>
                </Animated.View>
            </View>

            <View style={styles.actions}>
                <Pressable
                    onPress={rollHitPoints}
                    style={[styles.rollButton, isRolling && styles.rollButtonDisabled]}
                    accessibilityRole="button"
                    accessibilityLabel="Roll hit die"
                    accessibilityState={{ disabled: isRolling }}
                    disabled={isRolling}
                    testID="level-up-hit-points-roll-button"
                >
                    <Text style={styles.rollButtonText}>
                        {hitPointsState?.method === 'roll' ? 'Re-roll' : 'Roll Hit Die'}
                    </Text>
                </Pressable>

                <Pressable
                    onPress={takeAverageHitPoints}
                    accessibilityRole="button"
                    accessibilityLabel={`Take the average hit points of ${averageHitPoints}`}
                    testID="level-up-hit-points-average-button"
                >
                    <Text style={styles.averageLinkText}>{`or take the average (${averageHitPoints})`}</Text>
                </Pressable>
            </View>

            {hitPointsState != null ? (
                <View style={styles.breakdownCard} testID="level-up-hit-points-breakdown">
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>{breakdownRollLabel}</Text>
                        <Text style={styles.breakdownValue}>{hitPointsState.hitDieValue}</Text>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Constitution Modifier</Text>
                        <Text style={styles.breakdownValue}>
                            {formatSignedNumber(hitPointsState.constitutionModifier)}
                        </Text>
                    </View>
                    <View style={[styles.breakdownRow, styles.breakdownTotalRow]}>
                        <Text style={styles.breakdownTotalLabel}>HP Gained</Text>
                        <Text style={styles.breakdownTotalValue}>
                            {formatSignedNumber(hitPointsState.hpGained)}
                        </Text>
                    </View>
                </View>
            ) : null}
        </View>
    );
}

/**
 * Styles for the hit-points level-up step.
 */
const styles = StyleSheet.create({
    section: {
        gap: fantasyTokens.spacing.lg,
    },
    bodyText: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
        textAlign: 'center',
    },
    dieWrap: {
        alignItems: 'center',
    },
    dieBox: {
        width: 120,
        height: 120,
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    dieValue: {
        ...fantasyTokens.typography.pageTitle,
        color: fantasyTokens.colors.inkDark,
        fontSize: 34,
        lineHeight: 40,
    },
    dieBadge: {
        position: 'absolute',
        bottom: fantasyTokens.spacing.sm,
        right: fantasyTokens.spacing.sm,
        borderRadius: 999,
        backgroundColor: fantasyTokens.colors.claret,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: 3,
    },
    dieBadgeText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    actions: {
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    rollButton: {
        minWidth: 220,
        alignItems: 'center',
        backgroundColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.md,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
    },
    rollButtonDisabled: {
        opacity: 0.78,
    },
    rollButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
    averageLinkText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.claret,
        textDecorationLine: 'underline',
    },
    breakdownCard: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        borderRadius: fantasyTokens.radii.md,
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.md,
    },
    breakdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    breakdownLabel: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
    },
    breakdownValue: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
    },
    breakdownTotalRow: {
        paddingTop: fantasyTokens.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.sheetDivider,
    },
    breakdownTotalLabel: {
        ...fantasyTokens.typography.sectionLabel,
        color: fantasyTokens.colors.claret,
    },
    breakdownTotalValue: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.success,
    },
});

/**
 * Returns one random face value for a hit die.
 */
function randomHitDieFace(hitDieSize: number): number {
    return Math.max(1, Math.floor(Math.random() * hitDieSize) + 1);
}

/**
 * Clears any active roll-cycling timers.
 */
function clearRollingTimers(
    intervalHandle: ReturnType<typeof setInterval> | null,
    timeoutHandle: ReturnType<typeof setTimeout> | null,
) {
    if (intervalHandle != null) {
        clearInterval(intervalHandle);
    }

    if (timeoutHandle != null) {
        clearTimeout(timeoutHandle);
    }
}

/**
 * Plays a more aggressive roll animation with shake, lurch, and spin.
 */
function playRollAnimation(
    dieScale: Animated.Value,
    dieRotate: Animated.Value,
    dieShiftX: Animated.Value,
    dieShiftY: Animated.Value,
    dieGlow: Animated.Value,
) {
    dieScale.setValue(0.84);
    dieRotate.setValue(-1);
    dieShiftX.setValue(0);
    dieShiftY.setValue(0);
    dieGlow.setValue(1);

    Animated.parallel([
        Animated.sequence([
            Animated.timing(dieScale, {
                toValue: 1.18,
                duration: 210,
                useNativeDriver: false,
            }),
            Animated.spring(dieScale, {
                toValue: 1,
                friction: 4,
                tension: 230,
                useNativeDriver: false,
            }),
        ]),
        Animated.sequence([
            Animated.timing(dieRotate, {
                toValue: 1,
                duration: 260,
                useNativeDriver: false,
            }),
            Animated.timing(dieRotate, {
                toValue: -0.85,
                duration: 220,
                useNativeDriver: false,
            }),
            Animated.spring(dieRotate, {
                toValue: 0,
                friction: 5,
                tension: 95,
                useNativeDriver: false,
            }),
        ]),
        Animated.sequence([
            Animated.timing(dieShiftX, {
                toValue: -14,
                duration: 145,
                useNativeDriver: false,
            }),
            Animated.timing(dieShiftX, {
                toValue: 16,
                duration: 155,
                useNativeDriver: false,
            }),
            Animated.timing(dieShiftX, {
                toValue: -10,
                duration: 150,
                useNativeDriver: false,
            }),
            Animated.timing(dieShiftX, {
                toValue: 9,
                duration: 145,
                useNativeDriver: false,
            }),
            Animated.spring(dieShiftX, {
                toValue: 0,
                friction: 6,
                tension: 120,
                useNativeDriver: false,
            }),
        ]),
        Animated.sequence([
            Animated.timing(dieShiftY, {
                toValue: -10,
                duration: 80,
                useNativeDriver: false,
            }),
            Animated.timing(dieShiftY, {
                toValue: 8,
                duration: 90,
                useNativeDriver: false,
            }),
            Animated.spring(dieShiftY, {
                toValue: 0,
                friction: 5,
                tension: 115,
                useNativeDriver: false,
            }),
        ]),
        Animated.sequence([
            Animated.delay(260),
            Animated.timing(dieGlow, {
                toValue: 0.72,
                duration: 240,
                useNativeDriver: false,
            }),
            Animated.timing(dieGlow, {
                toValue: 1,
                duration: 240,
                useNativeDriver: false,
            }),
        ]),
    ]).start();
}

/**
 * Plays a smaller confirmation pulse for the average path.
 */
function playAverageAnimation(
    dieScale: Animated.Value,
    dieRotate: Animated.Value,
    dieShiftX: Animated.Value,
    dieShiftY: Animated.Value,
    dieGlow: Animated.Value,
) {
    dieScale.setValue(0.96);
    dieRotate.setValue(-0.15);
    dieShiftX.setValue(0);
    dieShiftY.setValue(0);
    dieGlow.setValue(1);

    Animated.parallel([
        Animated.spring(dieScale, {
            toValue: 1,
            friction: 5,
            tension: 95,
            useNativeDriver: false,
        }),
        Animated.timing(dieRotate, {
            toValue: 0,
            duration: 220,
            useNativeDriver: false,
        }),
    ]).start();
}
