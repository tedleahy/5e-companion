import {
    DRAWER_SCREEN_NAMES,
    DRAWER_SCREENS,
    isNavigationDestinationActive,
    LIBRARY_NAV_ITEMS,
    NAV_DESTINATIONS,
} from '@/components/navigation/navigationConstants';

describe('navigation constants', () => {
    it('registers the custom subclasses rail destination everywhere navigation consumes it', () => {
        expect(NAV_DESTINATIONS.subclasses).toBe('/subclasses');
        expect(DRAWER_SCREEN_NAMES.subclasses).toBe('subclasses');
        expect(DRAWER_SCREENS).toContainEqual({ name: 'subclasses', title: 'Custom Subclasses' });
        expect(LIBRARY_NAV_ITEMS).toEqual(expect.arrayContaining([
            expect.objectContaining({
                destination: '/subclasses',
                label: 'Subclasses',
                collapsedAccessibilityLabel: 'Open custom subclasses',
            }),
        ]));
    });

    it('matches subclasses active state without affecting unrelated routes', () => {
        expect(isNavigationDestinationActive('/subclasses', NAV_DESTINATIONS.subclasses)).toBe(true);
        expect(isNavigationDestinationActive('/subclasses/draft', NAV_DESTINATIONS.subclasses)).toBe(true);
        expect(isNavigationDestinationActive('/spells', NAV_DESTINATIONS.subclasses)).toBe(false);
    });
});
