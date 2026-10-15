import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from './use-debounced-value';

beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

async function advance(ms: number) {
    await act(async () => {
        jest.advanceTimersByTime(ms);
    });
}

async function renderDebounced(value: string) {
    return renderHook((props: { value: string }) => useDebouncedValue(props.value, 250)[0], {
        initialProps: { value },
    });
}

describe('useDebouncedValue', () => {
    it('starts with the initial value', async () => {
        const { result } = await renderDebounced('a');

        expect(result.current).toBe('a');
    });

    it('updates once the value has stopped changing for the delay', async () => {
        const { result, rerender } = await renderDebounced('a');

        await rerender({ value: 'ab' });
        await advance(200);
        await rerender({ value: 'abc' });
        await advance(249);

        expect(result.current).toBe('a');

        await advance(1);

        expect(result.current).toBe('abc');
    });

    it('publishes a given value straight away when flushed with one', async () => {
        const { result, rerender } = await renderHook(
            (props: { value: string }) => useDebouncedValue(props.value, 250),
            { initialProps: { value: 'abc' } },
        );

        await rerender({ value: 'abcd' });
        await act(async () => {
            result.current[1]('');
        });

        expect(result.current[0]).toBe('');
    });

    it('publishes the latest value straight away when flushed', async () => {
        const { result, rerender } = await renderHook(
            (props: { value: string }) => useDebouncedValue(props.value, 250),
            { initialProps: { value: 'a' } },
        );

        await rerender({ value: 'abc' });
        await act(async () => {
            result.current[1]();
        });

        expect(result.current[0]).toBe('abc');
    });
});
