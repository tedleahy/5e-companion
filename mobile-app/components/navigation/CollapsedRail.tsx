import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fantasyTokens } from '@/theme/fantasyTheme';
import {
    FOOTER_NAV_ITEMS,
    isNavigationDestinationActive,
    LIBRARY_NAV_ITEMS,
    type NavigationItem,
    type NavigationDestination,
} from '@/components/navigation/navigationConstants';

type StripButtonProps = {
    item: NavigationItem;
    isActive: boolean;
};

/**
 * Always-visible collapsed navigation strip shown on the left edge.
 */
export default function CollapsedRail() {
    const navigation = useNavigation();
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    /**
     * Opens the parent drawer navigator.
     */
    function openDrawer() {
        navigation.dispatch(DrawerActions.openDrawer());
    }

    /**
     * Navigates to a route from the collapsed rail.
     */
    function navigateTo(destination: NavigationDestination) {
        router.push(destination);
    }

    return (
        <View
            style={[
                styles.strip,
                {
                    paddingTop: Math.max(insets.top, fantasyTokens.spacing.sm),
                    paddingBottom: Math.max(insets.bottom, fantasyTokens.spacing.sm),
                },
            ]}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open navigation drawer"
                onPress={openDrawer}
                style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
                testID="collapsed-rail-avatar"
            >
                <Text style={styles.avatarEmoji}>🧙</Text>
            </Pressable>

            <View style={styles.separator} />

            {LIBRARY_NAV_ITEMS.map((item) => (
                <StripButton
                    key={item.destination}
                    item={item}
                    isActive={isNavigationDestinationActive(pathname, item.destination)}
                    onPress={navigateTo}
                />
            ))}

            <View style={styles.spacer} />

            {FOOTER_NAV_ITEMS.map((item) => (
                <StripButton
                    key={item.destination}
                    item={item}
                    isActive={isNavigationDestinationActive(pathname, item.destination)}
                    onPress={navigateTo}
                />
            ))}

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Expand navigation drawer"
                onPress={openDrawer}
                style={({ pressed }) => [styles.expandButton, pressed && styles.buttonPressed]}
                testID="collapsed-rail-expand"
            >
                <Text style={styles.expandIcon}>▶</Text>
            </Pressable>
        </View>
    );
}

type StripButtonInternalProps = StripButtonProps & {
    onPress: (destination: NavigationDestination) => void;
};

/**
 * Compact icon button used by the collapsed rail.
 */
function StripButton({
    item,
    isActive,
    onPress,
}: StripButtonInternalProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.collapsedAccessibilityLabel}
            accessibilityState={{ selected: isActive }}
            onPress={() => onPress(item.destination)}
            style={({ pressed }) => [
                styles.button,
                (pressed || isActive) && styles.buttonPressed,
            ]}
            testID={`collapsed-rail-${item.destination.replace('/', '')}`}
        >
            <Text style={[styles.buttonIcon, isActive && styles.buttonIconActive]}>{item.icon}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    strip: {
        width: fantasyTokens.rail.collapsedWidth,
        backgroundColor: fantasyTokens.rail.background,
        borderRightWidth: 1,
        borderRightColor: fantasyTokens.rail.border,
        alignItems: 'center',
    },
    avatar: {
        marginTop: 0,
        marginBottom: fantasyTokens.spacing.sm,
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(201,146,42,0.4)',
        backgroundColor: '#3d1a0a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarPressed: {
        backgroundColor: '#4f2410',
    },
    avatarEmoji: {
        fontSize: 16,
    },
    separator: {
        width: 28,
        height: 1,
        backgroundColor: fantasyTokens.rail.border,
        marginBottom: fantasyTokens.spacing.sm,
    },
    spacer: {
        flex: 1,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 1,
    },
    buttonPressed: {
        backgroundColor: fantasyTokens.rail.pressed,
    },
    buttonIcon: {
        fontSize: 15,
        color: fantasyTokens.rail.icon,
    },
    buttonIconActive: {
        color: fantasyTokens.rail.iconActive,
    },
    expandButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: fantasyTokens.spacing.sm,
        marginBottom: fantasyTokens.spacing.md,
    },
    expandIcon: {
        fontSize: 11,
        color: fantasyTokens.rail.muted,
    },
});
