import { ApiError, apiFetch } from './client';

const fetchMock = jest.fn();

function fakeResponse(status: number, body: string): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => JSON.parse(body),
        text: async () => body,
    } as Response;
}

// Expo reads EXPO_PUBLIC_ variables through a reference to process.env taken at startup, so tests
// set them in place rather than replacing process.env.
beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test:3000/';
    process.env.EXPO_PUBLIC_API_TOKEN = 'test-token';
    globalThis.fetch = fetchMock;
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(fakeResponse(200, '{"ok":true}'));
});

afterEach(() => {
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_API_TOKEN;
});

describe('apiFetch', () => {
    it('builds the URL from the base URL, path and encoded query, leaving out undefined values', async () => {
        await apiFetch('/api/v1/characters', {
            query: { q: 'Vesper & co/1?', sort: 'level', page: undefined },
        });

        expect(fetchMock.mock.calls[0][0]).toBe(
            'http://api.test:3000/api/v1/characters?q=Vesper%20%26%20co%2F1%3F&sort=level',
        );
    });

    it('leaves off the query string when there are no values', async () => {
        await apiFetch('/api/v1/characters', { query: { q: undefined } });

        expect(fetchMock.mock.calls[0][0]).toBe('http://api.test:3000/api/v1/characters');
    });

    it('sends the JSON accept header, the bearer token and the signal', async () => {
        const { signal } = new AbortController();

        await apiFetch('/api/v1/characters', { signal });

        expect(fetchMock.mock.calls[0][1]).toEqual({
            headers: { Accept: 'application/json', Authorization: 'Bearer test-token' },
            signal,
        });
    });

    it('returns the parsed body', async () => {
        await expect(apiFetch('/api/v1/characters')).resolves.toEqual({ ok: true });
    });

    it('throws an ApiError carrying the status, code and message from the error body', async () => {
        fetchMock.mockResolvedValue(
            fakeResponse(
                401,
                '{"error":{"code":"unauthorized","message":"Authentication required."}}',
            ),
        );

        const error = await apiFetch('/api/v1/characters').catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(ApiError);

        expect(error).toMatchObject({
            status: 401,
            code: 'unauthorized',
            message: 'Authentication required.',
        });
    });

    it('tolerates an error body that is not JSON', async () => {
        fetchMock.mockResolvedValue(fakeResponse(502, '<html>Bad gateway</html>'));

        const error = await apiFetch('/api/v1/characters').catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(ApiError);

        expect(error).toMatchObject({
            status: 502,
            code: null,
            message: 'Request failed with status 502',
        });
    });

    it('tolerates a JSON error body in another shape', async () => {
        fetchMock.mockResolvedValue(
            fakeResponse(500, '{"status":500,"error":"Internal Server Error"}'),
        );

        await expect(apiFetch('/api/v1/characters')).rejects.toMatchObject({
            status: 500,
            code: null,
            message: 'Request failed with status 500',
        });
    });

    it('lets a network failure propagate unchanged', async () => {
        const failure = new TypeError('Network request failed');
        fetchMock.mockRejectedValue(failure);

        await expect(apiFetch('/api/v1/characters')).rejects.toBe(failure);
    });

    it.each(['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_API_TOKEN'])(
        'names %s when it is missing',
        async (name) => {
            delete process.env[name];

            await expect(apiFetch('/api/v1/characters')).rejects.toThrow(`${name} is not set`);

            expect(fetchMock).not.toHaveBeenCalled();
        },
    );
});
