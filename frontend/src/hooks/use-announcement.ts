import { useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Has the screen reader read `message` out when it first appears and whenever it changes, for
 * status lines and alerts that appear without the player moving to them.
 *
 * Only native needs this. On the web, `role="status"` and `role="alert"` are live regions that
 * announce themselves. React Native doesn't carry those roles over: Android has no live region for
 * either, and iOS never announces live regions, so native asks the screen reader directly.
 *
 * @param message - What to read out, or null while there's nothing to say.
 */
export function useAnnouncement(message: string | null) {
    useEffect(() => {
        if (message === null || Platform.OS === 'web') return;

        AccessibilityInfo.announceForAccessibility(message);
    }, [message]);
}
