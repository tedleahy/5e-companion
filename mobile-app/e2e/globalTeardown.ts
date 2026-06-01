import fs from 'node:fs';
import path from 'node:path';
import { E2E_DEV_LOCAL_ENV_MARKER } from './env';

/**
 * Playwright globalTeardown. Removes the e2e `.env.development.local` file
 * written during globalSetup, and restores the developer's original file if
 * one existed.
 */

const MOBILE_APP_ROOT = path.resolve(__dirname, '..');
const DEV_LOCAL_ENV_FILE = path.join(MOBILE_APP_ROOT, '.env.development.local');
const DEV_LOCAL_ENV_BACKUP = path.join(MOBILE_APP_ROOT, '.env.development.local.e2e-backup');

function isGeneratedDevLocalEnvFile(filePath: string): boolean {
    if (!fs.existsSync(filePath)) return false;
    return fs.readFileSync(filePath, 'utf8').includes(E2E_DEV_LOCAL_ENV_MARKER);
}

export default async function globalTeardown(): Promise<void> {
    if (isGeneratedDevLocalEnvFile(DEV_LOCAL_ENV_FILE)) {
        fs.unlinkSync(DEV_LOCAL_ENV_FILE);
    }
    if (fs.existsSync(DEV_LOCAL_ENV_BACKUP)) {
        if (fs.existsSync(DEV_LOCAL_ENV_FILE)) {
            throw new Error(
                `Refusing to overwrite ${DEV_LOCAL_ENV_FILE}; restore ${DEV_LOCAL_ENV_BACKUP} manually.`,
            );
        }
        fs.renameSync(DEV_LOCAL_ENV_BACKUP, DEV_LOCAL_ENV_FILE);
    }
}
