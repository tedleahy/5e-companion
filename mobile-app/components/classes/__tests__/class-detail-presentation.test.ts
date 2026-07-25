import {
    formatGroupedChoiceRules,
    formatGroupedEquipmentLines,
    formatGroupedProficiencyLines,
    groupChoiceRules,
} from '@/components/classes/class-detail-presentation';

describe('class-detail-presentation', () => {
    test('groups fixed grants separately from pick-N pools', () => {
        const grouped = groupChoiceRules([
            { label: 'Light Armor', choiceGroup: null, choiceCount: null },
            { label: 'Athletics', choiceGroup: 1, choiceCount: 2 },
            { label: 'Acrobatics', choiceGroup: 1, choiceCount: 2 },
            { label: 'Stealth', choiceGroup: 1, choiceCount: 2 },
            { label: 'Shields', choiceGroup: null, choiceCount: null },
        ]);

        expect(grouped).toEqual([
            { kind: 'fixed', label: 'Light Armor' },
            { kind: 'fixed', label: 'Shields' },
            {
                kind: 'choice',
                choiceGroup: 1,
                choiceCount: 2,
                labels: ['Athletics', 'Acrobatics', 'Stealth'],
            },
        ]);
        expect(formatGroupedChoiceRules([
            { label: 'Light Armor', choiceGroup: null, choiceCount: null },
            { label: 'Athletics', choiceGroup: 1, choiceCount: 2 },
            { label: 'Acrobatics', choiceGroup: 1, choiceCount: 2 },
        ])).toEqual([
            'Light Armor',
            'Choose 2 of Athletics, Acrobatics',
        ]);
    });

    test('formats proficiency lines by grant with Choose N of labels', () => {
        expect(formatGroupedProficiencyLines([
            {
                name: 'Athletics',
                grant: 'STARTING',
                value: 'skill-athletics',
                choiceGroup: null,
                choiceCount: null,
            },
            {
                name: 'Acrobatics',
                grant: 'STARTING',
                value: 'skill-acrobatics',
                choiceGroup: 1,
                choiceCount: 1,
            },
            {
                name: 'Stealth',
                grant: 'STARTING',
                value: 'skill-stealth',
                choiceGroup: 1,
                choiceCount: 1,
            },
            {
                name: 'Light Armor',
                grant: 'MULTICLASS',
                value: 'armor-light',
                choiceGroup: null,
                choiceCount: null,
            },
        ]).map((line) => line.text)).toEqual([
            'Starting · Athletics',
            'Starting · Choose 1 of Acrobatics, Stealth',
            'Multiclass · Light Armor',
        ]);
    });

    test('formats equipment fixed entries and pick-N pools', () => {
        expect(formatGroupedEquipmentLines([
            { name: 'Longsword', quantity: 1, choiceGroup: null, choiceCount: null },
            { name: 'Mace', quantity: 1, choiceGroup: 2, choiceCount: 1 },
            { name: 'Warhammer', quantity: 1, choiceGroup: 2, choiceCount: 1 },
        ]).map((line) => line.text)).toEqual([
            '1× Longsword',
            'Choose 1 of 1× Mace, 1× Warhammer',
        ]);
    });
});
