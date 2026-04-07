import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';

type ExpandableLoreTextProps = {
    text: string;
    collapsedLines?: number;
    testID?: string;
};

const DEFAULT_COLLAPSED_LINES = 4;
const MIN_EXPANDABLE_TEXT_LENGTH = 220;

/**
 * Renders long fantasy copy with a parchment-style expand / collapse affordance.
 */
export default function ExpandableLoreText({
    text,
    collapsedLines = DEFAULT_COLLAPSED_LINES,
    testID,
}: ExpandableLoreTextProps) {
    const [expanded, setExpanded] = useState(false);
    const shouldTruncate = text.trim().length > MIN_EXPANDABLE_TEXT_LENGTH;

    return (
        <View style={styles.container} testID={testID}>
            <Text
                style={styles.body}
                numberOfLines={expanded || !shouldTruncate ? undefined : collapsedLines}
            >
                {text}
            </Text>

            {shouldTruncate ? (
                <View style={styles.footer}>
                    <Pressable
                        onPress={() => setExpanded((currentValue) => !currentValue)}
                        accessibilityRole="button"
                        accessibilityLabel={expanded ? 'Show less subclass description' : 'Read more subclass description'}
                        testID={expanded ? 'expandable-lore-read-less' : 'expandable-lore-read-more'}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            {expanded ? 'Read less' : 'Read more'}
                        </Text>
                    </Pressable>
                </View>
            ) : null}
        </View>
    );
}

/**
 * Styles for the expandable lore block.
 */
const styles = StyleSheet.create({
    container: {
        gap: fantasyTokens.spacing.sm,
    },
    body: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkLight,
        lineHeight: 24,
    },
    footer: {
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.sm,
    },
    button: {
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(140,29,56,0.26)',
        backgroundColor: 'rgba(140,29,56,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    buttonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
});
