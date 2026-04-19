import prisma from '../prisma';

/** Fixed slug used to identify the e2e test character so it can be re-seeded idempotently. */
const E2E_CHARACTER_NAME = 'E2E Test Fighter';

/**
 * Creates (or replaces) a Fighter level 4 character owned by the supplied Supabase
 * user id. The character is intentionally minimal — just enough for the Level-Up
 * wizard Scenario 1 acceptance test to open the sheet and toggle edit mode.
 */
export default async function seedE2ECharacter(ownerUserId: string): Promise<{ characterId: string }> {
    const [fighterClass] = await Promise.all([
        prisma.class.findFirst({
            where: { srdIndex: 'fighter' },
        }),
    ]);

    if (!fighterClass) {
        throw new Error('Missing Class reference: fighter. Run the main SRD seed first.');
    }

    // Remove any previously seeded e2e character so the test starts clean.
    await prisma.character.deleteMany({
        where: {
            ownerUserId,
            name: E2E_CHARACTER_NAME,
        },
    });

    const character = await prisma.character.create({
        data: {
            ownerUserId,
            name: E2E_CHARACTER_NAME,
            race: 'Human',
            alignment: 'Neutral Good',
            background: 'Soldier',
            proficiencyBonus: 2,
            inspiration: false,
            ac: 16,
            speed: 30,
            initiative: 2,
            conditions: [],
            notes: 'Seeded for Playwright e2e tests.',
            stats: {
                create: {
                    abilityScores: {
                        strength: 16,
                        dexterity: 14,
                        constitution: 14,
                        intelligence: 10,
                        wisdom: 12,
                        charisma: 8,
                    },
                    hp: { current: 36, max: 36, temp: 0 },
                    deathSaves: { successes: 0, failures: 0 },
                    savingThrowProficiencies: ['strength', 'constitution'],
                    skillProficiencies: {
                        acrobatics: 'none',
                        animalHandling: 'none',
                        arcana: 'none',
                        athletics: 'proficient',
                        deception: 'none',
                        history: 'none',
                        insight: 'none',
                        intimidation: 'proficient',
                        investigation: 'none',
                        medicine: 'none',
                        nature: 'none',
                        perception: 'none',
                        performance: 'none',
                        persuasion: 'none',
                        religion: 'none',
                        sleightOfHand: 'none',
                        stealth: 'none',
                        survival: 'none',
                    },
                    traits: {
                        personality: 'Steady under pressure.',
                        ideals: 'Defend the weak.',
                        bonds: 'Sworn to protect my companions.',
                        flaws: 'Blunt to a fault.',
                        armorProficiencies: ['All armor', 'Shields'],
                        weaponProficiencies: ['Simple weapons', 'Martial weapons'],
                        toolProficiencies: ['None'],
                        languages: ['Common'],
                    },
                    currency: { cp: 0, sp: 0, ep: 0, gp: 25, pp: 0 },
                },
            },
            classes: {
                create: [{
                    classId: fighterClass.id,
                    level: 4,
                    isStartingClass: true,
                }],
            },
            hitDicePools: {
                create: [{
                    classId: fighterClass.id,
                    total: 4,
                    remaining: 4,
                    die: 'd10',
                }],
            },
        },
    });

    return { characterId: character.id };
}
