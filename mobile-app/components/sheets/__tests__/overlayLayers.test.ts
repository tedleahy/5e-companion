import { OVERLAY_LAYER } from '@/components/sheets/overlayLayers';

describe('OVERLAY_LAYER', () => {
    it('stacks nested pickers above parent sheets', () => {
        expect(OVERLAY_LAYER.nestedSheet).toBeGreaterThan(OVERLAY_LAYER.sheet);
        expect(OVERLAY_LAYER.sheet).toBeGreaterThan(OVERLAY_LAYER.base);
    });
});
