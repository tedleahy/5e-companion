import { useCallback, useEffect, useState } from 'react';

/**
 * The value as it was once it stopped changing for `delayMs`, and a function that publishes the
 * latest value straight away, such as when the player presses the keyboard's Search key.
 *
 * @param value - The latest value to publish after changes stop for the delay.
 * @param delayMs - How long the value must stay unchanged before it is published, in milliseconds.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): [T, () => void] {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timeout);
    }, [value, delayMs]);

    // The pending timeout still fires afterwards, but it publishes the same value, so nothing
    // changes.
    const flush = useCallback(() => setDebounced(value), [value]);

    return [debounced, flush];
}
