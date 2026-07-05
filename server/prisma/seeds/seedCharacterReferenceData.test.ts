import { describe, expect, test } from 'bun:test';
import { baseClassProgressionLevels } from './classProgressionSeed';
import { classMulticlassPrerequisites } from './classPrerequisiteSeed';

type LevelFixture = Parameters<typeof baseClassProgressionLevels>[0][number];

describe('baseClassProgressionLevels', () => {
    test('extracts 20 canonical rows for all 12 bundled SRD classes', async () => {
        const levels = await Bun.file(new URL('../../srd-json-files/5e-SRD-Levels.json', import.meta.url)).json() as LevelFixture[];
        const classIndexes = [...new Set(levels.map((level) => level.class.index))];

        expect(classIndexes).toHaveLength(12);
        for (const classIndex of classIndexes) {
            expect(baseClassProgressionLevels(levels, classIndex)).toHaveLength(20);
        }
    });

    test('keeps one base row per level and excludes subclass rows', () => {
        const baseLevels: LevelFixture[] = Array.from({ length: 20 }, (_, index) => ({
            level: index + 1,
            class: { index: 'fighter', name: 'Fighter' },
        }));
        const subclassLevel: LevelFixture = {
            level: 3,
            class: { index: 'fighter', name: 'Fighter' },
            subclass: { index: 'champion', name: 'Champion' },
        };

        const result = baseClassProgressionLevels([...baseLevels, subclassLevel], 'fighter');

        expect(result).toHaveLength(20);
        expect(result.map((level) => level.level)).toEqual(Array.from({ length: 20 }, (_, index) => index + 1));
        expect(result.some((level) => level.subclass != null)).toBe(false);
    });

    test('rejects duplicate or missing base-class levels before insertion', () => {
        const invalidLevels = Array.from({ length: 20 }, (_, index) => ({
            level: index === 19 ? 19 : index + 1,
            class: { index: 'wizard', name: 'Wizard' },
        })) as LevelFixture[];

        expect(() => baseClassProgressionLevels(invalidLevels, 'wizard'))
            .toThrow('one base progression row for each wizard level');
    });
});

describe('classMulticlassPrerequisites', () => {
    test('preserves fighter prerequisite options as one OR group', async () => {
        const classes = await Bun.file(new URL('../../srd-json-files/5e-SRD-Classes.json', import.meta.url)).json() as Array<{ index: string }>;
        const fighter = classes.find((candidate) => candidate.index === 'fighter');

        expect(fighter).toBeDefined();
        expect(classMulticlassPrerequisites((fighter as { multi_classing?: never }).multi_classing)).toEqual([
            { abilityIndex: 'str', minimum: 13, group: 1 },
            { abilityIndex: 'dex', minimum: 13, group: 1 },
        ]);
    });
});
