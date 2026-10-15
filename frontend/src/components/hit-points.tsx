import { StyleSheet, Text, View } from 'react-native';

import type { HitPointDisplay } from '@/characters/display';
import { colors, fonts, typography } from '@/theme';

/** The meter always has ten segments; `hitPoints()` decides how many are filled. */
const SEGMENTS = Array.from({ length: 10 }, (_, index) => index);

/**
 * A character's hit point meter and the line under it, from `hitPoints()`. The meter never shows
 * without its line. Screen readers skip the meter and read the line.
 */
export function HitPoints({ display }: { display: HitPointDisplay }) {
    const { meter, line } = display;
    const fill = meter?.hurt ? colors.accent : colors.structural;

    return (
        <View>
            {meter && (
                <View aria-hidden style={styles.meter}>
                    {SEGMENTS.map((index) => (
                        <View
                            key={index}
                            testID="hit-point-segment"
                            style={[
                                styles.segment,
                                { backgroundColor: index < meter.filled ? fill : colors.track },
                            ]}
                        />
                    ))}
                </View>
            )}
            <Text style={[typography.hitPointLine, styles.line, meter && styles.lineUnderMeter]}>
                {line.current !== null && (
                    <Text style={[styles.current, meter?.hurt && styles.currentHurt]}>
                        {line.current}
                    </Text>
                )}
                {line.rest}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    meter: {
        flexDirection: 'row',
        gap: 2,
    },
    segment: {
        flex: 1,
        height: 13,
    },
    line: {
        color: colors.dim,
    },
    lineUnderMeter: {
        marginTop: 5,
    },
    current: {
        fontFamily: fonts.bold,
        color: colors.structural,
    },
    currentHurt: {
        color: colors.accentText,
    },
});
