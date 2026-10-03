import { QueryClient } from '@tanstack/react-query';

import { ApiError } from './client';

const MAX_RETRIES = 2;

/** Retries anything but a 4xx, which would fail the same way again. */
export function shouldRetry(failureCount: number, error: Error): boolean {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;

    return failureCount < MAX_RETRIES;
}

/** The app's query client. Fails fast on a 4xx and never refetches on window focus. */
export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: shouldRetry,
                // Native doesn't refetch when the app returns to the foreground, so the web build doesn't
                // either when its tab regains focus.
                refetchOnWindowFocus: false,
            },
        },
    });
}
