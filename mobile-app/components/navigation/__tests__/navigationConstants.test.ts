import {
    DRAWER_SCREEN_NAMES,
    DRAWER_SCREENS,
    isNavigationDestinationActive,
    LIBRARY_NAV_ITEMS,
    NAV_DESTINATIONS,
} from '@/components/navigation/navigationConstants';

describe('navigation constants', () => {
    it('registers one Compendium rail destination for library content', () => {
        expect(NAV_DESTINATIONS.compendium).toBe('/compendium');
        expect(DRAWER_SCREEN_NAMES.compendium).toBe('compendium');
        expect(DRAWER_SCREENS).toContainEqual({ name: 'compendium', title: 'Compendium' });
        expect(LIBRARY_NAV_ITEMS).toContainEqual(expect.objectContaining({
            destination: '/compendium',
            label: 'Compendium',
            icon: '📚',
            collapsedAccessibilityLabel: 'Open compendium',
        }));
        expect(LIBRARY_NAV_ITEMS).toHaveLength(2);
    });

    it('matches every Compendium category without affecting unrelated routes', () => {
        expect(isNavigationDestinationActive('/compendium', NAV_DESTINATIONS.compendium)).toBe(true);
        expect(isNavigationDestinationActive('/compendium/subclasses', NAV_DESTINATIONS.compendium)).toBe(true);
        expect(isNavigationDestinationActive('/compendium/spells', NAV_DESTINATIONS.compendium)).toBe(true);
        expect(isNavigationDestinationActive('/characters', NAV_DESTINATIONS.compendium)).toBe(false);
    });

    it('matches nested routes for ordinary destinations', () => {
        expect(isNavigationDestinationActive('/settings/profile', NAV_DESTINATIONS.settings)).toBe(true);
    });
});
