import { colors, offsetShadow } from './index';

describe('offsetShadow', () => {
    it('offsets a hard shadow down and right in the given colour token', () => {
        expect(offsetShadow(5, 'accent')).toBe(`5px 5px 0 ${colors.accent}`);
    });
});
