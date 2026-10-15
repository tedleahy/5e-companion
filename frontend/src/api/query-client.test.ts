import { onlineManager } from '@tanstack/react-query';

import { ApiError, MissingConfigError } from './client';
import { createQueryClient, shouldRetry } from './query-client';

describe('shouldRetry', () => {
    it.each([400, 401, 404, 499])('never retries a %i', (status) => {
        expect(shouldRetry(0, new ApiError(status, null, 'No'))).toBe(false);
    });

    it('never retries a missing setting', () => {
        expect(shouldRetry(0, new MissingConfigError('EXPO_PUBLIC_API_TOKEN'))).toBe(false);
    });

    it.each([
        ['a 500', new ApiError(500, null, 'Server error')],
        ['a network failure', new TypeError('Network request failed')],
    ])('retries %s at most twice', (_description, error) => {
        expect(shouldRetry(0, error)).toBe(true);

        expect(shouldRetry(1, error)).toBe(true);

        expect(shouldRetry(2, error)).toBe(false);
    });
});

describe('createQueryClient', () => {
    it('does not retry a 401', async () => {
        const client = createQueryClient();
        const unauthorized = new ApiError(401, 'unauthorized', 'Authentication required.');
        const queryFn = jest.fn().mockRejectedValue(unauthorized);

        await expect(client.fetchQuery({ queryKey: ['unauthorized'], queryFn })).rejects.toBe(
            unauthorized,
        );

        expect(queryFn).toHaveBeenCalledTimes(1);

        client.clear();
    });

    it('still sends a request when the browser reports it is offline', async () => {
        onlineManager.setOnline(false);
        const client = createQueryClient();
        const failure = new TypeError('Network request failed');
        const queryFn = jest.fn().mockRejectedValue(failure);

        try {
            await expect(
                client.fetchQuery({ queryKey: ['offline'], queryFn, retry: false }),
            ).rejects.toBe(failure);

            expect(queryFn).toHaveBeenCalledTimes(1);
        } finally {
            onlineManager.setOnline(true);
            client.clear();
        }
    });
});
