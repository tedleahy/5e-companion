import 'dotenv/config';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware, type ExpressContextFunctionArgument } from '@as-integrations/express5';
import { loadFilesSync } from '@graphql-tools/load-files';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { getUserIdFromAuthHeader } from './lib/auth';
import {
    createCorsOptions,
    createCorsOriginGuard,
    resolveAllowedOrigins,
} from './lib/corsPolicy';
import { createGraphqlRateLimiter } from './lib/graphqlRateLimit';
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
 * Starts the HTTP server and rejects if the port cannot be bound.
 */
async function listen(httpServer: http.Server, port: number): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        function handleError(error: Error): void {
            httpServer.off('listening', handleListening);
            reject(error);
        }

        function handleListening(): void {
            httpServer.off('error', handleError);
            resolve();
        }

        httpServer.once('error', handleError);
        httpServer.once('listening', handleListening);
        httpServer.listen(port);
    });
}

/**
 * Creates the Apollo context from the incoming HTTP request.
 */
async function context({ req }: ExpressContextFunctionArgument): Promise<Context> {
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
        availableSubclasses: characterResolvers.availableSubclasses,
        availableBackgrounds: characterResolvers.availableBackgrounds,
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

const app = express();
const httpServer = http.createServer(app);
const isProduction = process.env.NODE_ENV === 'production';
const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    introspection: !isProduction,
    plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        ...(isProduction ? [ApolloServerPluginLandingPageDisabled()] : []),
    ],
});
const port = resolvePort();
const allowedOrigins = resolveAllowedOrigins();
const graphQlRateLimiter = createGraphqlRateLimiter();

app.disable('x-powered-by');
// Caddy is the single reverse-proxy hop in production, so req.ip reflects the forwarded client.
app.set('trust proxy', 1);

await server.start();

app.use(
    '/',
    createCorsOriginGuard(allowedOrigins),
    cors(createCorsOptions(allowedOrigins)),
    graphQlRateLimiter,
    express.json(),
    expressMiddleware(server, { context }),
);

await listen(httpServer, port);

console.log(`GraphQL server listening on port ${port}`);
