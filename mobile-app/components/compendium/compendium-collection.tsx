import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn, ReduceMotion, SlideInRight } from 'react-native-reanimated';
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
    const selectedItem = collection.items.find(
        (item) => item.value === collection.selectedValue,
    ) ?? null;

    useCompendiumDeepLink({
        items: collection.items,
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
                        entering={FadeIn
                            .duration(fantasyTokens.motion.quick)
                            .reduceMotion(ReduceMotion.System)}
                        style={styles.flex}
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
                        entering={SlideInRight
                            .duration(fantasyTokens.motion.standard)
                            .reduceMotion(ReduceMotion.System)}
                        style={styles.flex}
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
    flex: {
        flex: 1,
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
