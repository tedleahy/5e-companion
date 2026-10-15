import { useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { clampCharacterSearch } from '@/api/characters';
import { ClearIcon } from '@/components/clear-icon';
import { isFocusVisible } from '@/components/focus-visible';
import { SearchIcon } from '@/components/search-icon';
import { Spinner } from '@/components/spinner';
import { VisuallyHidden } from '@/components/visually-hidden';
import { useAnnouncement } from '@/hooks/use-announcement';
import { colors, offsetShadow, typography } from '@/theme';

type SearchFieldProps = {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onClear: () => void;
    onPlate?: boolean;
    searching?: boolean;
};

/**
 * The search box, on the phone plate or in the wide toolbar. The input fills the whole field, so a
 * tap anywhere on it focuses the input, and on web the field draws the focus ring in place of the
 * input's own outline. Whenever the field holds text, a clear button sits at its right end, with
 * the search spinner just inside it.
 *
 * @param props.value - The search text, as typed.
 * @param props.onChangeText - Called on every keystroke, limiting the trimmed search to the API's
 *   maximum number of Unicode code points.
 * @param props.onSubmit - Called when the keyboard's Search key is pressed.
 * @param props.onClear - Called when the clear button is pressed, to empty the search and send it.
 *   Focus then returns to the input, so the keyboard stays up for the next search.
 * @param props.onPlate - Whether the field sits on the structural plate, where its focus ring needs
 *   the light ink to show.
 * @param props.searching - Whether a search is loading, which turns a small spinner at the right of
 *   the field.
 */
export function SearchField({
    value,
    onChangeText,
    onSubmit,
    onClear,
    onPlate = false,
    searching = false,
}: SearchFieldProps) {
    const [focused, setFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    useAnnouncement(searching ? SEARCHING_STATUS : null);
    const hasText = value !== '';
    // Where the spinner's right edge sits, inside the border: at the text's edge, or beside the
    // clear button when that's showing.
    const spinnerRight = hasText ? SPINNER_RIGHT_BESIDE_CLEAR : TEXT_RIGHT;

    const clear = () => {
        onClear();
        // On the web, pressing the button focuses it, and it goes once the field is empty.
        inputRef.current?.focus();
    };

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
                ref={inputRef}
                value={value}
                onChangeText={(text) => onChangeText(limitSearch(text))}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Find a character"
                placeholderTextColor={colors.dim}
                aria-label="Find a character"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => onSubmit()}
                style={[
                    typography.input,
                    styles.input,
                    { paddingRight: textRight(hasText, searching, spinnerRight) },
                ]}
            />
            {/* Always mounted, so screen readers on the web hear the status change when a search
                starts. Native screen readers are told through useAnnouncement instead. */}
            <View role="status" style={[styles.status, { right: BORDER_WIDTH + spinnerRight }]}>
                {searching && (
                    <>
                        <Spinner size={16} />
                        <VisuallyHidden>
                            <Text>{SEARCHING_STATUS}</Text>
                        </VisuallyHidden>
                    </>
                )}
            </View>
            {hasText && <ClearButton onPress={clear} />}
        </View>
    );
}

/**
 * The × at the field's right end. It isn't a printed surface, so it has no shadow and doesn't sink
 * when pressed. On the web, its keyboard focus ring sits inside the field's border.
 *
 * @param props.onPress - Empties the search.
 */
function ClearButton({ onPress }: { onPress: () => void }) {
    const [focusVisible, setFocusVisible] = useState(false);

    return (
        <Pressable
            role="button"
            aria-label="Clear search"
            onPress={onPress}
            onFocus={(event) => setFocusVisible(isFocusVisible(event))}
            onBlur={() => setFocusVisible(false)}
            // Out over the border to the field's edge, so the target is 44 points square. React
            // Native Web ignores hit slop, so the web target stops at the border.
            hitSlop={{ top: BORDER_WIDTH, bottom: BORDER_WIDTH, right: BORDER_WIDTH }}
            style={[styles.clear, focusVisible && styles.clearFocusRing]}
        >
            <ClearIcon color={colors.structural} />
        </Pressable>
    );
}

/**
 * How far in from the border the text stops, so it never runs under the spinner or the clear
 * button.
 *
 * @param hasText - Whether the clear button is showing.
 * @param searching - Whether the spinner is showing.
 * @param spinnerRight - The spinner's right edge, inside the border.
 */
function textRight(hasText: boolean, searching: boolean, spinnerRight: number): number {
    if (searching) return spinnerRight + SPINNER_SIZE + ICON_GAP;

    return hasText ? CLEAR_SIZE + ICON_GAP : TEXT_RIGHT;
}

/** Keeps whitespace as typed unless the trimmed search exceeds the API's code-point limit. */
function limitSearch(text: string): string {
    // TextInput's maxLength counts UTF-16 code units, which would reject valid emoji searches
    // before Rails's character limit, and it would count surrounding spaces too. The hook clamps
    // the same way, so the field shows exactly what gets searched for.
    const clamped = clampCharacterSearch(text);
    return clamped === text.trim() ? text : clamped;
}

/** What screen readers hear while a search loads. */
const SEARCHING_STATUS = 'Searching…';

/** The icon's left edge, inside the border. */
const ICON_LEFT = 12;
/** The icon is drawn at 15 points. */
const ICON_SIZE = 15;
/** Space between the icon and the text, and between the text and the spinner or clear button. */
const ICON_GAP = 8;
/** The text's right edge, inside the border, when the field is empty. The spinner sits there too. */
const TEXT_RIGHT = 12;
/** The spinner's size. */
const SPINNER_SIZE = 16;
/** A full touch target. */
const FIELD_HEIGHT = 44;
/** The input owns the border so every point of the visible field can focus it. */
const BORDER_WIDTH = 2;
/** The clear button is as tall as the field inside its border, and as wide, so it's square. */
const CLEAR_SIZE = FIELD_HEIGHT - BORDER_WIDTH * 2;
/** The × is drawn at 14 points, centered in the button. */
const CLEAR_ICON_SIZE = 14;
/**
 * The spinner's right edge beside the clear button, inside the border: 10 points past the left of
 * the ×. The button's blank edge alone would leave the spinner 21 points away.
 */
const SPINNER_RIGHT_BESIDE_CLEAR = CLEAR_SIZE - (CLEAR_SIZE - CLEAR_ICON_SIZE) / 2 + 10;

const styles = StyleSheet.create({
    field: {
        flex: 1,
        minWidth: 0,
        minHeight: FIELD_HEIGHT,
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
        minHeight: FIELD_HEIGHT,
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
    status: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        pointerEvents: 'none',
    },
    clear: {
        position: 'absolute',
        top: BORDER_WIDTH,
        right: BORDER_WIDTH,
        width: CLEAR_SIZE,
        height: CLEAR_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearFocusRing: {
        outlineStyle: 'solid',
        outlineWidth: 2,
        outlineOffset: -4,
        outlineColor: colors.structural,
    },
});
