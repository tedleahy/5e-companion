import fs from 'node:fs';
import path from 'node:path';

/**
 * Playwright globalTeardown. Removes the e2e `.env.development.local` file
 * written during globalSetup, and restores the developer's original file if
 * one existed.
 */

const MOBILE_APP_ROOT = path.resolve(__dirname, '..');
const DEV_LOCAL_ENV_FILE = path.join(MOBILE_APP_ROOT, '.env.development.local');
const DEV_LOCAL_ENV_BACKUP = path.join(MOBILE_APP_ROOT, '.env.development.local.e2e-backup');

export default async function globalTeardown(): Promise<void> {
    if (fs.existsSync(DEV_LOCAL_ENV_FILE)) {
        fs.unlinkSync(DEV_LOCAL_ENV_FILE);
    }
    if (fs.existsSync(DEV_LOCAL_ENV_BACKUP)) {
        fs.renameSync(DEV_LOCAL_ENV_BACKUP, DEV_LOCAL_ENV_FILE);
    }
}
