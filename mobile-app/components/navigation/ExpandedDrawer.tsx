import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    FOOTER_NAV_ITEMS,
    isNavigationDestinationActive,
    LIBRARY_NAV_ITEMS,
    type NavigationItem,
    type NavigationDestination,
} from '@/components/navigation/navigationConstants';

type DrawerItemProps = {
    item: NavigationItem;
    isActive: boolean;
    onPress: (destination: NavigationDestination) => void;
};

/**
 * Custom expanded drawer content that mirrors the fantasy rail design.
 */
export default function ExpandedDrawer({ navigation }: DrawerContentComponentProps) {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    /**
     * Navigates to a top-level route and closes the drawer.
     */
    function navigateTo(destination: NavigationDestination) {
        router.push(destination);
        navigation.closeDrawer();
    }

    /**
     * Closes the drawer panel without navigating.
     */
    function collapseDrawer() {
        navigation.closeDrawer();
    }

    /**
     * Signs out the user and redirects to sign-in.
     */
    async function signOut() {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error(error);
        }

        navigation.closeDrawer();
        router.replace('/(auth)/sign-in');
    }

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarEmoji}>🧙</Text>
                </View>
                <View style={styles.characterMeta}>
                    <Text style={styles.characterName} numberOfLines={1}>Adventurer</Text>
                    <Text style={styles.characterSubline} numberOfLines={1}>Ready for the next quest</Text>
                </View>
            </View>

            <View style={styles.navSection}>
                <Text style={styles.sectionLabel}>Library</Text>
                {LIBRARY_NAV_ITEMS.map((item) => (
                    <DrawerItem
                        key={item.destination}
                        item={item}
                        isActive={isNavigationDestinationActive(pathname, item.destination)}
                        onPress={navigateTo}
                    />
                ))}
            </View>

            <View style={styles.footer}>
                {FOOTER_NAV_ITEMS.map((item) => (
                    <DrawerItem
                        key={item.destination}
                        item={item}
                        isActive={isNavigationDestinationActive(pathname, item.destination)}
                        onPress={navigateTo}
                    />
                ))}
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Sign out"
                    onPress={signOut}
                    style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]}
                    testID="drawer-sign-out"
                >
                    <Text style={styles.icon}>↩</Text>
                    <Text style={styles.itemLabel}>Sign Out</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Collapse navigation drawer"
                    onPress={collapseDrawer}
                    style={({ pressed }) => [styles.collapseButton, pressed && styles.drawerItemPressed]}
                    testID="drawer-collapse"
                >
                    <Text style={styles.collapseIcon}>◀</Text>
                    <Text style={styles.collapseLabel}>Collapse</Text>
                </Pressable>
            </View>
        </View>
    );
}

/**
 * Expanded drawer item with icon and route label.
 */
function DrawerItem({
    item,
    isActive,
    onPress,
}: DrawerItemProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.label}`}
            accessibilityState={{ selected: isActive }}
            onPress={() => onPress(item.destination)}
            style={({ pressed }) => [
                styles.drawerItem,
                (pressed || isActive) && styles.drawerItemPressed,
            ]}
            testID={`drawer-item-${item.destination.replace('/', '')}`}
        >
            <Text style={[styles.icon, isActive && styles.iconActive]}>{item.icon}</Text>
            <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>{item.label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.rail.background,
        borderRightWidth: 1,
        borderRightColor: fantasyTokens.rail.borderStrong,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.rail.border,
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        borderWidth: 1.5,
        borderColor: 'rgba(201,146,42,0.45)',
        backgroundColor: '#3d1a0a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 17,
    },
    characterMeta: {
        flex: 1,
    },
    characterName: {
        color: fantasyTokens.colors.parchment,
        fontFamily: 'serif',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    characterSubline: {
        color: fantasyTokens.colors.gold,
        fontFamily: 'serif',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 1,
    },
    navSection: {
        flex: 1,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.sm,
    },
    sectionLabel: {
        fontFamily: 'serif',
        fontSize: 8,
        textTransform: 'uppercase',
        letterSpacing: 2.5,
        color: 'rgba(201,146,42,0.28)',
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.sm,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.rail.border,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.md,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 10,
    },
    drawerItemPressed: {
        backgroundColor: fantasyTokens.rail.pressed,
    },
    icon: {
        width: 20,
        textAlign: 'center',
        fontSize: 14,
        color: fantasyTokens.rail.icon,
    },
    iconActive: {
        color: fantasyTokens.rail.iconActive,
    },
    itemLabel: {
        color: fantasyTokens.rail.label,
        fontFamily: 'serif',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    itemLabelActive: {
        color: fantasyTokens.rail.labelActive,
    },
    collapseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderRadius: 10,
        marginTop: 2,
    },
    collapseIcon: {
        width: 20,
        textAlign: 'center',
        fontSize: 11,
        color: fantasyTokens.rail.muted,
    },
    collapseLabel: {
        color: fantasyTokens.rail.muted,
        fontFamily: 'serif',
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});
