import { StyleSheet, type ViewStyle } from 'react-native';
import { fantasyTokens } from '@/theme/fantasyTheme';

/**
 * Resolves the shared responsive width for primary page content.
 */
export function getMainContentFrameStyle(width: number): ViewStyle {
    if (width >= fantasyTokens.breakpoints.laptop) {
        return frameStyles.laptop;
    }

    if (width >= fantasyTokens.breakpoints.tablet) {
        return frameStyles.tablet;
    }

    return frameStyles.phone;
}

/**
 * Offsets portaled overlays so they align with the rail content column on wider layouts.
 */
export function getBottomSheetSlotStyle(width: number): ViewStyle {
    const showPersistentRail = width >= fantasyTokens.breakpoints.tablet;

    return {
        width: '100%',
        minWidth: 0,
        alignItems: 'center',
        paddingLeft: showPersistentRail ? fantasyTokens.rail.collapsedWidth : 0,
    };
}

const frameStyles = StyleSheet.create({
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
