import { describe, expect, test } from 'bun:test';
import express from 'express';
import type { Request } from 'express';
import http from 'http';
import {
    createGraphqlRateLimiter,
    isGraphqlExecutionRequest,
    resolveGraphqlRateLimitConfig,
} from './graphqlRateLimit';

/**
 * Builds a minimal Express request object for method predicate tests.
 */
function createRequest(method: string): Request {
    return { method } as Request;
}

/**
 * Starts a tiny Express server with the GraphQL limiter installed.
 */
async function startRateLimitedServer(): Promise<{
    close: () => Promise<void>;
    url: string;
}> {
    const app = express();
    const server = http.createServer(app);

    app.use(createGraphqlRateLimiter({ maxRequests: 1, windowMs: 60_000 }));
    app.use((_req, res) => {
        res.json({ ok: true });
    });

    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, resolve);
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
        throw new Error('Expected test server to listen on a local TCP port');
    }

    return {
        close: async () => {
            await new Promise<void>((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });
        },
        url: `http://127.0.0.1:${address.port}`,
    };
}

describe('resolveGraphqlRateLimitConfig', () => {
    test('uses defaults when no environment overrides are configured', () => {
        expect(resolveGraphqlRateLimitConfig({})).toEqual({
            maxRequests: 120,
            windowMs: 60_000,
        });
    });

    test('parses positive integer environment overrides', () => {
        expect(
            resolveGraphqlRateLimitConfig({
                GRAPHQL_RATE_LIMIT_MAX_REQUESTS: '10',
                GRAPHQL_RATE_LIMIT_WINDOW_MS: '5000',
            }),
        ).toEqual({
            maxRequests: 10,
            windowMs: 5000,
        });
    });

    test('rejects invalid environment overrides', () => {
        expect(() =>
            resolveGraphqlRateLimitConfig({
                GRAPHQL_RATE_LIMIT_MAX_REQUESTS: '0',
            }),
        ).toThrow('GRAPHQL_RATE_LIMIT_MAX_REQUESTS must be a positive integer');
        expect(() =>
            resolveGraphqlRateLimitConfig({
                GRAPHQL_RATE_LIMIT_WINDOW_MS: 'nope',
            }),
        ).toThrow('GRAPHQL_RATE_LIMIT_WINDOW_MS must be a positive integer');
    });
});

describe('isGraphqlExecutionRequest', () => {
    test('counts GraphQL execution methods', () => {
        expect(isGraphqlExecutionRequest(createRequest('GET'))).toBe(true);
        expect(isGraphqlExecutionRequest(createRequest('POST'))).toBe(true);
    });

    test('does not count CORS preflight requests', () => {
        expect(isGraphqlExecutionRequest(createRequest('OPTIONS'))).toBe(false);
    });
});

describe('createGraphqlRateLimiter', () => {
    test('creates Express middleware from the resolved config', () => {
        expect(typeof createGraphqlRateLimiter({ maxRequests: 1, windowMs: 1000 })).toBe('function');
    });

    test('returns 429 after the configured request limit is exceeded', async () => {
        const server = await startRateLimitedServer();

        try {
            const accepted = await fetch(server.url, { method: 'POST' });
            const blocked = await fetch(server.url, { method: 'POST' });

            expect(accepted.status).toBe(200);
            expect(blocked.status).toBe(429);
            expect(await blocked.json()).toEqual({
                error: 'Too many requests. Please try again later.',
            });
        } finally {
            await server.close();
        }
    });
});
