import { breakpointForWidth } from './use-breakpoint';

describe('breakpointForWidth', () => {
    it.each([
        [390, 'phone'],
        [719, 'phone'],
        [720, 'tablet'],
        [820, 'tablet'],
        [1023, 'tablet'],
        [1024, 'tabletLandscape'],
        [1180, 'tabletLandscape'],
        [1279, 'tabletLandscape'],
        [1280, 'desktop'],
        [1440, 'desktop'],
    ])('treats %ipx as %s', (width, breakpoint) => {
        expect(breakpointForWidth(width)).toBe(breakpoint);
    });
});
