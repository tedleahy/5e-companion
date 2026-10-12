import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

type LevelBlockProps = {
    level: number;
    large?: boolean;
};

/**
 * A "Level" label over the character's total level, or a dim dash when it has no classes.
 *
 * @param props.level - The total character level. Zero shows Level not set.
 * @param props.large - Whether to use the larger label for wide layouts.
 */
export function LevelBlock({ level, large = false }: LevelBlockProps) {
    const isSet = level > 0;

    return (
        <View
            accessible
            accessibilityLabel={isSet ? `Level ${level}` : 'Level not set'}
            style={styles.block}
        >
            <Text
                style={[large ? typography.smallLabelDesktop : typography.smallLabel, styles.label]}
            >
                Level
            </Text>
            <Text style={[typography.levelNumber, isSet ? styles.number : styles.unset]}>
                {isSet ? level : '–'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    block: {
        alignItems: 'center',
        gap: 5,
    },
    label: {
        color: colors.dim,
    },
    number: {
        color: colors.structural,
    },
    unset: {
        color: colors.dim,
    },
});
