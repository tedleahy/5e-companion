import type { PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';
import type {
    AccessibilityRole,
    AccessibilityState,
    GestureResponderEvent,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { nightFormStyles } from '@/theme/nightFormStyles';

type NightFormCardProps = PropsWithChildren<{
    selected?: boolean;
    style?: StyleProp<ViewStyle>;
    testID?: string;
    /** When set, renders a Pressable so selectable cards can use `selected` without nesting Views. */
    onPress?: (event: GestureResponderEvent) => void;
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: AccessibilityState;
    accessibilityLabel?: string;
}>;

/**
 * Thin wrapper for the shared night-form card chrome.
 * Plain View by default; pass `onPress` for selectable cards.
 */
export function NightFormCard({
    children,
    selected = false,
    style,
    testID,
    onPress,
    accessibilityRole,
    accessibilityState,
    accessibilityLabel,
}: NightFormCardProps) {
    const composedStyle = [nightFormStyles.card, selected && nightFormStyles.cardSelected, style];

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                style={composedStyle}
                testID={testID}
                accessibilityRole={accessibilityRole ?? 'button'}
                accessibilityState={accessibilityState}
                accessibilityLabel={accessibilityLabel}
            >
                {children}
            </Pressable>
        );
    }

    return (
        <View style={composedStyle} testID={testID}>
            {children}
        </View>
    );
}
