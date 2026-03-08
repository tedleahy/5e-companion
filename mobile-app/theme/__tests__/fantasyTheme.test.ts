import { buildFantasyTheme, fantasyTokens } from '../fantasyTheme';

describe('buildFantasyTheme', () => {
    it('returns a theme with fantasy colour overrides', () => {
        const theme = buildFantasyTheme('dark');

        expect(theme.colors.primary).toBe(fantasyTokens.colors.crimson);
        expect(theme.colors.secondary).toBe(fantasyTokens.colors.gold);
        expect(theme.colors.background).toBe(fantasyTokens.colors.night);
        expect(theme.colors.surface).toBe(fantasyTokens.colors.parchmentDeep);
    });

    it('uses dark base when colorScheme is "dark"', () => {
        const theme = buildFantasyTheme('dark');
        // MD3DarkTheme has mode 'adaptive' by default
        expect(theme.dark).toBe(true);
    });

    it('uses light base when colorScheme is "light"', () => {
        const theme = buildFantasyTheme('light');
        expect(theme.dark).toBe(false);
    });

    it('uses light base when colorScheme is null', () => {
        const theme = buildFantasyTheme(null);
        expect(theme.dark).toBe(false);
    });

    it('uses light base when colorScheme is undefined', () => {
        const theme = buildFantasyTheme(undefined);
        expect(theme.dark).toBe(false);
    });
});

describe('fantasyTokens', () => {
    it('has expected colour tokens', () => {
        expect(fantasyTokens.colors.parchment).toBe('#f6e9cf');
        expect(fantasyTokens.colors.night).toBe('#1f1711');
        expect(fantasyTokens.colors.crimson).toBe('#7b1e1e');
        expect(fantasyTokens.colors.gold).toBe('#c4a470');
    });

    it('has spacing values', () => {
        expect(fantasyTokens.spacing.xs).toBe(4);
        expect(fantasyTokens.spacing.sm).toBe(8);
        expect(fantasyTokens.spacing.md).toBe(16);
    });

    it('has responsive breakpoints', () => {
        expect(fantasyTokens.breakpoints.tablet).toBe(768);
    });
});
