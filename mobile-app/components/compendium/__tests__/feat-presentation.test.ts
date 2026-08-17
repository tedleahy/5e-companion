import { featDescriptionParts } from '@/components/compendium/feat-presentation';

describe('featDescriptionParts', () => {
    it('splits a lead paragraph from bullet benefits', () => {
        const parts = featDescriptionParts([
            'You gain the following benefits:',
            '- You have advantage on attack rolls.',
            '- You can pin a creature.',
        ]);

        expect(parts.lead).toBe('You gain the following benefits:');
        expect(parts.supporting).toEqual([]);
        expect(parts.benefits).toEqual([
            'You have advantage on attack rolls.',
            'You can pin a creature.',
        ]);
    });

    it('splits embedded newlines and drops blank lines', () => {
        const parts = featDescriptionParts(['Lead line.\n\n- A benefit.\nTrailing prose.']);

        expect(parts.lead).toBe('Lead line.');
        expect(parts.supporting).toEqual(['Trailing prose.']);
        expect(parts.benefits).toEqual(['A benefit.']);
    });

    it('keeps a later paragraph that repeats the lead verbatim', () => {
        const repeated = 'You are hardy.';
        const parts = featDescriptionParts([repeated, repeated]);

        expect(parts.lead).toBe(repeated);
        expect(parts.supporting).toEqual([repeated]);
    });

    it('handles a description that is only bullets, or empty', () => {
        const onlyBullets = featDescriptionParts(['- Just a benefit.']);
        expect(onlyBullets.lead).toBe('');
        expect(onlyBullets.benefits).toEqual(['Just a benefit.']);

        const empty = featDescriptionParts([]);
        expect(empty).toEqual({ lead: '', supporting: [], benefits: [] });
    });
});
