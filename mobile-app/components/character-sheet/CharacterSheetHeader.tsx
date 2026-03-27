import { fantasyTokens } from '@/theme/fantasyTheme';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import EditModeBanner from './edit-mode/EditModeBanner';

/**
 * Available top-level character sheet tabs in display order.
 */
export const CHARACTER_SHEET_TABS = ['Core', 'Abilities', 'Spells', 'Gear', 'Traits', 'Features'] as const;

/**
 * Union type of valid character sheet tab labels.
 */
export type CharacterSheetTab = (typeof CHARACTER_SHEET_TABS)[number];

/**
 * Props for the sticky character sheet header.
 */
type CharacterSheetHeaderProps = {
    name: string;
    level: number;
    classSummary: string;
    race: string;
    alignment: string;
    tabs?: readonly CharacterSheetTab[];
    activeTab: CharacterSheetTab;
    onTabPress: (tab: CharacterSheetTab) => void;
    editMode: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onDoneEdit: () => void;
    onLevelUp?: () => void;
};

/**
 * Sticky header for the character sheet, matching the HTML reference.
 *
 * Shows the "Character Sheet" label, character name, and a subtitle line
 * with level/class/race/alignment.
 */
export default function CharacterSheetHeader({
    name,
    level,
    classSummary,
    race,
    alignment,
    activeTab,
    onTabPress,
    editMode,
    onStartEdit,
    onCancelEdit,
    onDoneEdit,
    onLevelUp,
    tabs = CHARACTER_SHEET_TABS,
}: CharacterSheetHeaderProps) {
    const subtitle = `Level ${level}\n${classSummary} · ${race} · ${alignment}`;

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <View style={styles.headerText}>
                    <Text style={styles.sheetTitle}>Character Sheet</Text>
                </View>

                <View style={styles.editActions}>
                    {editMode ? (
                        <>
                            <Pressable
                                onPress={onDoneEdit}
                                style={styles.editButtonActive}
                                accessibilityRole="button"
                                accessibilityLabel="Save character sheet edits"
                            >
                                <Text style={styles.editButtonText}>Done</Text>
                            </Pressable>
                            <Pressable
                                onPress={onCancelEdit}
                                style={styles.cancelButton}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel character sheet edits"
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                        </>
                    ) : (
                        <Pressable
                            onPress={onStartEdit}
                            style={styles.editButton}
                            accessibilityRole="button"
                            accessibilityLabel="Enable character sheet edit mode"
                        >
                            <Text style={styles.editButtonText}>Edit</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            <View style={styles.topRow}>
                <View style={styles.headerText}>
                    <Text style={styles.charName}>{name}</Text>
                    <Text style={styles.charSubtitle}>{subtitle}</Text>
                    {onLevelUp && editMode && (
                        <Pressable
                            onPress={onLevelUp}
                            style={styles.levelUpButton}
                            accessibilityRole="button"
                            accessibilityLabel="Level up character"
                        >
                            <Text style={styles.levelUpText}>Level Up ↑</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            <View style={styles.tabBar}>
                {tabs.map((tab) => {
                    const isActive = tab === activeTab;

                    return (
                        <Pressable
                            key={tab}
                            style={styles.tab}
                            onPress={() => onTabPress(tab)}
                            accessibilityRole="tab"
                            accessibilityLabel={`Open ${tab} tab`}
                            accessibilityState={{ selected: isActive }}
                        >
                            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                {tab}
                            </Text>
                            {isActive && <View style={styles.tabIndicator} />}
                        </Pressable>
                    );
                })}
            </View>
            <EditModeBanner visible={editMode} />
        </View>
    );
}

/** Styles for the character sheet header and tab bar. */
const styles = StyleSheet.create({
    header: {
        backgroundColor: fantasyTokens.colors.night,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.2)',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    headerText: {
        alignItems: 'center',
        flex: 1,
    },
    sheetTitle: {
        ...fantasyTokens.typography.sectionLabel,
        letterSpacing: 3,
        color: fantasyTokens.colors.gold,
        opacity: 0.8,
        textAlign: 'center',
    },
    charName: {
        ...fantasyTokens.typography.pageTitle,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        letterSpacing: 0.5,
        marginTop: 6,
        textAlign: 'center',
    },
    charSubtitle: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.gold,
        marginTop: 2,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    tabBar: {
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.15)',
        padding: 10,
    },
    editActions: {
        alignItems: 'center',
        gap: 8,
        position: 'absolute',
        top: 0,
        right: 0,
        marginBottom: 8,
    },
    editButton: {
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.25)',
        backgroundColor: 'rgba(201,146,42,0.06)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    editButtonActive: {
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.5)',
        backgroundColor: 'rgba(201,146,42,0.18)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    cancelButton: {
        borderWidth: 1,
        borderColor: 'rgba(139,90,43,0.3)',
        backgroundColor: 'rgba(17,11,7,0.3)',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    editButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        letterSpacing: 1.5,
        color: fantasyTokens.colors.gold,
        fontWeight: '600',
    },
    cancelButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        letterSpacing: 1.5,
        color: 'rgba(201,146,42,0.8)',
        fontWeight: '600',
    },
    tab: {
        paddingHorizontal: 7,
        paddingTop: 8,
        paddingBottom: 10,
        position: 'relative',
    },
    tabText: {
        ...fantasyTokens.typography.buttonLabel,
        letterSpacing: 0.5,
        color: 'rgba(201,146,42,0.5)',
    },
    tabTextActive: {
        color: fantasyTokens.colors.gold,
    },
    tabIndicator: {
        position: 'absolute',
        bottom: -1,
        left: 12,
        right: 12,
        height: 2,
        backgroundColor: fantasyTokens.colors.gold,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    levelUpButton: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(42,122,42,0.4)',
        backgroundColor: 'rgba(42,122,42,0.12)',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 5,
    },
    levelUpText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: '#4caf50',
        fontWeight: '600',
    },
});
