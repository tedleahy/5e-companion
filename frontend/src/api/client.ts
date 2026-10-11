/** A response from the API outside the 2xx range. */
export class ApiError extends Error {
    readonly status: number;
    /** The API's machine-readable error code, or null when the body didn't carry one. */
    readonly code: string | null;

    constructor(status: number, code: string | null, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

export type QueryParams = Record<string, string | number | undefined>;

/** Options for `apiFetch`. */
export type ApiFetchOptions = {
    query?: QueryParams;
    signal?: AbortSignal;
};

/**
 * Sends an authenticated GET to the API and parses the JSON body.
 *
 * @param path - The endpoint to call. Starts with `/` and is appended to `EXPO_PUBLIC_API_URL`.
 * @param options.query - Parameters to send as the query string, such as a search. Undefined
 *   values are left out, so a caller can pass an optional parameter without checking it first.
 * @param options.signal - Cancels the request, such as when a newer search makes this one stale.
 * @throws `ApiError` for a non-2xx response. Network failures and aborts propagate unchanged.
 */
export async function apiFetch<T>(
    path: string,
    { query, signal }: ApiFetchOptions = {},
): Promise<T> {
    // Expo only inlines EXPO_PUBLIC_ variables read with this exact dotted syntax.
    const baseUrl = requireEnv('EXPO_PUBLIC_API_URL', process.env.EXPO_PUBLIC_API_URL);
    const token = requireEnv('EXPO_PUBLIC_API_TOKEN', process.env.EXPO_PUBLIC_API_TOKEN);

    const response = await fetch(buildUrl(baseUrl, path, query), {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
        },
        signal,
    });

    if (!response.ok) throw await errorFromResponse(response);

    return (await response.json()) as T;
}

/** Returns `value`, or throws an error naming the unset variable. */
function requireEnv(name: string, value: string | undefined): string {
    if (!value) throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);

    return value;
}

/** Joins `baseUrl` and `path` and adds the encoded query, leaving out undefined values. */
function buildUrl(baseUrl: string, path: string, query: QueryParams = {}): string {
    const search = Object.entries(query)
        .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    const url = `${baseUrl.replace(/\/+$/, '')}${path}`;
    return search ? `${url}?${search}` : url;
}

/**
 * Reads the API's `{ error: { code, message } }` body into an `ApiError`. A body that isn't JSON,
 * or is in another shape, gets a null code and a generic message.
 */
async function errorFromResponse(response: Response): Promise<ApiError> {
    const fallback = `Request failed with status ${response.status}`;

    let body: unknown;
    try {
        body = JSON.parse(await response.text());
    } catch {
        return new ApiError(response.status, null, fallback);
    }

    const error = isRecord(body) && isRecord(body.error) ? body.error : {};
    const code = typeof error.code === 'string' ? error.code : null;
    const message = typeof error.message === 'string' ? error.message : fallback;
    return new ApiError(response.status, code, message);
}

/** True for a plain object. False for null and arrays. */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
