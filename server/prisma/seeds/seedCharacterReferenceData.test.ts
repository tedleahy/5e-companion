import { describe, expect, test } from 'bun:test';
import { baseClassProgressionLevels } from './classProgressionSeed';
import {
    classMulticlassPrerequisites,
    classMulticlassProficiencyRules,
    classProficiencyChoiceRules,
    flattenProficiencyChoiceOptionIndexes,
} from './classPrerequisiteSeed';

type LevelFixture = Parameters<typeof baseClassProgressionLevels>[0][number];
type ClassFixture = { index: string; multi_classing?: Parameters<typeof classMulticlassProficiencyRules>[0] };

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

describe('classMulticlassProficiencyRules', () => {
    test('derives canonical fixed grants and skill choice groups for all 12 bundled SRD classes', async () => {
        const classes = await Bun.file(new URL('../../srd-json-files/5e-SRD-Classes.json', import.meta.url)).json() as ClassFixture[];
        const classesByIndex = new Map(classes.map((srdClass) => [srdClass.index, srdClass]));

        // Mirrors the SRD multiclassing table (PHB p.164): fixed armor/weapon/tool
        // grants plus, for bard/ranger/rogue, one skill choice and (bard only) one
        // musical-instrument choice. Every other bundled class grants no skill choice.
        const expectations: Record<string, { fixed: string[]; skillChoiceCount: number | null; skillOptionCount: number }> = {
            barbarian: { fixed: ['shields', 'simple-weapons', 'martial-weapons'], skillChoiceCount: null, skillOptionCount: 0 },
            bard: { fixed: ['light-armor'], skillChoiceCount: 1, skillOptionCount: 18 },
            cleric: { fixed: ['light-armor', 'medium-armor', 'shields'], skillChoiceCount: null, skillOptionCount: 0 },
            druid: { fixed: ['light-armor', 'medium-armor', 'shields'], skillChoiceCount: null, skillOptionCount: 0 },
            fighter: { fixed: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'martial-weapons'], skillChoiceCount: null, skillOptionCount: 0 },
            monk: { fixed: ['simple-weapons', 'shortswords'], skillChoiceCount: null, skillOptionCount: 0 },
            paladin: { fixed: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'martial-weapons'], skillChoiceCount: null, skillOptionCount: 0 },
            ranger: { fixed: ['light-armor', 'medium-armor', 'shields', 'simple-weapons', 'martial-weapons'], skillChoiceCount: 1, skillOptionCount: 8 },
            rogue: { fixed: ['light-armor', 'thieves-tools'], skillChoiceCount: 1, skillOptionCount: 11 },
            sorcerer: { fixed: [], skillChoiceCount: null, skillOptionCount: 0 },
            warlock: { fixed: ['light-armor', 'simple-weapons'], skillChoiceCount: null, skillOptionCount: 0 },
            wizard: { fixed: [], skillChoiceCount: null, skillOptionCount: 0 },
        };

        expect(Object.keys(expectations)).toHaveLength(12);

        for (const [classIndex, expected] of Object.entries(expectations)) {
            const srdClass = classesByIndex.get(classIndex);
            expect(srdClass).toBeDefined();

            const rules = classMulticlassProficiencyRules(srdClass?.multi_classing);
            const fixedGrants = rules.filter((rule) => rule.choiceGroup == null).map((rule) => rule.value);
            const skillGroups = new Map<number, typeof rules>();
            for (const rule of rules.filter((rule) => rule.choiceGroup != null)) {
                const group = skillGroups.get(rule.choiceGroup!) ?? [];
                group.push(rule);
                skillGroups.set(rule.choiceGroup!, group);
            }
            const skillChoiceGroup = [...skillGroups.values()].find((group) => (
                group.every((rule) => rule.value.startsWith('skill-'))
            )) ?? null;

            expect(fixedGrants.sort()).toEqual([...expected.fixed].sort());
            expect(skillChoiceGroup?.[0]?.choiceCount ?? null).toBe(expected.skillChoiceCount);
            expect(skillChoiceGroup?.length ?? 0).toBe(expected.skillOptionCount);
        }
    });

    test('assigns bard its skill and musical-instrument choices to independent groups', async () => {
        const classes = await Bun.file(new URL('../../srd-json-files/5e-SRD-Classes.json', import.meta.url)).json() as ClassFixture[];
        const bard = classes.find((candidate) => candidate.index === 'bard');

        const rules = classMulticlassProficiencyRules(bard?.multi_classing);
        const choiceGroupNumbers = new Set(rules.filter((rule) => rule.choiceGroup != null).map((rule) => rule.choiceGroup));

        expect(choiceGroupNumbers).toEqual(new Set([1, 2]));
        expect(rules.filter((rule) => rule.value === 'skill-acrobatics')).toHaveLength(1);
        expect(rules.filter((rule) => rule.value === 'lute')).toHaveLength(1);
    });

    test('returns no rules when multi_classing data is absent', () => {
        expect(classMulticlassProficiencyRules(undefined)).toEqual([]);
    });
});

describe('flattenProficiencyChoiceOptionIndexes / classProficiencyChoiceRules', () => {
    test('flattens nested monk artisan-tool and instrument pools into one STARTING group', async () => {
        const classes = await Bun.file(new URL('../../srd-json-files/5e-SRD-Classes.json', import.meta.url)).json() as Array<{
            index: string;
            proficiency_choices?: Parameters<typeof classProficiencyChoiceRules>[0];
        }>;
        const monk = classes.find((candidate) => candidate.index === 'monk');
        const nestedChoice = monk?.proficiency_choices?.[1];

        expect(nestedChoice).toBeDefined();
        const flatIndexes = flattenProficiencyChoiceOptionIndexes(nestedChoice?.from?.options);
        expect(flatIndexes).toContain('alchemists-supplies');
        expect(flatIndexes).toContain('lute');
        expect(flatIndexes.length).toBeGreaterThanOrEqual(25);

        const rules = classProficiencyChoiceRules(monk?.proficiency_choices, 'STARTING');
        const toolGroup = rules.filter((rule) => rule.choiceGroup === 2);
        expect(toolGroup[0]?.choiceCount).toBe(1);
        expect(toolGroup.map((rule) => rule.value)).toEqual(expect.arrayContaining(['alchemists-supplies', 'lute']));
        expect(toolGroup.every((rule) => rule.grant === 'STARTING')).toBe(true);
    });

    test('keeps bard starting skill and instrument pools as independent groups', async () => {
        const classes = await Bun.file(new URL('../../srd-json-files/5e-SRD-Classes.json', import.meta.url)).json() as Array<{
            index: string;
            proficiency_choices?: Parameters<typeof classProficiencyChoiceRules>[0];
        }>;
        const bard = classes.find((candidate) => candidate.index === 'bard');
        const rules = classProficiencyChoiceRules(bard?.proficiency_choices, 'STARTING');
        const groups = new Set(rules.map((rule) => rule.choiceGroup));

        expect(groups).toEqual(new Set([1, 2]));
        expect(rules.filter((rule) => rule.choiceGroup === 1)[0]?.choiceCount).toBe(3);
        expect(rules.filter((rule) => rule.choiceGroup === 2)[0]?.choiceCount).toBe(3);
        expect(rules.some((rule) => rule.value === 'skill-acrobatics' && rule.choiceGroup === 1)).toBe(true);
        expect(rules.some((rule) => rule.value === 'lute' && rule.choiceGroup === 2)).toBe(true);
    });
});
