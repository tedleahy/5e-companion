import { StyleSheet, Text, View } from 'react-native';

import { initial } from '@/characters/display';
import { colors, offsetShadow, typography } from '@/theme';

type CharacterTokenProps = {
    name: string | null;
    size?: 56 | 64;
    draft?: boolean;
};

/**
 * A round token showing the first letter of a name. The letter is decoration: the name beside the
 * token is what screen readers announce.
 *
 * @param props.name - The character name, or null for an unnamed draft with an empty token.
 * @param props.size - The token diameter in points. A 64-point token uses the larger initial.
 * @param props.draft - Whether to draw an outlined draft ring instead of a filled character token.
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
