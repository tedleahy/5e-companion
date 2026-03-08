import type { ReactNode } from 'react';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CollapsedRail from '@/components/navigation/CollapsedRail';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Props for the rail shell used by main authenticated screens.
 */
type RailScreenShellProps = {
    children: ReactNode;
};

/**
 * Layout wrapper that adapts navigation chrome by screen size.
 *
 * On wider layouts it shows the permanent collapsed rail.
 * On phones it shows a compact hamburger trigger for the drawer.
 */
export default function RailScreenShell({ children }: RailScreenShellProps) {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const showPersistentRail = width >= fantasyTokens.breakpoints.tablet;

    /**
     * Opens the app drawer from the compact hamburger trigger.
     */
    function openDrawer() {
        navigation.dispatch(DrawerActions.openDrawer());
    }

    if (showPersistentRail) {
        return (
            <View style={styles.container}>
                <CollapsedRail />
                <View style={styles.content}>{children}</View>
            </View>
        );
    }

    return (
        <View style={styles.compactContainer}>
            <View style={styles.content}>{children}</View>
            <View style={styles.compactOverlay} pointerEvents="box-none">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open navigation drawer"
                    onPress={openDrawer}
                    style={({ pressed }) => [
                        styles.compactMenuButton,
                        {
                            top: 0,
                            left: insets.left + fantasyTokens.spacing.sm,
                        },
                        pressed && styles.compactMenuButtonPressed,
                    ]}
                    testID="rail-shell-menu"
                >
                    <Text style={styles.compactMenuIcon}>☰</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: fantasyTokens.colors.night,
    },
    compactContainer: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    content: {
        flex: 1,
        minWidth: 0,
    },
    compactOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    compactMenuButton: {
        position: 'absolute',
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: fantasyTokens.rail.background,
        borderWidth: 1,
        borderColor: fantasyTokens.rail.borderStrong,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactMenuButtonPressed: {
        backgroundColor: '#2b1a10',
    },
    compactMenuIcon: {
        color: fantasyTokens.colors.gold,
        fontSize: 17,
        lineHeight: 20,
        marginTop: -1,
    },
});
