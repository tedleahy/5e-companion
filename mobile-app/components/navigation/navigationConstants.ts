/**
 * Route destinations used by the rail and expanded drawer navigation.
 */
export const NAV_DESTINATIONS = {
    characters: '/characters',
    spells: '/spells',
    settings: '/settings',
} as const;

/**
 * Union type of all supported rail navigation destinations.
 */
export type NavigationDestination = (typeof NAV_DESTINATIONS)[keyof typeof NAV_DESTINATIONS];

/**
 * Route names used by drawer screens in Expo Router.
 */
export const DRAWER_SCREEN_NAMES = {
    characterSheet: 'character-sheet',
    spells: 'spells',
    settings: 'settings',
} as const;

/**
 * Drawer screen config used by the `(rail)` route layout.
 */
export type DrawerScreenConfig = {
    name: (typeof DRAWER_SCREEN_NAMES)[keyof typeof DRAWER_SCREEN_NAMES];
    title: string;
};

/**
 * Shared drawer screen definitions to avoid route/title duplication.
 */
export const DRAWER_SCREENS: DrawerScreenConfig[] = [
    { name: DRAWER_SCREEN_NAMES.characterSheet, title: 'Character Sheet' },
    { name: DRAWER_SCREEN_NAMES.spells, title: 'All Spells' },
    { name: DRAWER_SCREEN_NAMES.settings, title: 'Settings' },
];

/**
 * Shared metadata for navigation items rendered in the rail and drawer.
 */
export type NavigationItem = {
    destination: NavigationDestination;
    label: string;
    icon: string;
    collapsedAccessibilityLabel: string;
};

/**
 * Primary library destinations rendered in both rail and drawer.
 */
export const LIBRARY_NAV_ITEMS: NavigationItem[] = [
    {
        destination: NAV_DESTINATIONS.characters,
        label: 'Characters',
        icon: '👤',
        collapsedAccessibilityLabel: 'Open characters',
    },
    {
        destination: NAV_DESTINATIONS.spells,
        label: 'All Spells',
        icon: '📖',
        collapsedAccessibilityLabel: 'Open all spells',
    },
];

/**
 * Footer destinations rendered in both rail and drawer.
 */
export const FOOTER_NAV_ITEMS: NavigationItem[] = [
    {
        destination: NAV_DESTINATIONS.settings,
        label: 'Settings',
        icon: '⚙',
        collapsedAccessibilityLabel: 'Open settings',
    },
];

/**
 * Returns `true` when a pathname should mark a destination as active.
 */
export function isNavigationDestinationActive(
    pathname: string,
    destination: NavigationDestination,
): boolean {
    if (destination === NAV_DESTINATIONS.characters) {
        return (
            pathname === destination
            || pathname.startsWith(`${destination}/`)
            || pathname === '/character-sheet'
        );
    }

    if (destination === NAV_DESTINATIONS.spells) {
        return pathname === destination || pathname.startsWith(`${destination}/`);
    }

    return pathname === destination;
}
