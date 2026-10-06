import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View } from 'react-native';

import { SearchIcon } from '@/components/search-icon';
import { colors, offsetShadow, typography } from '@/theme';

type SearchFieldProps = {
    value: string;
    onChangeText: (text: string) => void;
};

/**
 * The search box on the plate. The input fills the whole field, so a tap anywhere on it focuses
 * the input, and on web the field draws the focus ring in place of the input's own outline.
 */
export function SearchField({ value, onChangeText }: SearchFieldProps) {
    const [focused, setFocused] = useState(false);

    return (
        <View style={[styles.field, focused && Platform.OS === 'web' && styles.focusRing]}>
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
                style={[typography.input, styles.input]}
            />
        </View>
    );
}

/** The icon's left edge, inside the border. */
const ICON_LEFT = 12;
/** The icon is drawn at 15 points. */
const ICON_SIZE = 15;
/** Space between the icon and the text. */
const ICON_GAP = 8;

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
        outlineColor: colors.onStructural,
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
        paddingRight: 12,
        color: colors.text,
        outlineWidth: 0,
    },
});
