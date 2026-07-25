import { StyleSheet, Text, View } from 'react-native';
import CompendiumBackControl, {
    COMPENDIUM_BACK_SLOT_WIDTH,
} from '@/components/compendium/compendium-back-control';
import { fantasyTokens } from '@/theme/fantasyTheme';

type CompendiumDetailBackBarProps = {
    title?: string | null;
    accessibilityLabel: string;
    onBack: () => void;
    testID?: string;
    /**
     * Padding the bar must bleed past so it spans the full parchment card.
     * Pass the horizontal/top padding of the container rendering the bar;
     * defaults to the shared detail padding.
     */
    bleed?: number;
};

/** Lines allowed for the title so long custom names are not clipped. */
const TITLE_LINES = 2;

/**
 * Parchment detail chrome: F3 ink back control with an optional centred title.
 * The bar bleeds to the card edges, so its container's padding must be passed
 * as `bleed` whenever it differs from the default.
 */
export default function CompendiumDetailBackBar({
    title,
    accessibilityLabel,
    onBack,
    testID,
    bleed = fantasyTokens.spacing.lg,
}: CompendiumDetailBackBarProps) {
    return (
        <View style={[styles.bar, { marginHorizontal: -bleed, marginTop: -bleed }]}>
            <CompendiumBackControl
                accessibilityLabel={accessibilityLabel}
                tone="ink"
                onPress={onBack}
                testID={testID}
            />
            <Text style={styles.title} numberOfLines={TITLE_LINES}>
                {title ?? ''}
            </Text>
            <View style={styles.spacer} />
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    title: {
        flex: 1,
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        fontWeight: '700',
        textAlign: 'center',
    },
    spacer: {
        width: COMPENDIUM_BACK_SLOT_WIDTH,
    },
});
