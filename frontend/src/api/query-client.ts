import { QueryClient } from '@tanstack/react-query';

import { ApiError, MissingConfigError } from './client';

const MAX_RETRIES = 2;

/**
 * Retries anything but a 4xx or a missing setting, which would fail the same way again.
 *
 * @param failureCount - The number of retries already attempted for this query.
 * @param error - The failure to inspect for a client error or missing setting, which never retry.
 */
export function shouldRetry(failureCount: number, error: Error): boolean {
    if (error instanceof MissingConfigError) return false;
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;

    return failureCount < MAX_RETRIES;
}

/**
 * The app's query client. Fails fast on a 4xx, never refetches on window focus, and always sends
 * requests, even when the browser reports it is offline.
 */
export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: shouldRetry,
                // By default, a browser's offline event pauses queries instead of failing them, so the
                // list would spin forever and a search would leave the old list showing without a
                // spinner. Sending anyway lets a dead connection fail into Couldn't load, as it does
                // on native, which never reports itself offline.
                networkMode: 'always',
                // Native doesn't refetch when the app returns to the foreground, so the web build doesn't
                // either when its tab regains focus.
                refetchOnWindowFocus: false,
            },
        },
    });
}
