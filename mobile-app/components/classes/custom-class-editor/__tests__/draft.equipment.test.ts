import {
    createDraft,
    equipmentChoiceGroups,
    fixedEquipment,
    nextChoiceGroupId,
    serialiseDraft,
    stageError,
    withEquipmentChoiceGroups,
    withFixedEquipment,
} from '../draft';

describe('custom class equipment draft helpers', () => {
    const draft = {
        ...createDraft(),
        equipment: [
            { key: 'eq-1', name: 'Explorer\'s Pack', quantity: 1, choiceGroup: null, choiceCount: null },
            { key: 'eq-2', name: 'Longsword', quantity: 1, choiceGroup: 1, choiceCount: 1 },
            { key: 'eq-3', name: 'Battleaxe', quantity: 1, choiceGroup: 1, choiceCount: 1 },
            { key: 'eq-4', name: 'Shield', quantity: 1, choiceGroup: null, choiceCount: null },
        ],
    };

    test('fixedEquipment returns only non-choice entries', () => {
        expect(fixedEquipment(draft)).toEqual([
            { key: 'eq-1', name: 'Explorer\'s Pack', quantity: 1 },
            { key: 'eq-4', name: 'Shield', quantity: 1 },
        ]);
    });

    test('equipmentChoiceGroups groups shared choice ids', () => {
        expect(equipmentChoiceGroups(draft)).toEqual([
            {
                choiceGroup: 1,
                choiceCount: 1,
                items: [
                    { key: 'eq-2', name: 'Longsword', quantity: 1 },
                    { key: 'eq-3', name: 'Battleaxe', quantity: 1 },
                ],
            },
        ]);
    });

    test('withFixedEquipment replaces fixed entries and preserves choice groups', () => {
        const next = withFixedEquipment(draft, [
            { key: 'eq-5', name: 'Dungeoneer\'s Pack', quantity: 1 },
            { key: 'eq-6', name: 'Javelin', quantity: 4 },
        ]);
        expect(fixedEquipment({ ...draft, equipment: next })).toEqual([
            { key: 'eq-5', name: 'Dungeoneer\'s Pack', quantity: 1 },
            { key: 'eq-6', name: 'Javelin', quantity: 4 },
        ]);
        expect(equipmentChoiceGroups({ ...draft, equipment: next })).toEqual([
            {
                choiceGroup: 1,
                choiceCount: 1,
                items: [
                    { key: 'eq-2', name: 'Longsword', quantity: 1 },
                    { key: 'eq-3', name: 'Battleaxe', quantity: 1 },
                ],
            },
        ]);
    });

    test('withEquipmentChoiceGroups replaces choice groups and preserves fixed entries', () => {
        const next = withEquipmentChoiceGroups(draft, [
            {
                choiceGroup: 2,
                choiceCount: 1,
                items: [
                    { key: 'eq-7', name: 'Shortbow', quantity: 1 },
                    { key: 'eq-8', name: 'Light Crossbow', quantity: 1 },
                ],
            },
        ]);
        expect(fixedEquipment({ ...draft, equipment: next })).toEqual([
            { key: 'eq-1', name: 'Explorer\'s Pack', quantity: 1 },
            { key: 'eq-4', name: 'Shield', quantity: 1 },
        ]);
        expect(equipmentChoiceGroups({ ...draft, equipment: next })).toEqual([
            {
                choiceGroup: 2,
                choiceCount: 1,
                items: [
                    { key: 'eq-7', name: 'Shortbow', quantity: 1 },
                    { key: 'eq-8', name: 'Light Crossbow', quantity: 1 },
                ],
            },
        ]);
    });

    test('nextChoiceGroupId increments past the highest group', () => {
        expect(nextChoiceGroupId([])).toBe(1);
        expect(
            nextChoiceGroupId([
                { choiceGroup: 1 },
                { choiceGroup: 3 },
            ]),
        ).toBe(4);
    });

    test('serialiseDraft strips equipment client keys', () => {
        expect(serialiseDraft(draft).equipment).toEqual([
            { name: 'Explorer\'s Pack', quantity: 1, choiceGroup: null, choiceCount: null },
            { name: 'Longsword', quantity: 1, choiceGroup: 1, choiceCount: 1 },
            { name: 'Battleaxe', quantity: 1, choiceGroup: 1, choiceCount: 1 },
            { name: 'Shield', quantity: 1, choiceGroup: null, choiceCount: null },
        ]);
    });

    test('serialiseDraft maps draft spells to spellIds', () => {
        expect(
            serialiseDraft({
                ...draft,
                spells: [
                    { id: 'spell-magic-missile', name: 'Magic Missile', level: 1 },
                    { id: 'spell-shield', name: 'Shield', level: 1 },
                ],
            }).spellIds,
        ).toEqual(['spell-magic-missile', 'spell-shield']);
    });

    test('stageError rejects incomplete equipment entries', () => {
        expect(stageError(2, draft)).toBeNull();
        expect(
            stageError(2, {
                ...draft,
                equipment: [{ key: 'eq-empty', name: '', quantity: 1, choiceGroup: null, choiceCount: null }],
            }),
        ).toBe('Every equipment entry needs a name and a quantity of at least 1.');
        expect(
            stageError(2, {
                ...draft,
                equipment: [{ key: 'eq-zero', name: 'Rope', quantity: 0, choiceGroup: null, choiceCount: null }],
            }),
        ).toBe('Every equipment entry needs a name and a quantity of at least 1.');
    });

    test('stageError rejects choice groups with choose count above option count', () => {
        expect(
            stageError(2, {
                ...draft,
                equipment: [
                    { key: 'eq-a', name: 'Longsword', quantity: 1, choiceGroup: 1, choiceCount: 2 },
                ],
            }),
        ).toBe('Each equipment choice group needs enough options for its choose count.');
    });
});
