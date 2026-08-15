import {
    DRAWER_SCREEN_NAMES,
    DRAWER_SCREENS,
    isNavigationDestinationActive,
    isTopLevelCompendiumCategoryPath,
    LIBRARY_NAV_ITEMS,
    NAV_DESTINATIONS,
    TOP_LEVEL_COMPENDIUM_CATEGORY_PATHS,
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

    it('identifies only top-level Compendium category paths', () => {
        expect(TOP_LEVEL_COMPENDIUM_CATEGORY_PATHS).toEqual([
            '/compendium/classes',
            '/compendium/subclasses',
            '/compendium/spells',
            '/compendium/races',
            '/compendium/subraces',
            '/compendium/backgrounds',
            '/compendium/feats',
            '/compendium/languages',
        ]);
        expect(isTopLevelCompendiumCategoryPath('/compendium/classes')).toBe(true);
        expect(isTopLevelCompendiumCategoryPath('/compendium/subclasses')).toBe(true);
        expect(isTopLevelCompendiumCategoryPath('/compendium/spells')).toBe(true);
        expect(isTopLevelCompendiumCategoryPath('/compendium/races')).toBe(true);
        expect(isTopLevelCompendiumCategoryPath('/compendium/subraces')).toBe(true);
        expect(isTopLevelCompendiumCategoryPath('/compendium/backgrounds')).toBe(true);
        expect(isTopLevelCompendiumCategoryPath('/compendium/feats')).toBe(true);
        expect(isTopLevelCompendiumCategoryPath('/compendium/languages')).toBe(true);
        expect(isTopLevelCompendiumCategoryPath('/compendium')).toBe(false);
        expect(isTopLevelCompendiumCategoryPath('/characters')).toBe(false);
        expect(isTopLevelCompendiumCategoryPath('/compendium/classes/extra')).toBe(false);
    });
});
