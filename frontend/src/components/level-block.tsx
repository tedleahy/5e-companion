import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/theme';

import { VisuallyHidden } from './visually-hidden';

type LevelBlockProps = {
    level: number;
    large?: boolean;
};

/**
 * A "Level" label over the character's total level, or a dim dash when it has no classes. Screen
 * readers hear "Level 8" or "Level not set" rather than the label and the dash.
 *
 * @param props.level - The total character level. Zero shows Level not set.
 * @param props.large - Whether to use the larger label for wide layouts.
 */
export function LevelBlock({ level, large = false }: LevelBlockProps) {
    const isSet = level > 0;
    const label = isSet ? `Level ${level}` : 'Level not set';
    // Native screen readers read the block's label in place of its text. The web ignores a label
    // on an element with no role, so there the text is hidden and a hidden line says it instead.
    const isWeb = Platform.OS === 'web';

    return (
        <View accessible={!isWeb} aria-label={isWeb ? undefined : label} style={styles.block}>
            <Text
                aria-hidden={isWeb}
                style={[large ? typography.smallLabelDesktop : typography.smallLabel, styles.label]}
            >
                Level
            </Text>
            <Text
                aria-hidden={isWeb}
                style={[typography.levelNumber, isSet ? styles.number : styles.unset]}
            >
                {isSet ? level : '–'}
            </Text>
            {isWeb && (
                <VisuallyHidden>
                    <Text>{label}</Text>
                </VisuallyHidden>
            )}
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
