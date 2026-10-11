import { act } from '@testing-library/react-native';

import type { CharacterList, CharacterSort } from '@/api/characters';
import { renderHookWithQuery } from '@/test-utils/render-with-query';

import { SEARCH_DEBOUNCE_MS, useCharacterList } from './use-character-list';

type Props = { search: string; sort: CharacterSort };

type PendingRequest = {
    url: URL;
    signal: AbortSignal;
    respond: (body: CharacterList) => Promise<void>;
};

let requests: PendingRequest[];

function listOf(...names: string[]): CharacterList {
    return {
        characters: names.map((name, index) => ({
            id: String(index + 1),
            name,
            ancestry: { race_name: 'Human', subrace_name: null },
            classes: [{ name: 'Fighter', level: 1, subclass_name: null }],
            total_level: 1,
            hit_points: { current: 10, maximum: 10, temporary: 0 },
        })),
        drafts: [],
    };
}

function lastRequest(): PendingRequest {
    return requests[requests.length - 1];
}

async function renderCharacterList(initialProps: Props = { search: '', sort: 'level' }) {
    return renderHookWithQuery(({ search, sort }: Props) => useCharacterList(search, sort), {
        initialProps,
    });
}

async function advance(ms: number) {
    await act(async () => {
        jest.advanceTimersByTime(ms);
    });
}

beforeEach(() => {
    jest.useFakeTimers();
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    process.env.EXPO_PUBLIC_API_TOKEN = 'test-token';
    requests = [];

    globalThis.fetch = jest.fn(
        (input: RequestInfo | URL, init?: RequestInit) =>
            new Promise<Response>((resolve, reject) => {
                const signal = init!.signal!;
                signal.addEventListener('abort', () =>
                    reject(new DOMException('Aborted', 'AbortError')),
                );

                requests.push({
                    url: new URL(String(input)),
                    signal,
                    respond: async (body) => {
                        await act(async () => {
                            resolve({ ok: true, status: 200, json: async () => body } as Response);
                            // TanStack Query batches its updates to observers on a zero-delay timer.
                            await jest.advanceTimersByTimeAsync(0);
                        });
                    },
                });
            }),
    );
});

afterEach(() => {
    jest.useRealTimers();
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_API_TOKEN;
});

describe('useCharacterList', () => {
    it('loads the list sorted by level with no search', async () => {
        const { result } = await renderCharacterList();

        expect(requests).toHaveLength(1);

        expect(lastRequest().url.pathname).toBe('/api/v1/characters');

        expect(lastRequest().url.search).toBe('?sort=level');

        await lastRequest().respond(listOf('Kethra Ironsong'));

        expect(result.current.data).toEqual(listOf('Kethra Ironsong'));

        expect(result.current.isSearching).toBe(false);
    });

    it('sends the sort', async () => {
        await renderCharacterList({ search: '', sort: 'name' });

        expect(lastRequest().url.searchParams.get('sort')).toBe('name');
    });

    it('sends one request once typing stops, not one per keystroke', async () => {
        const { rerender } = await renderCharacterList();
        await lastRequest().respond(listOf('Kethra Ironsong', 'Vesper Quill'));

        for (const search of ['v', 've', 'ves']) {
            await rerender({ search, sort: 'level' });
            await advance(SEARCH_DEBOUNCE_MS - 1);
        }

        expect(requests).toHaveLength(1);

        await advance(1);

        expect(requests).toHaveLength(2);

        expect(lastRequest().url.searchParams.get('q')).toBe('ves');
    });

    it('trims the search', async () => {
        const { rerender } = await renderCharacterList();

        await rerender({ search: '  ves ', sort: 'level' });
        await advance(SEARCH_DEBOUNCE_MS);

        expect(lastRequest().url.searchParams.get('q')).toBe('ves');
    });

    it('sends no q for a search of only whitespace', async () => {
        await renderCharacterList({ search: '   ', sort: 'level' });
        await advance(SEARCH_DEBOUNCE_MS);

        expect(requests).toHaveLength(1);

        expect(lastRequest().url.searchParams.has('q')).toBe(false);
    });

    it('keeps the previous list on screen while a new search loads', async () => {
        const { result, rerender } = await renderCharacterList();
        await lastRequest().respond(listOf('Kethra Ironsong', 'Vesper Quill'));

        await rerender({ search: 'ves', sort: 'level' });
        await advance(SEARCH_DEBOUNCE_MS);

        expect(result.current.data).toEqual(listOf('Kethra Ironsong', 'Vesper Quill'));

        expect(result.current.isSearching).toBe(true);

        await lastRequest().respond(listOf('Vesper Quill'));

        expect(result.current.data).toEqual(listOf('Vesper Quill'));

        expect(result.current.isSearching).toBe(false);
    });

    it('reports the search the list on screen came from, not the one being typed', async () => {
        const { result, rerender } = await renderCharacterList();
        await lastRequest().respond(listOf('Kethra Ironsong', 'Vesper Quill'));

        expect(result.current.shownSearch).toBeUndefined();

        await rerender({ search: ' ves ', sort: 'level' });
        await advance(SEARCH_DEBOUNCE_MS);

        expect(result.current.shownSearch).toBeUndefined();

        await lastRequest().respond(listOf('Vesper Quill'));

        expect(result.current.shownSearch).toBe('ves');

        await rerender({ search: '', sort: 'level' });

        expect(result.current.shownSearch).toBe('ves');
    });

    it('keeps the previous list without counting as searching when only the sort changes', async () => {
        const { result, rerender } = await renderCharacterList();
        await lastRequest().respond(listOf('Kethra Ironsong', 'Vesper Quill'));

        await rerender({ search: '', sort: 'name' });

        expect(result.current.data).toEqual(listOf('Kethra Ironsong', 'Vesper Quill'));

        expect(result.current.isFetching).toBe(true);

        expect(result.current.isSearching).toBe(false);
    });

    it('is not searching during the first load', async () => {
        const { result } = await renderCharacterList();

        expect(result.current.isPending).toBe(true);

        expect(result.current.isSearching).toBe(false);
    });

    it('aborts a stale search', async () => {
        const { rerender } = await renderCharacterList();
        await lastRequest().respond(listOf('Kethra Ironsong', 'Vesper Quill'));

        await rerender({ search: 'v', sort: 'level' });
        await advance(SEARCH_DEBOUNCE_MS);
        const stale = lastRequest();

        await rerender({ search: 've', sort: 'level' });
        await advance(SEARCH_DEBOUNCE_MS);

        expect(stale.signal.aborted).toBe(true);

        expect(lastRequest().signal.aborted).toBe(false);
    });
});
