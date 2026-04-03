import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import {
    startStandaloneServer,
    type StandaloneServerContextFunctionArgument,
} from '@apollo/server/standalone';
import { loadFilesSync } from '@graphql-tools/load-files';
import { getUserIdFromAuthHeader } from './lib/auth';
import type { Resolvers } from './generated/graphql';
import spellsResolver from './resolvers/spellsResolver';
import spellResolver from './resolvers/spellResolver';
import * as characterResolvers from './resolvers/characterResolvers';

const typeDefs = loadFilesSync('schema.graphql');
const DEFAULT_PORT = 4000;

export type Context = {
    userId: string | null;
};

/**
 * Resolves the HTTP port for the API server.
 */
function resolvePort(): number {
    const rawPort = process.env.PORT;

    if (!rawPort) return DEFAULT_PORT;

    const parsedPort = Number.parseInt(rawPort, 10);
    if (Number.isNaN(parsedPort) || parsedPort <= 0) {
        throw new Error(`Invalid PORT value: ${rawPort}`);
    }

    return parsedPort;
}

/**
 * Ensures required environment variables are present before the server starts.
 */
function validateEnvironment(): void {
    const requiredVariables = ['DATABASE_URL', 'SUPABASE_URL'];
    const missingVariables = requiredVariables.filter((name) => !process.env[name]);

    if (missingVariables.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
    }
}

/**
 * Creates the Apollo context from the incoming HTTP request.
 */
async function context({ req }: StandaloneServerContextFunctionArgument): Promise<Context> {
    try {
        const userId = await getUserIdFromAuthHeader(req.headers.authorization);
        return { userId };
    } catch (error) {
        console.error('Invalid auth token', error);
        return { userId: null };
    }
}

const resolvers: Resolvers = {
    Query: {
        spells: spellsResolver,
        spell: spellResolver,
        character: characterResolvers.character,
        hasCurrentUserCharacters: characterResolvers.hasCurrentUserCharacters,
        currentUserCharacters: characterResolvers.currentUserCharacters,
    },

    Mutation: {
        createCharacter: characterResolvers.createCharacter,
        updateCharacter: characterResolvers.updateCharacter,
        deleteCharacter: characterResolvers.deleteCharacter,
        toggleInspiration: characterResolvers.toggleInspiration,
        saveCharacterSheet: characterResolvers.saveCharacterSheet,

        updateDeathSaves: characterResolvers.updateDeathSaves,
        updateHitDice: characterResolvers.updateHitDice,
        updateSkillProficiencies: characterResolvers.updateSkillProficiencies,
        updateSavingThrowProficiencies: characterResolvers.updateSavingThrowProficiencies,

        learnSpell: characterResolvers.learnSpell,
        forgetSpell: characterResolvers.forgetSpell,
        prepareSpell: characterResolvers.prepareSpell,
        unprepareSpell: characterResolvers.unprepareSpell,
        toggleSpellSlot: characterResolvers.toggleSpellSlot,

        updateInventoryItem: characterResolvers.updateInventoryItem,

        spendHitDie: characterResolvers.spendHitDie,
        shortRest: characterResolvers.shortRest,
        longRest: characterResolvers.longRest,
    },

    Character: {
        level: characterResolvers.characterLevel,
        proficiencyBonus: characterResolvers.characterProficiencyBonus,
        classes: characterResolvers.characterClasses,
        spellcastingProfiles: characterResolvers.characterSpellcastingProfiles,
        stats: characterResolvers.characterStats,
        weapons: characterResolvers.characterWeapons,
        inventory: characterResolvers.characterInventory,
        features: characterResolvers.characterFeatures,
        spellSlots: characterResolvers.characterSpellSlots,
        spellbook: characterResolvers.characterSpellbook,
    },

    CharacterStats: {
        hitDicePools: characterResolvers.characterStatsHitDicePools,
    },
};

validateEnvironment();

const server = new ApolloServer<Context>({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, {
    listen: { port: resolvePort() },
    context,
});

console.log(`GraphQL running at ${url}`);
