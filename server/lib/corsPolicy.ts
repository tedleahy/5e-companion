import type { CorsOptions } from 'cors';
import type { RequestHandler } from 'express';

/**
 * Browser origins allowed by default during local development.
 */
export const DEVELOPMENT_ALLOWED_ORIGINS = [
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:19006',
    'http://127.0.0.1:19006',
];

type CorsPolicyEnvironment = Pick<
    NodeJS.ProcessEnv,
    'BUN_ENV' | 'CORS_ALLOWED_ORIGINS' | 'NODE_ENV'
>;

/**
 * Returns whether the server is running with production defaults.
 */
export function isProductionEnvironment(environment: CorsPolicyEnvironment = process.env): boolean {
    return environment.NODE_ENV === 'production' || environment.BUN_ENV === 'production';
}

/**
 * Normalises an allowed CORS origin from configuration.
 */
export function normaliseCorsOrigin(rawOrigin: string): string {
    const trimmedOrigin = rawOrigin.trim();

    if (!trimmedOrigin) {
        throw new Error('CORS_ALLOWED_ORIGINS contains an empty origin');
    }

    if (trimmedOrigin === '*') {
        throw new Error('CORS_ALLOWED_ORIGINS must list explicit origins, not *');
    }

    const parsedOrigin = new URL(trimmedOrigin);
    if (parsedOrigin.pathname !== '/' || parsedOrigin.search || parsedOrigin.hash) {
        throw new Error(`CORS origin must not include a path, query, or fragment: ${trimmedOrigin}`);
    }

    return parsedOrigin.origin;
}

/**
 * Parses configured CORS origins from a comma-separated environment variable.
 */
export function parseConfiguredCorsOrigins(
    environment: CorsPolicyEnvironment = process.env,
): string[] {
    const rawOrigins = environment.CORS_ALLOWED_ORIGINS;

    if (!rawOrigins) return [];

    return rawOrigins.split(',').map(normaliseCorsOrigin);
}

/**
 * Resolves the browser origins allowed to call the API.
 */
export function resolveAllowedOrigins(
    environment: CorsPolicyEnvironment = process.env,
): ReadonlySet<string> {
    const configuredOrigins = parseConfiguredCorsOrigins(environment);

    if (configuredOrigins.length > 0) {
        return new Set(configuredOrigins);
    }

    if (isProductionEnvironment(environment)) {
        return new Set();
    }

    return new Set(DEVELOPMENT_ALLOWED_ORIGINS);
}

/**
 * Returns whether a browser origin is in the API allow-list.
 */
function isAllowedOrigin(allowedOrigins: ReadonlySet<string>, origin: string): boolean {
    return allowedOrigins.has(origin);
}

/**
 * Builds the CORS policy for the Express API.
 */
export function createCorsOptions(allowedOrigins: ReadonlySet<string>): CorsOptions {
    return {
        origin(origin, callback) {
            if (!origin) {
                callback(null, false);
                return;
            }

            callback(null, isAllowedOrigin(allowedOrigins, origin) ? origin : false);
        },
    };
}

/**
 * Rejects browser requests from origins that are not in the CORS allow-list.
 */
export function createCorsOriginGuard(allowedOrigins: ReadonlySet<string>): RequestHandler {
    return function corsOriginGuard(req, res, next): void {
        const origin = req.headers.origin;

        if (origin && !isAllowedOrigin(allowedOrigins, origin)) {
            res.sendStatus(403);
            return;
        }

        next();
    };
}
