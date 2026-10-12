import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';

/** A fresh client for one test, with retries off so failures surface straight away. */
export function createTestQueryClient(): QueryClient {
    return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function wrapperFor(client: QueryClient) {
    return function QueryWrapper({ children }: { children: ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
}

/**
 * Renders `ui` inside a `QueryClientProvider`. Returns the client alongside the render result, so
 * a test can read or seed its cache.
 */
export async function renderWithQuery(ui: ReactElement, client = createTestQueryClient()) {
    const view = await render(ui, { wrapper: wrapperFor(client) });
    return { ...view, client };
}

/**
 * Renders `hook` inside a `QueryClientProvider`, as `renderWithQuery` does for UI.
 *
 * @param hook - The hook callback to run inside the query provider.
 * @param options.initialProps - The props to pass to the hook on its first render.
 * @param options.client - The query client to provide, or a fresh test client when omitted.
 */
export async function renderHookWithQuery<Result, Props>(
    hook: (props: Props) => Result,
    {
        initialProps,
        client = createTestQueryClient(),
    }: { initialProps?: Props; client?: QueryClient } = {},
) {
    const view = await renderHook(hook, { initialProps, wrapper: wrapperFor(client) });
    return { ...view, client };
}
