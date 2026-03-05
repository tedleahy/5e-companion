import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

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
}: CharacterSheetHeaderProps) {
    const subtitle = `Level ${level}\n${className}${subclass ? ` · ${subclass}` : ''} · ${race} · ${alignment}`;

    return (
        <View style={styles.header}>
            <View style={styles.headerText}>
                <Text style={styles.codexLabel}>Character Codex</Text>
                <Text style={styles.charName}>{name}</Text>
                <Text style={styles.charSubtitle}>{subtitle}</Text>
            </View>

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
    headerText: {
        alignItems: 'center',
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
        marginTop: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.15)',
        padding: 10,
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
