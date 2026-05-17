import { describe, expect, mock, test } from 'bun:test';
import type { CorsOptions } from 'cors';
import {
    createCorsOptions,
    createCorsOriginGuard,
    DEVELOPMENT_ALLOWED_ORIGINS,
    normaliseCorsOrigin,
    parseConfiguredCorsOrigins,
    resolveAllowedOrigins,
} from './corsPolicy';

function expectCorsOrigin(
    corsOptions: CorsOptions,
    requestOrigin: string | undefined,
    expectedOrigin: string | false,
): void {
    const originOption = corsOptions.origin;

    if (typeof originOption !== 'function') {
        throw new Error('Expected CORS origin option to be a callback');
    }

    originOption(requestOrigin, (error, origin) => {
        expect(error).toBeNull();
        expect(origin).toBe(expectedOrigin);
    });
}

describe('normaliseCorsOrigin', () => {
    test('normalises configured origins to exact origin strings', () => {
        expect(normaliseCorsOrigin(' https://app.example.com/ ')).toBe('https://app.example.com');
        expect(normaliseCorsOrigin('http://localhost:8081')).toBe('http://localhost:8081');
    });

    test('rejects wildcard origins', () => {
        expect(() => normaliseCorsOrigin('*')).toThrow(
            'CORS_ALLOWED_ORIGINS must list explicit origins, not *',
        );
    });

    test('rejects empty configured origins', () => {
        expect(() => normaliseCorsOrigin('   ')).toThrow(
            'CORS_ALLOWED_ORIGINS contains an empty origin',
        );
    });

    test('rejects origins with path, query, or fragment', () => {
        expect(() => normaliseCorsOrigin('https://app.example.com/graphql')).toThrow(
            'CORS origin must not include a path, query, or fragment: https://app.example.com/graphql',
        );
        expect(() => normaliseCorsOrigin('https://app.example.com?debug=true')).toThrow(
            'CORS origin must not include a path, query, or fragment: https://app.example.com?debug=true',
        );
        expect(() => normaliseCorsOrigin('https://app.example.com#fragment')).toThrow(
            'CORS origin must not include a path, query, or fragment: https://app.example.com#fragment',
        );
    });
});

describe('parseConfiguredCorsOrigins', () => {
    test('parses comma-separated origins', () => {
        expect(
            parseConfiguredCorsOrigins({
                CORS_ALLOWED_ORIGINS: 'https://app.example.com, http://localhost:8081/',
            }),
        ).toEqual(['https://app.example.com', 'http://localhost:8081']);
    });

    test('returns empty list when no origins are configured', () => {
        expect(parseConfiguredCorsOrigins({})).toEqual([]);
    });
});

describe('resolveAllowedOrigins', () => {
    test('uses configured origins when present', () => {
        expect(
            resolveAllowedOrigins({
                CORS_ALLOWED_ORIGINS: 'https://app.example.com',
                NODE_ENV: 'production',
            }),
        ).toEqual(new Set(['https://app.example.com']));
    });

    test('falls back to Expo web origins outside production', () => {
        expect(resolveAllowedOrigins({})).toEqual(new Set(DEVELOPMENT_ALLOWED_ORIGINS));
    });

    test('allows no browser origins by default in production', () => {
        expect(resolveAllowedOrigins({ NODE_ENV: 'production' })).toEqual(new Set());
        expect(resolveAllowedOrigins({ BUN_ENV: 'production' })).toEqual(new Set());
    });
});

describe('createCorsOptions', () => {
    test('reflects allowed browser origins', () => {
        const corsOptions = createCorsOptions(new Set(['https://app.example.com']));

        expectCorsOrigin(corsOptions, 'https://app.example.com', 'https://app.example.com');
    });

    test('does not emit CORS headers for disallowed or origin-less requests', () => {
        const corsOptions = createCorsOptions(new Set(['https://app.example.com']));

        expectCorsOrigin(corsOptions, 'https://evil.example.com', false);
        expectCorsOrigin(corsOptions, undefined, false);
    });
});

describe('createCorsOriginGuard', () => {
    test('passes allowed browser origins through', () => {
        const guard = createCorsOriginGuard(new Set(['https://app.example.com']));
        const next = mock(() => undefined);
        const sendStatus = mock(() => undefined);

        guard(
            { headers: { origin: 'https://app.example.com' } } as Parameters<typeof guard>[0],
            { sendStatus } as unknown as Parameters<typeof guard>[1],
            next,
        );

        expect(sendStatus).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('passes origin-less requests through', () => {
        const guard = createCorsOriginGuard(new Set(['https://app.example.com']));
        const next = mock(() => undefined);
        const sendStatus = mock(() => undefined);

        guard(
            { headers: {} } as Parameters<typeof guard>[0],
            { sendStatus } as unknown as Parameters<typeof guard>[1],
            next,
        );

        expect(sendStatus).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
    });

    test('rejects disallowed browser origins', () => {
        const guard = createCorsOriginGuard(new Set(['https://app.example.com']));
        const next = mock(() => undefined);
        const sendStatus = mock(() => undefined);

        guard(
            { headers: { origin: 'https://evil.example.com' } } as Parameters<typeof guard>[0],
            { sendStatus } as unknown as Parameters<typeof guard>[1],
            next,
        );

        expect(sendStatus).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
