import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import EditModeBanner from './edit-mode/EditModeBanner';

/**
 * Available top-level character sheet tabs in display order.
 */
export const CHARACTER_SHEET_TABS = ['Core', 'Skills', 'Spells', 'Gear', 'Features'] as const;

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
    className: string;
    subclass?: string;
    race: string;
    alignment: string;
    activeTab: CharacterSheetTab;
    onTabPress: (tab: CharacterSheetTab) => void;
    editMode: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onDoneEdit: () => void;
};

/**
 * Sticky header for the character sheet, matching the HTML reference.
 *
 * Shows the "Character Codex" label, character name, and a subtitle line
 * with level/class/race/alignment.
 */
export default function CharacterSheetHeader({
    name,
    level,
    className,
    subclass,
    race,
    alignment,
    activeTab,
    onTabPress,
    editMode,
    onStartEdit,
    onCancelEdit,
    onDoneEdit,
}: CharacterSheetHeaderProps) {
    const subtitle = `Level ${level}\n${className}${subclass ? ` · ${subclass}` : ''} · ${race} · ${alignment}`;

    return (
        <View style={styles.header}>
            <View style={styles.topRow}>
                <View style={styles.headerText}>
                    <Text style={styles.codexLabel}>Character Codex</Text>
                    <Text style={styles.charName}>{name}</Text>
                    <Text style={styles.charSubtitle}>{subtitle}</Text>
                </View>

                <View style={styles.editActions}>
                    {editMode ? (
                        <>
                            <Pressable
                                onPress={onCancelEdit}
                                style={styles.cancelButton}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel character sheet edits"
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                onPress={onDoneEdit}
                                style={styles.editButtonActive}
                                accessibilityRole="button"
                                accessibilityLabel="Save character sheet edits"
                            >
                                <Text style={styles.editButtonText}>Done</Text>
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

            <EditModeBanner visible={editMode} />

            <View style={styles.tabBar}>
                {CHARACTER_SHEET_TABS.map((tab) => {
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
    codexLabel: {
        fontFamily: 'serif',
        fontSize: 9,
        letterSpacing: 3,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.8,
        textAlign: 'center',
    },
    charName: {
        fontFamily: 'serif',
        fontSize: 28,
        fontWeight: '700',
        color: fantasyTokens.colors.parchment,
        lineHeight: 32,
        letterSpacing: 0.5,
        marginTop: 6,
        textAlign: 'center',
    },
    charSubtitle: {
        fontFamily: 'serif',
        fontSize: 14,
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
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
        fontFamily: 'serif',
        fontSize: 8.5,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        fontWeight: '600',
    },
    cancelButtonText: {
        fontFamily: 'serif',
        fontSize: 8.5,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'rgba(201,146,42,0.8)',
        fontWeight: '600',
    },
    tab: {
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 10,
        position: 'relative',
    },
    tabText: {
        fontFamily: 'serif',
        fontSize: 9.5,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
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
});
