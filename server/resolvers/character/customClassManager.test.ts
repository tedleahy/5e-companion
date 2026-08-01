import { describe, expect, test } from 'bun:test';
import { Prisma } from '@prisma/client';
import type { ManagedCustomClassInput } from '../../generated/graphql';
import './loadTestEnv';
import {
    ACTIVE_CUSTOM_CLASS_NAME_INDEX,
    assertGroupedChoiceInvariants,
    assertLockedFeatureMembership,
    assertValidPactMagicSlots,
    canonicaliseMechanicsValue,
    normaliseClassInput,
    proficiencyReferenceWhere,
    sortByCanonicalForm,
    translateActiveCustomClassNameConflict,
} from './customClassManager';
import {
    ACTIVE_CUSTOM_SUBCLASS_NAME_INDEX,
    translateActiveCustomSubclassNameConflict,
} from './customSubclassManager';

function validInput(): ManagedCustomClassInput {
    return {
        name: 'Warden',
        emoji: '🛡️',
        description: 'A stalwart custom class.',
        hitDie: 10,
        primaryAbilityIndexes: ['str'],
        savingThrowIndexes: ['str', 'con'],
        multiclassPrerequisites: [{ abilityIndex: 'str', minimum: 13, group: 1 }],
        proficiencies: [],
        equipment: [],
        spellcastingMode: 'NONE',
        progression: Array.from({ length: 20 }, (_, index) => ({
            level: index + 1,
            abilityScoreImprovement: [4, 8, 12, 16, 19].includes(index + 1),
            spellSlots: Array(9).fill(0),
            displayValues: [],
        })),
        features: [{ name: 'Vigilance', description: 'Remain alert.', level: 1 }],
        spellIds: [],
        addSpellcastingAbility: false,
    };
}

describe('custom class input validation', () => {
    test('normalises a complete level 1–20 definition', () => {
        const result = normaliseClassInput(validInput());
        expect(result.name).toBe('Warden');
        expect(result.emoji).toBe('🛡️');
        expect(result.levels).toHaveLength(20);
        expect(result.features[0]).toMatchObject({ name: 'Vigilance', level: 1 });
    });

    test('rejects an empty emoji', () => {
        const input = validInput();
        input.emoji = '   ';
        expect(() => normaliseClassInput(input)).toThrow('emoji');
    });

    test('rejects missing progression levels', () => {
        const input = validInput();
        input.progression = input.progression.slice(0, 19);
        expect(() => normaliseClassInput(input)).toThrow('each class level from 1 through 20');
    });

    test('rejects spell progression on a non-spellcasting class', () => {
        const input = validInput();
        input.progression[0]!.spellSlots[0] = 2;
        expect(() => normaliseClassInput(input)).toThrow('non-spellcasting class');
    });

    test('rejects a pact magic level with more than one populated spell-slot level', () => {
        const input = validInput();
        input.spellcastingMode = 'PACT_MAGIC';
        input.spellcastingAbility = 'cha';
        input.progression[0]!.spellSlots[0] = 1;
        input.progression[0]!.spellSlots[1] = 1;
        expect(() => normaliseClassInput(input)).toThrow('single spell-slot level');
    });

    test('accepts a pact magic level with a single populated spell-slot level', () => {
        const input = validInput();
        input.spellcastingMode = 'PACT_MAGIC';
        input.spellcastingAbility = 'cha';
        input.progression[0]!.spellSlots[1] = 2;
        expect(() => normaliseClassInput(input)).not.toThrow();
    });

    test('normalises the prepared-spell modifier as a class-wide caster setting', () => {
        const caster = validInput();
        caster.spellcastingMode = 'STANDARD';
        caster.spellcastingAbility = 'wis';
        caster.addSpellcastingAbility = true;
        expect(normaliseClassInput(caster).addSpellcastingAbility).toBe(true);

        const nonCaster = validInput();
        nonCaster.addSpellcastingAbility = true;
        expect(normaliseClassInput(nonCaster).addSpellcastingAbility).toBe(false);
    });

    test('rejects duplicate proficiency rules with a domain error', () => {
        const input = validInput();
        input.proficiencies = [
            { value: 'light-armor', grant: 'STARTING', choiceGroup: null, choiceCount: null },
            { value: 'light-armor', grant: 'STARTING', choiceGroup: null, choiceCount: null },
        ];
        expect(() => normaliseClassInput(input)).toThrow('Duplicate proficiency rules are not allowed.');
    });

    test('rejects proficiency choice groups with inconsistent counts', () => {
        const input = validInput();
        input.proficiencies = [
            { value: 'skill-athletics', grant: 'STARTING', choiceGroup: 1, choiceCount: 1 },
            { value: 'skill-acrobatics', grant: 'STARTING', choiceGroup: 1, choiceCount: 2 },
        ];
        expect(() => normaliseClassInput(input)).toThrow('inconsistent choice counts');
    });

    test('rejects proficiency choice groups that request more picks than options', () => {
        const input = validInput();
        input.proficiencies = [
            { value: 'skill-athletics', grant: 'STARTING', choiceGroup: 1, choiceCount: 2 },
        ];
        expect(() => normaliseClassInput(input)).toThrow('requests 2 picks from 1 options');
    });

    test('rejects equipment with a negative choice group', () => {
        const input = validInput();
        input.equipment = [
            { name: 'Longsword', quantity: 1, choiceGroup: -1, choiceCount: 1 },
            { name: 'Battleaxe', quantity: 1, choiceGroup: -1, choiceCount: 1 },
        ];
        expect(() => normaliseClassInput(input)).toThrow('positive integers');
    });

    test('rejects equipment choice groups that request more picks than options', () => {
        const input = validInput();
        input.equipment = [
            { name: 'Longsword', quantity: 1, choiceGroup: 1, choiceCount: 2 },
        ];
        expect(() => normaliseClassInput(input)).toThrow('requests 2 picks from 1 options');
    });

    test('rejects oversized name, description, equipment, feature, and spell payloads', () => {
        const longName = validInput();
        longName.name = 'A'.repeat(101);
        expect(() => normaliseClassInput(longName)).toThrow('Name must be 100 characters or fewer.');

        const longDescription = validInput();
        longDescription.description = 'A'.repeat(10001);
        expect(() => normaliseClassInput(longDescription)).toThrow('Description must be 10000 characters or fewer.');

        const tooMuchEquipment = validInput();
        tooMuchEquipment.equipment = Array.from({ length: 41 }, (_, index) => ({
            name: `Item ${index}`,
            quantity: 1,
            choiceGroup: null,
            choiceCount: null,
        }));
        expect(() => normaliseClassInput(tooMuchEquipment)).toThrow('Starting equipment is limited to 40 entries.');

        const longEquipmentName = validInput();
        longEquipmentName.equipment = [{ name: 'A'.repeat(101), quantity: 1, choiceGroup: null, choiceCount: null }];
        expect(() => normaliseClassInput(longEquipmentName)).toThrow('Equipment names must be 100 characters or fewer.');

        const tooManyFeatures = validInput();
        tooManyFeatures.features = Array.from({ length: 41 }, (_, index) => ({
            name: `Feature ${index}`,
            description: 'Rules.',
            level: 1,
        }));
        expect(() => normaliseClassInput(tooManyFeatures)).toThrow('Class features are limited to 40.');

        const longFeature = validInput();
        longFeature.features = [{ name: 'A'.repeat(101), description: 'Rules.', level: 1 }];
        expect(() => normaliseClassInput(longFeature)).toThrow('Feature 1 name must be 100 characters or fewer.');

        const tooManySpells = validInput();
        tooManySpells.spellIds = Array.from({ length: 101 }, (_, index) => `spell-${index}`);
        expect(() => normaliseClassInput(tooManySpells)).toThrow('Class spell list is limited to 100 spells.');
    });
});

describe('grouped choice and pact validators', () => {
    test('accepts a coherent pick-N proficiency group', () => {
        expect(() => assertGroupedChoiceInvariants([
            { choiceGroup: 1, choiceCount: 2, optionKey: 'a' },
            { choiceGroup: 1, choiceCount: 2, optionKey: 'b' },
            { choiceGroup: 1, choiceCount: 2, optionKey: 'c' },
        ], 'class proficiency definition')).not.toThrow();
    });

    test('rejects duplicate options inside one choice group', () => {
        expect(() => assertGroupedChoiceInvariants([
            { choiceGroup: 1, choiceCount: 1, optionKey: 'lute' },
            { choiceGroup: 1, choiceCount: 1, optionKey: 'lute' },
        ], 'starting equipment definition')).toThrow('duplicate option');
    });

    test('rejects pact rows with several non-zero slot levels', () => {
        expect(() => assertValidPactMagicSlots([0, 2, 1, 0, 0, 0, 0, 0, 0])).toThrow('single spell-slot level');
    });
});

describe('proficiency reference scoping', () => {
    test('scopes SRD indexes to global rows and custom ids to the caller', () => {
        expect(proficiencyReferenceWhere('user-a', ['light-armor', 'custom-prof-id'])).toEqual({
            OR: [
                { srdIndex: { in: ['light-armor', 'custom-prof-id'] }, ownerUserId: null },
                { id: { in: ['light-armor', 'custom-prof-id'] }, ownerUserId: 'user-a' },
            ],
        });
    });

    test('cross-user custom proficiency ids cannot match via the SRD index branch alone', () => {
        const where = proficiencyReferenceWhere('caller', ['other-user-proficiency-id']);
        const srdBranch = where.OR[0]!;
        const idBranch = where.OR[1]!;
        expect(srdBranch).toEqual({
            srdIndex: { in: ['other-user-proficiency-id'] },
            ownerUserId: null,
        });
        expect(idBranch).toEqual({
            id: { in: ['other-user-proficiency-id'] },
            ownerUserId: 'caller',
        });
        expect(idBranch.ownerUserId).not.toBe('other-owner');
    });
});

describe('active custom class name conflicts', () => {
    test('translates a partial-index P2002 without modelName into a domain error', () => {
        const error = new Prisma.PrismaClientKnownRequestError(
            `Unique constraint failed on the constraint: \`${ACTIVE_CUSTOM_CLASS_NAME_INDEX}\``,
            {
                code: 'P2002',
                clientVersion: 'test',
                meta: { target: ACTIVE_CUSTOM_CLASS_NAME_INDEX },
            },
        );
        expect(error.meta?.modelName).toBeUndefined();
        expect(() => translateActiveCustomClassNameConflict(error)).toThrow(
            'An active custom class with this name already exists.',
        );
    });

    test('translates when the index name appears only in the P2002 message', () => {
        const error = new Prisma.PrismaClientKnownRequestError(
            `Unique constraint failed on the constraint: ${ACTIVE_CUSTOM_CLASS_NAME_INDEX}`,
            {
                code: 'P2002',
                clientVersion: 'test',
            },
        );
        expect(() => translateActiveCustomClassNameConflict(error)).toThrow(
            'An active custom class with this name already exists.',
        );
    });

    test('rethrows unrelated unique violations unchanged', () => {
        const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'test',
            meta: { target: ['classId', 'proficiencyId', 'grant'] },
        });
        expect(() => translateActiveCustomClassNameConflict(error)).toThrow(error);
    });
});

describe('active custom subclass name conflicts', () => {
    test('translates a partial-index P2002 into a domain error', () => {
        const error = new Prisma.PrismaClientKnownRequestError(
            `Unique constraint failed on the constraint: \`${ACTIVE_CUSTOM_SUBCLASS_NAME_INDEX}\``,
            {
                code: 'P2002',
                clientVersion: 'test',
                meta: { target: ACTIVE_CUSTOM_SUBCLASS_NAME_INDEX },
            },
        );
        expect(() => translateActiveCustomSubclassNameConflict(error, 'Circle of Ash', 'Druid')).toThrow(
            'You already have a custom subclass named "Circle of Ash" for Druid.',
        );
    });

    test('rethrows unrelated unique violations unchanged', () => {
        const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
            code: 'P2002',
            clientVersion: 'test',
            meta: { target: ['srdIndex'] },
        });
        expect(() => translateActiveCustomSubclassNameConflict(error, 'Circle of Ash', 'Druid')).toThrow(error);
    });
});

describe('canonical mechanics serialisation', () => {
    test('treats objects with differently ordered keys as equal', () => {
        const insertionOrder = canonicaliseMechanicsValue({ value: 'shield', grant: 'STARTING', choiceGroup: null });
        const jsonbOrder = canonicaliseMechanicsValue({ choiceGroup: null, value: 'shield', grant: 'STARTING' });
        expect(insertionOrder).toBe(jsonbOrder);
    });

    test('treats deeply nested objects with reordered keys as equal', () => {
        const left = canonicaliseMechanicsValue({
            level: 4,
            classSpecific: { rageDamage: '+2', rageCount: '3' },
        });
        const right = canonicaliseMechanicsValue({
            classSpecific: { rageCount: '3', rageDamage: '+2' },
            level: 4,
        });
        expect(left).toBe(right);
    });

    test('still distinguishes objects with genuinely different values', () => {
        const left = canonicaliseMechanicsValue({ value: 'shield', grant: 'STARTING' });
        const right = canonicaliseMechanicsValue({ value: 'shield', grant: 'MULTICLASS' });
        expect(left).not.toBe(right);
    });

    test('sorts a set-like collection into the same order regardless of input order or key order', () => {
        const rows = [
            { grant: 'STARTING', value: 'light-armor' },
            { value: 'simple-weapons', grant: 'STARTING' },
        ];
        const reversedWithReorderedKeys = [
            { grant: 'STARTING', value: 'simple-weapons' },
            { value: 'light-armor', grant: 'STARTING' },
        ];
        expect(sortByCanonicalForm(rows).map(canonicaliseMechanicsValue)).toEqual(
            sortByCanonicalForm(reversedWithReorderedKeys).map(canonicaliseMechanicsValue),
        );
    });

    test('preserves array element order (levels are not treated as set-like)', () => {
        const ordered = canonicaliseMechanicsValue([{ level: 1 }, { level: 2 }]);
        const reordered = canonicaliseMechanicsValue([{ level: 2 }, { level: 1 }]);
        expect(ordered).not.toBe(reordered);
    });
});

describe('locked custom class features', () => {
    test('rejects a newly-added feature without an existing id', () => {
        expect(() => assertLockedFeatureMembership(
            [{ id: 'existing-feature-id' }, { id: null }],
            [{ id: 'existing-feature-id' }],
        )).toThrow('Class feature membership is locked');
    });

    test('accepts the complete existing feature set', () => {
        expect(() => assertLockedFeatureMembership(
            [{ id: 'second-feature-id' }, { id: 'first-feature-id' }],
            [{ id: 'first-feature-id' }, { id: 'second-feature-id' }],
        )).not.toThrow();
    });

    test('rejects duplicate submitted feature ids', () => {
        expect(() => assertLockedFeatureMembership(
            [{ id: 'first-feature-id' }, { id: 'first-feature-id' }, { id: 'second-feature-id' }],
            [{ id: 'first-feature-id' }, { id: 'second-feature-id' }],
        )).toThrow('Class feature membership is locked');
    });
});
