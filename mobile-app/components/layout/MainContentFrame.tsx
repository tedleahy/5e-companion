import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { getMainContentFrameStyle } from '@/components/layout/mainContentFrameStyle';

type MainContentFrameProps = {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
};

/**
 * Centres and constrains the main page content at tablet and laptop widths.
 */
export default function MainContentFrame({ children, style }: MainContentFrameProps) {
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.frame, getMainContentFrameStyle(width), style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    frame: {
        width: '100%',
        minWidth: 0,
    },
});
