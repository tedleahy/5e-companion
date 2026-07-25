import { config } from 'dotenv';
import { resolve } from 'node:path';

/** Ensures server/.env is loaded before resolver modules that import auth. */
config({ path: resolve(import.meta.dir, '../../.env') });
