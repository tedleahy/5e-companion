import { colors, dropShadow, offsetShadow } from './index';

describe('offsetShadow', () => {
    it('offsets a hard shadow down and right in the given color token', () => {
        expect(offsetShadow(5, 'accent')).toBe(`5px 5px 0 ${colors.accent}`);
    });
});

describe('dropShadow', () => {
    it('drops a hard shadow straight down in the given color token', () => {
        expect(dropShadow(5, 'accent')).toBe(`0 5px 0 ${colors.accent}`);
    });
});
