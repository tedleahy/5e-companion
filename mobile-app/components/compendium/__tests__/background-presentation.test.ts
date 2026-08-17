import {
    equipmentLines,
    equipmentMarker,
    proficienciesOfType,
    type Background,
} from '@/components/compendium/background-presentation';

type EquipmentInput = Background['startingEquipment'];

function backgroundWith(startingEquipment: EquipmentInput) {
    return { startingEquipment } as Background;
}

describe('equipmentLines', () => {
    it('renders the shape the seeder emits for an SRD background', () => {
        // backgroundSeedPayload names a background's choice group after its
        // equipment category, producing exactly one row per group.
        const lines = equipmentLines(backgroundWith([
            { name: 'Clothes, common', quantity: 1, choiceGroup: null, choiceCount: null },
            { name: 'Pouch', quantity: 1, choiceGroup: null, choiceCount: null },
            { name: 'Holy Symbols', quantity: 1, choiceGroup: 1, choiceCount: 1 },
        ] as EquipmentInput));

        expect(lines).toEqual([
            { text: '1× Clothes, common' },
            { text: '1× Pouch' },
            { choose: 1, text: '1× Holy Symbols' },
        ]);
    });

    it('joins multi-option choice groups and keeps groups separate', () => {
        const lines = equipmentLines(backgroundWith([
            { name: 'Prayer book', quantity: 1, choiceGroup: 1, choiceCount: 1 },
            { name: 'Prayer wheel', quantity: 2, choiceGroup: 1, choiceCount: 1 },
            { name: 'Incense', quantity: 5, choiceGroup: 2, choiceCount: 2 },
        ] as EquipmentInput));

        expect(lines).toEqual([
            { choose: 1, text: '1× Prayer book or 2× Prayer wheel' },
            { choose: 2, text: '5× Incense' },
        ]);
    });

    it('returns nothing when a background lists no equipment', () => {
        expect(equipmentLines(backgroundWith([] as EquipmentInput))).toEqual([]);
    });
});

describe('equipmentMarker', () => {
    it('marks fixed grants with a diamond and choices with a single prefix', () => {
        expect(equipmentMarker(undefined)).toBe('◆');
        expect(equipmentMarker(1)).toBe('Choose:');
        expect(equipmentMarker(2)).toBe('Choose 2:');
    });
});

describe('proficienciesOfType', () => {
    it('filters by type case-insensitively and returns names', () => {
        const background = {
            proficiencies: [
                { value: 'insight', name: 'Insight', type: 'SKILL', isCustom: false },
                { value: 'lute', name: 'Lute', type: 'tool', isCustom: false },
            ],
        } as Background;

        expect(proficienciesOfType(background, 'SKILL')).toEqual(['Insight']);
        expect(proficienciesOfType(background, 'TOOL')).toEqual(['Lute']);
        expect(proficienciesOfType(background, 'LANGUAGE')).toEqual([]);
    });
});
