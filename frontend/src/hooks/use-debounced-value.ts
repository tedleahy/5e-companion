import { useCallback, useEffect, useState } from 'react';

/**
 * The value as it was once it stopped changing for `delayMs`, and a function that publishes a value
 * straight away, such as when the player presses the keyboard's Search key. It publishes the latest
 * value unless given another, for a caller that has just changed the value and can't wait for the
 * next render to pass it in.
 *
 * @param value - The latest value to publish after changes stop for the delay.
 * @param delayMs - How long the value must stay unchanged before it is published, in milliseconds.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): [T, (next?: T) => void] {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setDebounced(value), delayMs);
        return () => clearTimeout(timeout);
    }, [value, delayMs]);

    // A pending timeout still fires afterwards, but by then it publishes the same value, so nothing
    // changes.
    const flush = useCallback((next: T = value) => setDebounced(next), [value]);

    return [debounced, flush];
}
