import fs from 'node:fs';
import path from 'node:path';
import globalSetup from './globalSetup';
import {
    E2E_API_URL,
    E2E_TEST_USER,
    E2E_WEB_BASE_URL,
    e2eSupabaseUrl,
} from './env';
import { getSupabaseLocalStack } from './supabaseLocalStack';

type SupabasePasswordSession = {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
    token_type: string;
    user: unknown;
};

type SeedState = {
    userId: string;
    characterId: string;
    characterName: string;
};

type BrowserLocalStorageAuth = {
    kind: 'supabase-browser-local-storage-auth';
    origin: string;
    storageKey: string;
    storageValue: string;
    webBaseUrl: string;
    apiUrl: string;
    supabaseUrl: string;
    characterSheetUrl: string;
    seedState: SeedState;
};

type PlaywrightStorageState = {
    cookies: unknown[];
    origins: Array<{
        origin: string;
        localStorage: Array<{
            name: string;
            value: string;
        }>;
    }>;
};

const AUTH_DIR = path.resolve(import.meta.dirname, '.auth');
const SEED_STATE_PATH = path.resolve(import.meta.dirname, '.seed', 'state.json');
const LOCAL_STORAGE_AUTH_PATH = path.join(AUTH_DIR, 'browser-local-storage.json');
const PLAYWRIGHT_STORAGE_STATE_PATH = path.join(AUTH_DIR, 'user.json');

function resolveSupabaseStorageKey(supabaseUrl: string): string {
    const hostname = new URL(supabaseUrl).hostname;
    const projectRef = hostname.split('.')[0];
    return `sb-${projectRef}-auth-token`;
}

function readSeedState(): SeedState {
    if (!fs.existsSync(SEED_STATE_PATH)) {
        throw new Error(`Missing seeded character state at ${SEED_STATE_PATH}.`);
    }

    return JSON.parse(fs.readFileSync(SEED_STATE_PATH, 'utf8')) as SeedState;
}

async function signInWithPassword(supabaseUrl: string): Promise<SupabasePasswordSession> {
    const { publishableKey } = getSupabaseLocalStack();
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
            apikey: publishableKey,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: E2E_TEST_USER.email,
            password: E2E_TEST_USER.password,
        }),
    });

    if (!response.ok) {
        throw new Error(`Supabase password sign-in failed (${response.status}): ${await response.text()}`);
    }

    const session = await response.json() as SupabasePasswordSession;

    if (!session.access_token || !session.refresh_token || !session.user) {
        throw new Error('Supabase password sign-in response did not include a complete session.');
    }

    return session;
}

function writeAuthArtifacts(payload: BrowserLocalStorageAuth): void {
    fs.mkdirSync(AUTH_DIR, { recursive: true });

    const playwrightState: PlaywrightStorageState = {
        cookies: [],
        origins: [{
            origin: payload.origin,
            localStorage: [{
                name: payload.storageKey,
                value: payload.storageValue,
            }],
        }],
    };

    fs.writeFileSync(LOCAL_STORAGE_AUTH_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    fs.writeFileSync(PLAYWRIGHT_STORAGE_STATE_PATH, `${JSON.stringify(playwrightState, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
    await globalSetup();

    const supabaseUrl = e2eSupabaseUrl();
    const storageKey = resolveSupabaseStorageKey(supabaseUrl);
    const session = await signInWithPassword(supabaseUrl);
    const seedState = readSeedState();
    const characterSheetUrl = `${E2E_WEB_BASE_URL}/character/${seedState.characterId}`;

    const authPayload: BrowserLocalStorageAuth = {
        kind: 'supabase-browser-local-storage-auth',
        origin: E2E_WEB_BASE_URL,
        storageKey,
        storageValue: JSON.stringify(session),
        webBaseUrl: E2E_WEB_BASE_URL,
        apiUrl: E2E_API_URL,
        supabaseUrl,
        characterSheetUrl,
        seedState,
    };

    writeAuthArtifacts(authPayload);

    console.log(JSON.stringify({
        localStorageAuthPath: LOCAL_STORAGE_AUTH_PATH,
        playwrightStorageStatePath: PLAYWRIGHT_STORAGE_STATE_PATH,
        origin: authPayload.origin,
        storageKey: authPayload.storageKey,
        characterSheetUrl: authPayload.characterSheetUrl,
        seedState: authPayload.seedState,
    }, null, 2));
}

await main();
