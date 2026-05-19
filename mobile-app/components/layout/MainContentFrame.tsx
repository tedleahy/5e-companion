import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

type MainContentFrameProps = {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
};

/**
 * Resolves the shared responsive width for primary page content.
 */
function getMainContentFrameStyle(width: number): ViewStyle {
    if (width >= fantasyTokens.breakpoints.laptop) {
        return styles.laptop;
    }

    if (width >= fantasyTokens.breakpoints.tablet) {
        return styles.tablet;
    }

    return styles.phone;
}

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
    phone: {
        maxWidth: '100%',
    },
    tablet: {
        maxWidth: '90%',
        marginHorizontal: 'auto',
        alignSelf: 'center',
    },
    laptop: {
        maxWidth: '80%',
        marginHorizontal: 'auto',
        alignSelf: 'center',
    },
});
