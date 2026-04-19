import 'dotenv/config';
import prisma from './prisma';
import seedAbilityScores from './seeds/seedAbilityScores';
import seedRaces from './seeds/seedRaces';
import seedCustomSpells from './seeds/seedCustomSpells';
import seedSpells from './seeds/seedSpells';
import seedCharacterReferenceData from './seeds/seedCharacterReferenceData';
import seedE2ECharacter from './seeds/seedE2ECharacter';

/**
 * End-to-end test data setup. Idempotent: safe to run before every test run.
 *
 * 1. Ensures the SRD reference data is present (spells, classes, races, etc.).
 *    This is expensive on a cold database but is skipped entirely once the
 *    tables are populated.
 * 2. Creates or reuses a Supabase auth user for the e2e suite via the admin
 *    REST API, returning its UUID.
 * 3. Seeds a fresh Fighter 4 character owned by that UUID.
 *
 * Required env vars (provided by `mobile-app/e2e/env.ts` during test runs):
 *   - DATABASE_URL                    Connection to the local Supabase Postgres
 *   - SUPABASE_URL                    Local Supabase API URL
 *   - SUPABASE_SERVICE_ROLE_KEY       Admin (secret) key
 *   - E2E_TEST_EMAIL                  Email for the test user
 *   - E2E_TEST_PASSWORD               Password for the test user
 */

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required env var: ${name}`);
    return value;
}

async function ensureSrdSeedData(): Promise<void> {
    const classCount = await prisma.class.count();
    if (classCount > 0) {
        console.log('[e2e-setup] SRD reference data already present — skipping SRD seed.');
        return;
    }

    console.log('[e2e-setup] SRD tables empty — running full SRD seed (this may take ~30s)…');
    const srdSpellNames = await seedSpells();
    await seedCustomSpells(srdSpellNames);
    await seedAbilityScores();
    await seedRaces();
    await seedCharacterReferenceData();
    console.log('[e2e-setup] SRD seed complete.');
}

type AdminUser = { id: string; email: string };

async function findExistingUser(supabaseUrl: string, serviceRoleKey: string, email: string): Promise<AdminUser | null> {
    const perPage = 100;
    let page = 1;

    while (true) {
        const response = await fetch(
            `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`,
            {
                headers: {
                    apikey: serviceRoleKey,
                    Authorization: `Bearer ${serviceRoleKey}`,
                },
            },
        );

        if (!response.ok) {
            throw new Error(`Admin list users failed (${response.status}): ${await response.text()}`);
        }

        const payload = (await response.json()) as { users: AdminUser[] };
        const match = payload.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
        if (match) return match;

        if (payload.users.length < perPage) return null;
        page += 1;
    }
}

async function ensureTestUser(
    supabaseUrl: string,
    serviceRoleKey: string,
    email: string,
    password: string,
): Promise<string> {
    const existing = await findExistingUser(supabaseUrl, serviceRoleKey, email);
    if (existing) {
        console.log(`[e2e-setup] Reusing existing test user (id: ${existing.id}).`);
        return existing.id;
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email,
            password,
            email_confirm: true,
        }),
    });

    if (!response.ok) {
        throw new Error(`Admin create user failed (${response.status}): ${await response.text()}`);
    }

    const created = (await response.json()) as AdminUser;
    console.log(`[e2e-setup] Created test user (id: ${created.id}).`);
    return created.id;
}

async function main() {
    const supabaseUrl = requireEnv('SUPABASE_URL');
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
    const email = requireEnv('E2E_TEST_EMAIL');
    const password = requireEnv('E2E_TEST_PASSWORD');

    await ensureSrdSeedData();
    const userId = await ensureTestUser(supabaseUrl, serviceRoleKey, email, password);
    const { characterId } = await seedE2ECharacter(userId);
    console.log(`[e2e-setup] Seeded fresh test character (id: ${characterId}) for user ${userId}.`);

    // Emit the IDs on the last line for the caller to parse if it wants them.
    console.log(JSON.stringify({ userId, characterId }));
}

try {
    await main();
    await prisma.$disconnect();
    process.exit(0);
} catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
}
