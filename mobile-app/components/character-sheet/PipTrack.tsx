import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

type PipTrackProps = {
    count: number;
    filledCount: number;
    filledColor: string;
    emptyBorderColor: string;
    onPressPip?: (index: number) => void;
    getAccessibilityLabel?: (index: number) => string;
    getTestID?: (index: number) => string;
    filledBorderColor?: string;
    size?: number;
    gap?: number;
    borderWidth?: number;
    disabled?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    pipStyle?: StyleProp<ViewStyle>;
};

export default function PipTrack({
    count,
    filledCount,
    filledColor,
    emptyBorderColor,
    onPressPip,
    getAccessibilityLabel,
    getTestID,
    filledBorderColor,
    size = 14,
    gap = 6,
    borderWidth = 1.5,
    disabled = false,
    containerStyle,
    pipStyle,
}: PipTrackProps) {
    const isInteractive = Boolean(onPressPip) && !disabled;
    const pipBorderColor = filledBorderColor ?? filledColor;

    return (
        <View style={[styles.row, { gap }, containerStyle]}>
            {Array.from({ length: Math.max(0, count) }, (_, index) => {
                const isFilled = index < filledCount;

                return (
                    <Pressable
                        key={index}
                        onPress={() => onPressPip?.(index)}
                        disabled={!isInteractive}
                        accessibilityRole="button"
                        accessibilityLabel={getAccessibilityLabel?.(index)}
                        style={[
                            styles.pip,
                            pipStyle,
                            {
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                borderWidth,
                                borderColor: isFilled ? pipBorderColor : emptyBorderColor,
                                backgroundColor: isFilled ? filledColor : 'transparent',
                            },
                        ]}
                        testID={getTestID?.(index)}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    pip: {
        flexShrink: 0,
    },
});
