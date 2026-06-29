import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { e2eEnv } from './env';

const [, , cwdArg, ...command] = process.argv;

if (!cwdArg || command.length === 0) {
    console.error('Usage: bun run e2e/runWithE2eEnv.ts <cwd> <command> [...args]');
    process.exit(1);
}

const child: ChildProcess = spawn(command[0], command.slice(1), {
    cwd: path.resolve(process.cwd(), cwdArg),
    env: e2eEnv(),
    stdio: 'inherit',
});

child.on('error', (error: Error) => {
    console.error(error);
    process.exit(1);
});

child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }

    process.exit(code ?? 1);
});
