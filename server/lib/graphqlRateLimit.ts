import type { Request, RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';

const DEFAULT_GRAPHQL_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_GRAPHQL_RATE_LIMIT_MAX_REQUESTS = 120;

type GraphqlRateLimitEnvironment = Partial<
    Record<'GRAPHQL_RATE_LIMIT_MAX_REQUESTS' | 'GRAPHQL_RATE_LIMIT_WINDOW_MS', string>
>;

export type GraphqlRateLimitConfig = {
    maxRequests: number;
    windowMs: number;
};

/**
 * Parses a positive integer from an optional environment variable.
 */
function parsePositiveInteger(
    environment: GraphqlRateLimitEnvironment,
    name: keyof GraphqlRateLimitEnvironment,
    fallback: number,
): number {
    const rawValue = environment[name];

    if (!rawValue) return fallback;

    const parsedValue = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        throw new Error(`${name} must be a positive integer`);
    }

    return parsedValue;
}

/**
 * Resolves GraphQL rate-limit settings from the environment.
 */
export function resolveGraphqlRateLimitConfig(
    environment: GraphqlRateLimitEnvironment = process.env as GraphqlRateLimitEnvironment,
): GraphqlRateLimitConfig {
    return {
        maxRequests: parsePositiveInteger(
            environment,
            'GRAPHQL_RATE_LIMIT_MAX_REQUESTS',
            DEFAULT_GRAPHQL_RATE_LIMIT_MAX_REQUESTS,
        ),
        windowMs: parsePositiveInteger(
            environment,
            'GRAPHQL_RATE_LIMIT_WINDOW_MS',
            DEFAULT_GRAPHQL_RATE_LIMIT_WINDOW_MS,
        ),
    };
}

/**
 * Returns true when the request should count against the GraphQL limiter.
 */
export function isGraphqlExecutionRequest(req: Request): boolean {
    const method = req.method.toUpperCase();

    return method === 'GET' || method === 'POST';
}

/**
 * Creates a fixed-window limiter for GraphQL execution requests.
 */
export function createGraphqlRateLimiter(
    config: GraphqlRateLimitConfig = resolveGraphqlRateLimitConfig(),
): RequestHandler {
    return rateLimit({
        windowMs: config.windowMs,
        limit: config.maxRequests,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: { error: 'Too many requests. Please try again later.' },
        skip: (req) => !isGraphqlExecutionRequest(req),
    });
}
