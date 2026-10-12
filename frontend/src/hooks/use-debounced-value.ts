import { useEffect, useState } from 'react';

/**
 * The value as it was once it stopped changing for `delayMs`.
 *
 * @param value - The latest value to publish after changes stop for the delay.
 * @param delayMs - How long the value must stay unchanged before it is published, in milliseconds.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timeout);
    }, [value, delayMs]);

    return debounced;
}
