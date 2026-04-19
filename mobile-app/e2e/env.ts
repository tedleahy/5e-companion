import { getSupabaseLocalStack } from './supabaseLocalStack';

/**
 * Shared constants for the end-to-end test environment.
 *
 * The Supabase URLs and keys come from `bunx supabase status -o env` at
 * runtime (see `supabaseLocalStack.ts`) rather than being hardcoded in this
 * repo. The values are deterministic local-stack defaults, so the behaviour
 * is identical across machines — they're just not committed.
 */

/** GraphQL server port used during e2e runs (dev server keeps port 4000). */
export const E2E_SERVER_PORT = 4010;

/** Full GraphQL endpoint the mobile app points at during e2e runs. */
export const E2E_API_URL = `http://127.0.0.1:${E2E_SERVER_PORT}/`;

/** Expo web port (matches the default `expo start --web` port). */
export const E2E_WEB_PORT = 8081;

/** URL the Playwright browser navigates to. */
export const E2E_WEB_BASE_URL = `http://127.0.0.1:${E2E_WEB_PORT}`;

/** Credentials for the single e2e test user. Created idempotently in globalSetup. */
export const E2E_TEST_USER = {
    email: 'e2e-test@dnd-companion.test',
    password: 'e2e-test-password-123',
} as const;

/**
 * Returns the env vars that every e2e-aware child process (backend, expo web,
 * setup scripts) should inherit so they all point at the same local stack.
 *
 * Note: this reads from `supabase status` synchronously, so the local stack
 * must already be running by the time Playwright loads `playwright.config.ts`.
 */
export function e2eEnv(): NodeJS.ProcessEnv {
    const stack = getSupabaseLocalStack();
    return {
        ...process.env,
        DATABASE_URL: stack.dbUrl,
        SUPABASE_URL: stack.apiUrl,
        SUPABASE_SERVICE_ROLE_KEY: stack.secretKey,
        EXPO_PUBLIC_SUPABASE_URL: stack.apiUrl,
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: stack.publishableKey,
        EXPO_PUBLIC_API_URL: E2E_API_URL,
        PORT: String(E2E_SERVER_PORT),
    };
}

/**
 * Contents written to `mobile-app/.env.development.local` during e2e runs.
 * Expo's env bundler reads `.env*` files directly into the generated bundle and
 * does not honour shell env overrides, so the only reliable way to point the
 * app at the local Supabase stack is to write a dev-local env file that Expo
 * loads with higher priority than the developer's regular `.env`.
 */
export function e2eDevLocalEnvFileContents(): string {
    const stack = getSupabaseLocalStack();
    return [
        `EXPO_PUBLIC_SUPABASE_URL=${stack.apiUrl}`,
        `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${stack.publishableKey}`,
        `EXPO_PUBLIC_API_URL=${E2E_API_URL}`,
        '',
    ].join('\n');
}

/**
 * Convenience accessor for the Supabase API URL. Exposed for assertion helpers
 * that need to display it in error messages without pulling in the full stack.
 */
export function e2eSupabaseUrl(): string {
    return getSupabaseLocalStack().apiUrl;
}
