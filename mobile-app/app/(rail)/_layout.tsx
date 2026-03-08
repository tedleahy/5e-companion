import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions } from 'react-native';
import ExpandedDrawer from '@/components/navigation/ExpandedDrawer';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { DRAWER_SCREEN_NAMES, DRAWER_SCREENS } from '@/components/navigation/navigationConstants';

/**
 * Drawer layout for the app's main rail navigation routes.
 */
export default function RailLayout() {
    const { width } = useWindowDimensions();
    const isTabletLayout = width >= fantasyTokens.breakpoints.tablet;

    return (
        <Drawer
            initialRouteName={DRAWER_SCREEN_NAMES.characters}
            drawerContent={(props) => <ExpandedDrawer {...props} />}
            screenOptions={{
                headerShown: false,
                drawerType: 'front',
                swipeEnabled: true,
                swipeEdgeWidth: isTabletLayout ? fantasyTokens.rail.collapsedWidth : 24,
                drawerStyle: {
                    width: fantasyTokens.rail.expandedWidth,
                    backgroundColor: fantasyTokens.rail.background,
                },
                overlayColor: fantasyTokens.rail.backdrop,
                sceneStyle: {
                    backgroundColor: fantasyTokens.colors.night,
                },
            }}
        >
            {DRAWER_SCREENS.map((screen) => (
                <Drawer.Screen
                    key={screen.name}
                    name={screen.name}
                    options={{ title: screen.title }}
                />
            ))}
            <Drawer.Screen
                name="character/[id]"
                options={{
                    title: 'Character Sheet',
                    drawerItemStyle: { display: 'none' },
                }}
            />
        </Drawer>
    );
}
