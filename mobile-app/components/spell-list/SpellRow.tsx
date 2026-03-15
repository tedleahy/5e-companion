import { useEffect, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { fantasyTokens } from '@/theme/fantasyTheme';
import AccordionDrawer from '@/components/spell-list/AccordionDrawer';
import type { SpellListItem } from '@/components/spell-list/spellList.types';

/**
 * Tag metadata rendered on a spell row.
 */
type SpellTag = {
    label: string;
    style: 'concentration' | 'ritual';
};

/**
 * Props for the reusable spell row renderer.
 */
type SpellRowProps = {
    spell: SpellListItem;
    spellMeta: string;
    tags: SpellTag[];
    showPreparedState: boolean;
    isOpen: boolean;
    hasAccordionActions: boolean;
    isPrepared: boolean;
    isRemoving: boolean;
    showBottomDivider: boolean;
    onPressRow: () => void;
    onTogglePrepared?: () => void;
    accordionActions?: ReactNode;
    rowTestIdPrefix: string;
};

/**
 * Fixed row height used during collapse animation when removing rows.
 */
const SPELL_ROW_COLLAPSE_HEIGHT = 64;

/**
 * Duration for row removal collapse animation.
 */
export const SPELL_ROW_REMOVE_DURATION_MS = 280;

/**
 * Renders a single spell row with optional inline accordion actions.
 */
export default function SpellRow({
    spell,
    spellMeta,
    tags,
    showPreparedState,
    isOpen,
    hasAccordionActions,
    isPrepared,
    isRemoving,
    showBottomDivider,
    onPressRow,
    onTogglePrepared,
    accordionActions,
    rowTestIdPrefix,
}: SpellRowProps) {
    const chevronRotation = useSharedValue(0);
    const rowHeight = useSharedValue(SPELL_ROW_COLLAPSE_HEIGHT);
    const rowOpacity = useSharedValue(1);

    useEffect(() => {
        chevronRotation.value = withTiming(isOpen ? 90 : 0, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
        });
    }, [chevronRotation, isOpen]);

    useEffect(() => {
        if (!isRemoving) {
            rowHeight.value = SPELL_ROW_COLLAPSE_HEIGHT;
            rowOpacity.value = 1;
            return;
        }

        rowHeight.value = withTiming(0, {
            duration: SPELL_ROW_REMOVE_DURATION_MS,
            easing: Easing.out(Easing.cubic),
        });
        rowOpacity.value = withTiming(0, {
            duration: 220,
            easing: Easing.out(Easing.cubic),
        });
    }, [isRemoving, rowHeight, rowOpacity]);

    const chevronAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${chevronRotation.value}deg` }],
    }));

    const removingAnimatedStyle = useAnimatedStyle(() => ({
        height: isRemoving ? rowHeight.value : undefined,
        opacity: rowOpacity.value,
        overflow: isRemoving ? 'hidden' : 'visible',
    }));

    return (
        <Animated.View style={removingAnimatedStyle}>
            <View style={[styles.groupContainer, showPreparedState && styles.preparedBorderBase, isPrepared && styles.preparedBorderActive]}>
                <Pressable
                    style={({ pressed }) => [
                        styles.spellRow,
                        hasAccordionActions && styles.spellRowAccordion,
                        hasAccordionActions && isOpen && styles.spellRowOpen,
                        !hasAccordionActions && showBottomDivider && styles.spellRowDivider,
                        pressed && styles.spellRowPressed,
                    ]}
                    onPress={onPressRow}
                    accessibilityRole="button"
                    accessibilityLabel={hasAccordionActions ? `Toggle actions for ${spell.name}` : `Open ${spell.name}`}
                    testID={`${rowTestIdPrefix}-row-${spell.id}`}
                >
                    {showPreparedState && (
                        <PreparedDot
                            isPrepared={isPrepared}
                            canToggle={!hasAccordionActions && typeof onTogglePrepared === 'function'}
                            onTogglePrepared={onTogglePrepared}
                            spellName={spell.name}
                            testID={`${rowTestIdPrefix}-prepared-${spell.id}`}
                        />
                    )}

                    <View style={[
                        styles.levelBadge,
                        spell.level === 0 && styles.levelBadgeCantrip,
                        spell.level == null && styles.levelBadgeUnknown,
                    ]}
                    >
                        <Text
                            style={[
                                styles.levelBadgeText,
                                spell.level === 0 && styles.levelBadgeTextCantrip,
                                spell.level == null && styles.levelBadgeTextUnknown,
                            ]}
                        >
                            {spellLevelBadgeLabel(spell.level ?? null)}
                        </Text>
                    </View>

                    <View style={styles.spellInfo}>
                        <Text
                            style={[
                                styles.spellName,
                                showPreparedState && !isPrepared && !hasAccordionActions && styles.spellNameUnprepared,
                                hasAccordionActions && isOpen && styles.spellNameOpen,
                            ]}
                            numberOfLines={1}
                        >
                            {spell.name}
                        </Text>
                        {spellMeta.length > 0 && (
                            <Text style={styles.spellMeta} numberOfLines={1}>
                                {spellMeta}
                            </Text>
                        )}
                    </View>

                    {tags.length > 0 && (
                        <View style={styles.tagsRow}>
                            {tags.map((tag) => (
                                <View
                                    key={tag.label}
                                    style={[
                                        styles.tag,
                                        tag.style === 'concentration'
                                            ? styles.concentrationTag
                                            : styles.ritualTag,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.tagText,
                                            tag.style === 'concentration'
                                                ? styles.concentrationTagText
                                                : styles.ritualTagText,
                                        ]}
                                    >
                                        {tag.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {hasAccordionActions && (
                        <Animated.Text style={[styles.rowChevron, isOpen && styles.rowChevronOpen, chevronAnimatedStyle]}>
                            {'\u203a'}
                        </Animated.Text>
                    )}
                </Pressable>

                {hasAccordionActions && (
                    <AccordionDrawer open={isOpen && !isRemoving}>
                        {accordionActions}
                    </AccordionDrawer>
                )}
            </View>
        </Animated.View>
    );
}

/**
 * Visual prepared-state indicator with optional tap-to-toggle behaviour.
 */
function PreparedDot({
    isPrepared,
    canToggle,
    onTogglePrepared,
    spellName,
    testID,
}: {
    isPrepared: boolean;
    canToggle: boolean;
    onTogglePrepared?: () => void;
    spellName: string;
    testID: string;
}) {
    const dotStyles = [
        styles.preparedDot,
        !isPrepared && styles.preparedDotUnprepared,
    ];

    if (canToggle && onTogglePrepared) {
        return (
            <Pressable
                style={dotStyles}
                onPress={onTogglePrepared}
                accessibilityRole="button"
                accessibilityLabel={`Toggle prepared for ${spellName}`}
                testID={testID}
            />
        );
    }

    return <View style={dotStyles} testID={testID} />;
}

/**
 * Builds the short level badge label for a row.
 */
function spellLevelBadgeLabel(level: number | null): string {
    if (level == null) return '\u2022';
    if (level === 0) return 'C';
    return String(level);
}

const styles = StyleSheet.create({
    groupContainer: {
        overflow: 'hidden',
    },
    preparedBorderBase: {
        borderLeftWidth: 2.5,
        borderLeftColor: 'transparent',
    },
    preparedBorderActive: {
        borderLeftColor: fantasyTokens.colors.crimson,
    },
    spellRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
    },
    spellRowDivider: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139,90,43,0.12)',
    },
    spellRowAccordion: {
        paddingHorizontal: 11.5,
        borderTopWidth: 1,
        borderTopColor: 'rgba(139,90,43,0.28)',
        backgroundColor: 'transparent',
    },
    spellRowOpen: {
        backgroundColor: fantasyTokens.colors.rowOpenBg,
    },
    spellRowPressed: {
        opacity: 0.9,
    },
    levelBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: 'rgba(139,26,26,0.25)',
        backgroundColor: 'rgba(139,26,26,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    levelBadgeCantrip: {
        borderColor: 'rgba(201,146,42,0.3)',
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    levelBadgeUnknown: {
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'transparent',
    },
    levelBadgeText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        fontWeight: '700',
        color: fantasyTokens.colors.crimson,
    },
    levelBadgeTextCantrip: {
        fontSize: 8,
        color: fantasyTokens.colors.gold,
    },
    levelBadgeTextUnknown: {
        fontSize: 9,
        color: 'rgba(61,43,31,0.45)',
    },
    preparedDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: fantasyTokens.colors.crimson,
        flexShrink: 0,
        opacity: 1,
    },
    preparedDotUnprepared: {
        opacity: 0,
    },
    spellInfo: {
        flex: 1,
        minWidth: 0,
    },
    spellName: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11.5,
        fontWeight: '700',
        color: fantasyTokens.colors.inkDark,
        lineHeight: 16,
    },
    spellNameOpen: {
        color: fantasyTokens.colors.crimson,
    },
    spellNameUnprepared: {
        opacity: 0.5,
    },
    spellMeta: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        color: fantasyTokens.colors.inkLight,
        opacity: 0.6,
        fontStyle: 'italic',
        marginTop: 1,
    },
    tagsRow: {
        flexDirection: 'row',
        gap: 4,
        flexShrink: 0,
    },
    tag: {
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    tagText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 7.5,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    concentrationTag: {
        backgroundColor: 'rgba(26,42,74,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(26,42,74,0.26)',
    },
    concentrationTagText: {
        color: fantasyTokens.colors.blueDark,
    },
    ritualTag: {
        backgroundColor: 'rgba(30,80,30,0.1)',
    },
    ritualTagText: {
        color: fantasyTokens.colors.greenDark,
    },
    rowChevron: {
        color: 'rgba(26,15,0,0.22)',
        fontSize: 14,
        lineHeight: 14,
        flexShrink: 0,
        marginLeft: 4,
    },
    rowChevronOpen: {
        color: fantasyTokens.colors.crimson,
    },
});
