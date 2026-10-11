import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { SearchIcon } from '@/components/search-icon';
import { Spinner } from '@/components/spinner';
import { useAnnouncement } from '@/hooks/use-announcement';
import { colors, offsetShadow, typography } from '@/theme';

type SearchFieldProps = {
    value: string;
    onChangeText: (text: string) => void;
    onPlate?: boolean;
    searching?: boolean;
};

/**
 * The search box, on the phone plate or in the wide toolbar. The input fills the whole field, so a
 * tap anywhere on it focuses the input, and on web the field draws the focus ring in place of the
 * input's own outline.
 *
 * @param props.value - The search text, as typed.
 * @param props.onChangeText - Called with the new text on every keystroke.
 * @param props.onPlate - Whether the field sits on the structural plate, where its focus ring needs
 *   the light ink to show.
 * @param props.searching - Whether a search is loading, which turns a small spinner at the right of
 *   the field.
 */
export function SearchField({
    value,
    onChangeText,
    onPlate = false,
    searching = false,
}: SearchFieldProps) {
    const [focused, setFocused] = useState(false);
    useAnnouncement(searching ? SEARCHING_STATUS : null);

    return (
        <View
            style={[
                styles.field,
                focused &&
                    Platform.OS === 'web' && [
                        styles.focusRing,
                        { outlineColor: onPlate ? colors.onStructural : colors.structural },
                    ],
            ]}
        >
            <View style={styles.icon}>
                <SearchIcon color={colors.dim} />
            </View>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Find a character"
                placeholderTextColor={colors.dim}
                accessibilityLabel="Find a character"
                autoCorrect={false}
                returnKeyType="search"
                style={[typography.input, styles.input, searching && styles.inputBesideSpinner]}
            />
            {/* Always mounted, so screen readers on the web hear the status change when a search
                starts. Native screen readers are told through useAnnouncement instead. */}
            <View role="status" style={styles.status}>
                {searching && (
                    <>
                        <Spinner size={16} />
                        <View style={styles.visuallyHidden}>
                            <Text>{SEARCHING_STATUS}</Text>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

/** What screen readers hear while a search loads. */
const SEARCHING_STATUS = 'Searching…';

/** The icon's left edge, inside the border. */
const ICON_LEFT = 12;
/** The icon is drawn at 15 points. */
const ICON_SIZE = 15;
/** Space between the icon and the text, and between the text and the spinner. */
const ICON_GAP = 8;
/** The text's right edge, inside the border. The spinner sits there too. */
const TEXT_RIGHT = 12;
/** The spinner's size. */
const SPINNER_SIZE = 16;

const styles = StyleSheet.create({
    field: {
        flex: 1,
        minWidth: 0,
        minHeight: 44,
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.structural,
        boxShadow: offsetShadow(4, 'accent'),
    },
    focusRing: {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: 3,
    },
    icon: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: ICON_LEFT,
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    input: {
        flex: 1,
        alignSelf: 'stretch',
        minWidth: 0,
        paddingVertical: 0,
        paddingLeft: ICON_LEFT + ICON_SIZE + ICON_GAP,
        paddingRight: TEXT_RIGHT,
        color: colors.text,
        outlineWidth: 0,
    },
    inputBesideSpinner: {
        paddingRight: TEXT_RIGHT + SPINNER_SIZE + ICON_GAP,
    },
    status: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: TEXT_RIGHT,
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    // Read by screen readers but not drawn, like the web's visually hidden pattern.
    visuallyHidden: {
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
    },
});
