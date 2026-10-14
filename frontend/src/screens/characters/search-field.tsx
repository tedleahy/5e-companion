import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { CHARACTER_SEARCH_MAX_LENGTH } from '@/api/characters';
import { SearchIcon } from '@/components/search-icon';
import { Spinner } from '@/components/spinner';
import { VisuallyHidden } from '@/components/visually-hidden';
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
 * @param props.onChangeText - Called on every keystroke, limiting the trimmed search to the API's
 *   maximum number of Unicode code points.
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
                onChangeText={(text) => onChangeText(limitSearch(text))}
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
                        <VisuallyHidden>
                            <Text>{SEARCHING_STATUS}</Text>
                        </VisuallyHidden>
                    </>
                )}
            </View>
        </View>
    );
}

/** Keeps whitespace as typed unless the trimmed search exceeds the API's code-point limit. */
function limitSearch(text: string): string {
    // TextInput's maxLength counts UTF-16 code units, which would reject valid emoji searches
    // before Rails's character limit. Trimming first also keeps surrounding spaces out of the count.
    const characters = Array.from(text.trim());
    return characters.length > CHARACTER_SEARCH_MAX_LENGTH
        ? characters.slice(0, CHARACTER_SEARCH_MAX_LENGTH).join('')
        : text;
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
/** The input owns the border so every point of the visible field can focus it. */
const BORDER_WIDTH = 2;

const styles = StyleSheet.create({
    field: {
        flex: 1,
        minWidth: 0,
        minHeight: 44,
        justifyContent: 'center',
        backgroundColor: colors.card,
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
        left: ICON_LEFT + BORDER_WIDTH,
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    input: {
        flex: 1,
        alignSelf: 'stretch',
        minWidth: 0,
        minHeight: 44,
        borderWidth: BORDER_WIDTH,
        borderColor: colors.structural,
        paddingVertical: 0,
        paddingLeft: ICON_LEFT + ICON_SIZE + ICON_GAP,
        paddingRight: TEXT_RIGHT,
        color: colors.text,
        // A browser's auto outline can ignore width 0; solid leaves the ring to the field wrapper.
        outlineStyle: 'solid',
        outlineWidth: 0,
    },
    inputBesideSpinner: {
        paddingRight: TEXT_RIGHT + SPINNER_SIZE + ICON_GAP,
    },
    status: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: TEXT_RIGHT + BORDER_WIDTH,
        justifyContent: 'center',
        pointerEvents: 'none',
    },
});
