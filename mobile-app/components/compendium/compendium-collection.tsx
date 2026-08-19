import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
    useReducedMotion,
    withTiming,
    type EntryExitAnimationFunction,
} from 'react-native-reanimated';
import CompendiumBackButton from '@/components/compendium/compendium-back-button';
import CompendiumCollectionList from '@/components/compendium/compendium-collection-list';
import type {
    CompendiumCollectionItem,
    CompendiumCollectionProps,
} from '@/components/compendium/compendium-collection.types';
import CompendiumDetailBackBar from '@/components/compendium/compendium-detail-back-bar';
import {
    CompendiumDetailScrollContext,
    useCompendiumDetailScrollController,
} from '@/components/compendium/compendium-detail-scroll';
import CompendiumScreenHeader from '@/components/compendium/compendium-screen-header';
import useCompendiumDeepLink from '@/components/compendium/use-compendium-deep-link';
import { fantasyTokens } from '@/theme/fantasyTheme';

export type { CompendiumCollectionItem } from '@/components/compendium/compendium-collection.types';

const DETAIL_CONTENT_PADDING = fantasyTokens.spacing.lg;

const PANEL_ENTER_DURATION = fantasyTokens.motion.quick;
const PANEL_EXIT_DURATION = Math.round(fantasyTokens.motion.quick * 0.75);
/** Just enough travel to hint direction; the stack push owns the full-width motion. */
const PANEL_ENTER_OFFSET = 16;

/** Builds a cross-fade entrance that drifts in from `offset` px along the x axis. */
function makePanelEnter(offset: number): EntryExitAnimationFunction {
    return () => {
        'worklet';
        return {
            initialValues: { opacity: 0, transform: [{ translateX: offset }] },
            animations: {
                opacity: withTiming(1, { duration: PANEL_ENTER_DURATION }),
                transform: [{ translateX: withTiming(0, { duration: PANEL_ENTER_DURATION }) }],
            },
        };
    };
}

const enterFromRight = makePanelEnter(PANEL_ENTER_OFFSET);
const enterFromLeft = makePanelEnter(-PANEL_ENTER_OFFSET);

/** Outgoing panel only fades, and faster than the incoming one arrives. */
const exitPanel: EntryExitAnimationFunction = () => {
    'worklet';
    return {
        initialValues: { opacity: 1 },
        animations: { opacity: withTiming(0, { duration: PANEL_EXIT_DURATION }) },
    };
};

/** Shared list/detail shell for browse-only Compendium categories. */
export default function CompendiumCollection<T extends CompendiumCollectionItem>({
    heading,
    filters,
    collection,
    empty,
    row,
    renderDetail,
}: CompendiumCollectionProps<T>) {
    const { scrollRef, api } = useCompendiumDetailScrollController();
    const selectedItem = collection.allItems.find(
        (item) => item.value === collection.selectedValue,
    ) ?? null;

    const reducedMotion = useReducedMotion();
    // The stack push already animates the first paint, so only animate later swaps.
    const hasMounted = useRef(false);
    useEffect(() => {
        hasMounted.current = true;
    }, []);
    const animatePanels = hasMounted.current && !reducedMotion;

    useCompendiumDeepLink({
        items: collection.allItems,
        loading: collection.loading ?? false,
        errorMessage: collection.error?.message,
        onSelect: collection.onSelectedValueChange,
    });

    function handleDetailBodyLayout(event: LayoutChangeEvent) {
        api.registerContentOffset(event.nativeEvent.layout.y);
    }

    return (
        <View style={styles.container}>
            <CompendiumScreenHeader
                eyebrow="Compendium"
                title={heading.title}
                leading={<CompendiumBackButton />}
            />
            <View style={styles.card}>
                {selectedItem == null ? (
                    <Animated.View
                        entering={animatePanels ? enterFromLeft : undefined}
                        exiting={animatePanels ? exitPanel : undefined}
                        style={styles.panel}
                    >
                        <CompendiumCollectionList
                            noun={heading.noun}
                            filters={filters}
                            collection={collection}
                            empty={empty}
                            row={row}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={animatePanels ? enterFromRight : undefined}
                        exiting={animatePanels ? exitPanel : undefined}
                        style={styles.panel}
                    >
                        <CompendiumDetailScrollContext.Provider value={api}>
                            <ScrollView
                                ref={scrollRef}
                                contentInsetAdjustmentBehavior="automatic"
                                contentContainerStyle={styles.detailContent}
                                testID="compendium-detail-scroll"
                            >
                                <CompendiumDetailBackBar
                                    title={selectedItem.name}
                                    accessibilityLabel={`Back to all ${heading.noun}s`}
                                    onBack={() => collection.onSelectedValueChange(null)}
                                    bleed={DETAIL_CONTENT_PADDING}
                                    testID="compendium-detail-back"
                                />
                                <View
                                    collapsable={false}
                                    onLayout={handleDetailBodyLayout}
                                    style={styles.detailBody}
                                    testID="compendium-detail-body"
                                >
                                    {renderDetail(selectedItem)}
                                </View>
                            </ScrollView>
                        </CompendiumDetailScrollContext.Provider>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    // Absolute so the outgoing panel can overlap the incoming one mid-cross-fade
    // instead of the two splitting the card's height.
    panel: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        flex: 1,
        margin: fantasyTokens.spacing.md,
        marginTop: fantasyTokens.spacing.sm,
        overflow: 'hidden',
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.colors.parchment,
    },
    detailContent: {
        padding: DETAIL_CONTENT_PADDING,
        gap: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xxl,
    },
    detailBody: {
        gap: fantasyTokens.spacing.md,
    },
});
