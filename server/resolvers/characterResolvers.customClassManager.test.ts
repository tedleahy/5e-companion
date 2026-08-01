import { beforeEach, describe, expect, test } from 'bun:test';
import type { ManagedCustomClassInput } from '../generated/graphql';
import {
    authedCtx,
    classFindFirstMock,
    clearAllCharacterResolverMocks,
    proficiencyFindManyMock,
    resolvers,
    spellFindManyMock,
    unauthedCtx,
} from './characterResolvers.testUtils';

function validInput(): ManagedCustomClassInput {
    return {
        name: 'Warden',
        emoji: '🛡️',
        description: 'A stalwart custom class.',
        hitDie: 10,
        primaryAbilityIndexes: ['str'],
        savingThrowIndexes: ['str', 'con'],
        multiclassPrerequisites: [],
        proficiencies: [{ value: 'light-armor', grant: 'STARTING', choiceGroup: null, choiceCount: null }],
        equipment: [],
        spellcastingMode: 'NONE',
        progression: Array.from({ length: 20 }, (_, index) => ({
            level: index + 1,
            abilityScoreImprovement: false,
            spellSlots: Array(9).fill(0),
            displayValues: [],
        })),
        features: [{ name: 'Vigilance', description: 'Remain alert.', level: 1 }],
        spellIds: [],
        addSpellcastingAbility: false,
    };
}

describe('characterResolvers.customClassManager auth and ownership', () => {
    beforeEach(clearAllCharacterResolverMocks);

    test('createCustomClass requires authentication', async () => {
        await expect(resolvers.createCustomClass({}, { input: validInput() }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('updateCustomClass requires authentication', async () => {
        await expect(resolvers.updateCustomClass({}, { id: 'custom-1', input: validInput() }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('archiveCustomClass requires authentication', async () => {
        await expect(resolvers.archiveCustomClass({}, { id: 'custom-1' }, unauthedCtx))
            .rejects.toThrow('UNAUTHENTICATED');
    });

    test('updateCustomClass rejects classes the caller does not own', async () => {
        classFindFirstMock.mockResolvedValue(null);

        await expect(resolvers.updateCustomClass({}, { id: 'missing', input: validInput() }, authedCtx))
            .rejects.toThrow('Custom class not found.');
    });

    test('createCustomClass rejects inaccessible proficiency references before writing', async () => {
        proficiencyFindManyMock.mockResolvedValue([]);
        spellFindManyMock.mockResolvedValue([]);

        await expect(resolvers.createCustomClass({}, { input: validInput() }, authedCtx))
            .rejects.toThrow('Unknown or inaccessible proficiency.');
    });

    test('createCustomClass rejects duplicate active names for the owner', async () => {
        proficiencyFindManyMock.mockResolvedValue([
            { id: 'prof-1', srdIndex: 'light-armor', ownerUserId: null },
        ]);
        spellFindManyMock.mockResolvedValue([]);
        classFindFirstMock.mockResolvedValue({ id: 'existing-id' });

        await expect(resolvers.createCustomClass({}, { input: validInput() }, authedCtx))
            .rejects.toThrow('An active custom class with this name already exists.');
    });

    test('updateCustomClass blocks mechanics changes when characters use the class', async () => {
        const input = validInput();
        const lockedRow = {
            id: 'custom-1',
            ownerUserId: 'user-abc',
            archivedAt: null,
            name: 'Warden',
            emoji: '🛡️',
            description: ['A stalwart custom class.'],
            hitDie: 10,
            primaryAbilityIndexes: ['str'],
            savingThrowIndexes: ['str', 'con'],
            multiclassPrerequisites: [],
            startingEquipment: [],
            spellcastingMode: 'NONE',
            spellcastingAbility: null,
            addSpellcastingAbility: false,
            sourceBook: 'Custom',
            srdIndex: null,
            proficiencyRules: [],
            progression: input.progression.map((level) => ({
                ...level,
                classSpecific: {},
            })),
            features: [{ id: 'feat-1', name: 'Vigilance', description: ['Remain alert.'], level: 1 }],
            spellList: [],
            _count: { characterClasses: 2 },
        };
        let findFirstCalls = 0;
        classFindFirstMock.mockImplementation(() => {
            findFirstCalls += 1;
            return Promise.resolve(findFirstCalls === 1 ? lockedRow : null);
        });

        const changed = validInput();
        changed.features = [{ id: 'feat-1', name: 'Vigilance', description: 'Remain alert.', level: 1 }];
        changed.hitDie = 12;

        await expect(resolvers.updateCustomClass({}, { id: 'custom-1', input: changed }, authedCtx))
            .rejects.toThrow('Class mechanics are locked because this class is used by a character.');
    });
});
