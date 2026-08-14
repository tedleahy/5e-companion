import { useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion, SlideInRight } from 'react-native-reanimated';
import FilterSwitch from '@/components/FilterSwitch';
import ListSkeletonRows from '@/components/ListSkeletonRows';
import SearchBarInput from '@/components/SearchBarInput';
import CompendiumBackButton from '@/components/compendium/compendium-back-button';
import CompendiumCollectionRow from '@/components/compendium/compendium-collection-row';
import CompendiumDetailBackBar from '@/components/compendium/compendium-detail-back-bar';
import CompendiumScreenHeader from '@/components/compendium/compendium-screen-header';
import { fantasyTokens } from '@/theme/fantasyTheme';

export type CompendiumCollectionItem = {
    value: string;
    name: string;
    isCustom: boolean;
};

type CompendiumCollectionProps<T extends CompendiumCollectionItem> = {
    title: string;
    noun: string;
    searchPlaceholder: string;
    searchText: string;
    onSearchTextChange: (text: string) => void;
    showSrd: boolean;
    onShowSrdChange: (next: boolean) => void;
    filters?: ReactNode;
    categoryFiltersActive?: boolean;
    onClearCategoryFilters?: () => void;
    items: T[];
    selectedValue: string | null;
    onSelectedValueChange: (value: string | null) => void;
    renderMark: (item: T) => ReactNode;
    renderMeta: (item: T) => ReactNode;
    renderRowExtra?: (item: T) => ReactNode;
    renderDetail: (item: T) => ReactNode;
    emptyTitle: string;
    emptyBody: string;
    loading?: boolean;
    errorMessage?: string | null;
    onRetry?: () => void;
};

const DETAIL_CONTENT_PADDING = fantasyTokens.spacing.lg;

function firstParamValue(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

/**
 * Shared list/detail shell for browse-only Compendium categories.
 * Category screens own filtering and domain presentation; this component owns
 * the common controls, states, row chrome, navigation, and transitions.
 */
export default function CompendiumCollection<T extends CompendiumCollectionItem>({
    title,
    noun,
    searchPlaceholder,
    searchText,
    onSearchTextChange,
    showSrd,
    onShowSrdChange,
    filters,
    categoryFiltersActive = false,
    onClearCategoryFilters,
    items,
    selectedValue,
    onSelectedValueChange,
    renderMark,
    renderMeta,
    renderRowExtra,
    renderDetail,
    emptyTitle,
    emptyBody,
    loading = false,
    errorMessage,
    onRetry,
}: CompendiumCollectionProps<T>) {
    const params = useLocalSearchParams<{ value?: string | string[] }>();
    const requestedValue = firstParamValue(params.value);
    const appliedRequestedValue = useRef<string | undefined>(undefined);
    const selectedItem = items.find((item) => item.value === selectedValue) ?? null;
    const filtersActive = searchText.trim().length > 0 || !showSrd || categoryFiltersActive;
    const pluralNoun = items.length === 1 ? noun : `${noun}s`;

    useEffect(() => {
        if (requestedValue == null) {
            appliedRequestedValue.current = undefined;
            return;
        }
        if (
            loading
            || (errorMessage != null && items.length === 0)
            || appliedRequestedValue.current === requestedValue
        ) return;

        appliedRequestedValue.current = requestedValue;
        if (items.some((item) => item.value === requestedValue)) {
            onSelectedValueChange(requestedValue);
        }
    }, [errorMessage, items, loading, onSelectedValueChange, requestedValue]);

    function clearFilters() {
        if (searchText !== '') onSearchTextChange('');
        if (!showSrd) onShowSrdChange(true);
        onClearCategoryFilters?.();
    }

    return (
        <View style={styles.container}>
            <CompendiumScreenHeader
                eyebrow="Compendium"
                title={title}
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
                        <View style={styles.controls}>
                            <SearchBarInput
                                placeholder={searchPlaceholder}
                                searchText={searchText}
                                onChangeSearchText={onSearchTextChange}
                            />
                            <FilterSwitch
                                label={`Include SRD ${noun}s`}
                                value={showSrd}
                                onToggle={() => onShowSrdChange(!showSrd)}
                            />
                            {filters}
                            <View style={styles.resultsBar}>
                                <Text style={styles.resultsText}>{items.length} {pluralNoun} · A–Z</Text>
                                {filtersActive ? (
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel={`Clear ${noun} filters`}
                                        onPress={clearFilters}
                                        hitSlop={fantasyTokens.spacing.sm}
                                        testID="compendium-clear-filters"
                                    >
                                        <Text style={styles.clearLabel}>Clear filters</Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        </View>
                        <CollectionBody
                            noun={noun}
                            items={items}
                            loading={loading}
                            errorMessage={errorMessage}
                            onRetry={onRetry}
                            onReset={clearFilters}
                            emptyTitle={emptyTitle}
                            emptyBody={emptyBody}
                            renderMark={renderMark}
                            renderMeta={renderMeta}
                            renderRowExtra={renderRowExtra}
                            onSelect={onSelectedValueChange}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={SlideInRight
                            .duration(fantasyTokens.motion.standard)
                            .reduceMotion(ReduceMotion.System)}
                        style={styles.flex}
                    >
                        <ScrollView
                            contentInsetAdjustmentBehavior="automatic"
                            contentContainerStyle={styles.detailContent}
                        >
                            <CompendiumDetailBackBar
                                title={selectedItem.name}
                                accessibilityLabel={`Back to all ${noun}s`}
                                onBack={() => onSelectedValueChange(null)}
                                bleed={DETAIL_CONTENT_PADDING}
                                testID="compendium-detail-back"
                            />
                            {renderDetail(selectedItem)}
                        </ScrollView>
                    </Animated.View>
                )}
            </View>
        </View>
    );
}

type CollectionBodyProps<T extends CompendiumCollectionItem> = Pick<
    CompendiumCollectionProps<T>,
    'noun' | 'items' | 'loading' | 'errorMessage' | 'onRetry' | 'emptyTitle' | 'emptyBody'
    | 'renderMark' | 'renderMeta' | 'renderRowExtra'
> & {
    onReset: () => void;
    onSelect: (value: string) => void;
};

function CollectionBody<T extends CompendiumCollectionItem>({
    noun,
    items,
    loading,
    errorMessage,
    onRetry,
    onReset,
    emptyTitle,
    emptyBody,
    renderMark,
    renderMeta,
    renderRowExtra,
    onSelect,
}: CollectionBodyProps<T>) {
    if (loading && items.length === 0) {
        return (
            <View style={styles.flex} testID="compendium-collection-loading">
                <ListSkeletonRows />
            </View>
        );
    }

    if (errorMessage != null && items.length === 0) {
        return (
            <CollectionState
                title={`Unable to load ${noun}s`}
                body={errorMessage}
                actionLabel={onRetry == null ? undefined : 'Retry'}
                onAction={onRetry}
                testID="compendium-collection-error"
            />
        );
    }

    if (items.length === 0) {
        return (
            <CollectionState
                title={emptyTitle}
                body={emptyBody}
                actionLabel="Reset filters"
                onAction={onReset}
                testID="compendium-collection-empty"
            />
        );
    }

    return (
        <FlatList
            data={items}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
                <CompendiumCollectionRow
                    value={item.value}
                    name={item.name}
                    isCustom={item.isCustom}
                    mark={renderMark(item)}
                    meta={renderMeta(item)}
                    extra={renderRowExtra?.(item)}
                    onSelect={onSelect}
                    testID={`compendium-row-${item.value}`}
                />
            )}
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.listContent}
            style={styles.flex}
            keyboardShouldPersistTaps="handled"
            testID="compendium-collection-list"
        />
    );
}

type CollectionStateProps = {
    title: string;
    body: string;
    actionLabel?: string;
    onAction?: () => void;
    testID: string;
};

function CollectionState({ title, body, actionLabel, onAction, testID }: CollectionStateProps) {
    return (
        <View style={styles.state} testID={testID}>
            <View style={styles.seal}><Text style={styles.sealMark}>◇</Text></View>
            <Text style={styles.stateTitle}>{title}</Text>
            <Text style={styles.stateBody}>{body}</Text>
            {actionLabel != null && onAction != null ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onAction}
                    style={({ pressed }) => [styles.stateAction, pressed && styles.stateActionPressed]}
                >
                    <Text style={styles.stateActionLabel}>{actionLabel}</Text>
                </Pressable>
            ) : null}
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
    controls: {
        padding: fantasyTokens.spacing.md,
        paddingBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.accordionBorder,
    },
    resultsBar: {
        minHeight: fantasyTokens.spacing.xxl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
    },
    resultsText: {
        ...fantasyTokens.typography.eyebrow,
        color: fantasyTokens.colors.ember,
    },
    clearLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
    listContent: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xxl,
    },
    detailContent: {
        padding: DETAIL_CONTENT_PADDING,
        gap: fantasyTokens.spacing.md,
        paddingBottom: fantasyTokens.spacing.xxl,
    },
    state: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.xl,
    },
    seal: {
        width: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        height: fantasyTokens.spacing.xxl + fantasyTokens.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.goldDark,
        borderRadius: fantasyTokens.spacing.xxl,
    },
    sealMark: {
        ...fantasyTokens.typography.pageTitle,
        color: fantasyTokens.colors.claret,
    },
    stateTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        textAlign: 'center',
    },
    stateBody: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkSoft,
        textAlign: 'center',
    },
    stateAction: {
        marginTop: fantasyTokens.spacing.sm,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.sm,
    },
    stateActionPressed: {
        backgroundColor: fantasyTokens.colors.claretPressed,
    },
    stateActionLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
});
