import { Platform, type FocusEvent } from 'react-native';

/**
 * Whether a focus should show a focus ring. Only on web, and only where the browser would show its
 * own focus indicator: a click focuses the element too, but shouldn't leave a ring behind.
 *
 * @param event - The focus event from a pressable's onFocus.
 */
export function isFocusVisible(event: FocusEvent): boolean {
    if (Platform.OS !== 'web') return false;

    // On web, React Native Web hands over the DOM event, so the target is the element itself.
    const target = event.currentTarget as unknown as Partial<Pick<Element, 'matches'>>;
    return target.matches?.(':focus-visible') ?? true;
}
