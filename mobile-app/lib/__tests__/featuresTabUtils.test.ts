import {
    availableUses,
    deriveProficienciesAndLanguages,
    groupFeatures,
    rechargeLabel,
} from '../featuresTabUtils';

describe('groupFeatures', () => {
    it('groups class, racial, and feat features from source labels', () => {
        const features = [
            {
                id: 'f1',
                name: 'Arcane Recovery',
                source: 'Wizard 1',
                description: 'Recover spell slots.',
            },
            {
                id: 'f2',
                name: 'Darkvision',
                source: 'High Elf',
                description: 'See in darkness.',
            },
            {
                id: 'f3',
                name: 'War Caster',
                source: 'Feat',
                description: 'Concentration benefits.',
            },
        ];

        const grouped = groupFeatures(features, 'Wizard', 'High Elf');

        expect(grouped.classFeatures.map((feature) => feature.name)).toEqual(['Arcane Recovery']);
        expect(grouped.racialTraits.map((feature) => feature.name)).toEqual(['Darkvision']);
        expect(grouped.feats.map((feature) => feature.name)).toEqual(['War Caster']);
    });
});

describe('rechargeLabel', () => {
    it('maps known recharge values to display labels', () => {
        expect(rechargeLabel('short')).toBe('Short Rest');
        expect(rechargeLabel('long')).toBe('Long Rest');
        expect(rechargeLabel('dawn')).toBe('At Dawn');
    });

    it('passes unknown labels through unchanged', () => {
        expect(rechargeLabel('custom')).toBe('custom');
    });
});

describe('availableUses', () => {
    it('returns bounded remaining uses when both values exist', () => {
        expect(availableUses({ id: 'f1', name: 'A', source: 'S', description: 'D', usesMax: 3, usesRemaining: 2 })).toBe(2);
        expect(availableUses({ id: 'f2', name: 'A', source: 'S', description: 'D', usesMax: 3, usesRemaining: 9 })).toBe(3);
        expect(availableUses({ id: 'f3', name: 'A', source: 'S', description: 'D', usesMax: 3, usesRemaining: -1 })).toBe(0);
    });

    it('defaults remaining uses to max when remaining is missing', () => {
        expect(availableUses({ id: 'f4', name: 'A', source: 'S', description: 'D', usesMax: 2 })).toBe(2);
    });
});

describe('deriveProficienciesAndLanguages', () => {
    it('prefers trait metadata when present', () => {
        const result = deriveProficienciesAndLanguages(
            {
                personality: 'p',
                ideals: 'i',
                bonds: 'b',
                flaws: 'f',
                armorProficiencies: ['Light Armor'],
                weaponProficiencies: ['Daggers'],
                toolProficiencies: ['Alchemist Supplies'],
                languages: ['Common', 'Elvish'],
            },
        );

        expect(result.armor).toEqual(['Light Armor']);
        expect(result.weapons).toContain('Daggers');
        expect(result.tools).toEqual(['Alchemist Supplies']);
        expect(result.languages).toEqual(['Common', 'Elvish']);
    });

    it('returns empty arrays when metadata is missing', () => {
        const result = deriveProficienciesAndLanguages(
            {
                personality: 'p',
                ideals: 'i',
                bonds: 'b',
                flaws: 'f',
            },
        );

        expect(result.armor).toEqual([]);
        expect(result.weapons).toEqual([]);
        expect(result.tools).toEqual([]);
        expect(result.languages).toEqual([]);
    });
});
