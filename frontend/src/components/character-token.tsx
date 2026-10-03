import { StyleSheet, Text, View } from 'react-native';

import { initial } from '@/characters/display';
import { colors, offsetShadow, typography } from '@/theme';

type CharacterTokenProps = {
    /** The character's name, or null for an unnamed draft, which gets an empty token. */
    name: string | null;
    /** Diameter in points. 64 gets the larger initial. */
    size?: 56 | 64;
    /** A draft's token: an outlined ring instead of a filled one. */
    draft?: boolean;
};

/**
 * A round token showing the first letter of a name. The letter is decoration: the name beside the
 * token is what screen readers announce.
 */
export function CharacterToken({ name, size = 56, draft = false }: CharacterTokenProps) {
    return (
        <View
            style={[
                styles.token,
                { width: size, height: size },
                draft ? styles.draftToken : styles.characterToken,
            ]}
        >
            <Text
                aria-hidden
                style={[
                    size === 64 ? typography.initialDesktop : typography.initialPhone,
                    draft ? styles.draftInitial : styles.characterInitial,
                ]}
            >
                {initial(name)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    token: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    characterToken: {
        backgroundColor: colors.structural,
        boxShadow: offsetShadow(4, 'accent'),
    },
    draftToken: {
        backgroundColor: colors.card,
        borderWidth: 2,
        borderColor: colors.structural,
        boxShadow: offsetShadow(4, 'rule'),
    },
    characterInitial: {
        color: colors.onStructural,
    },
    draftInitial: {
        color: colors.structural,
    },
});
