import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    Keyboard,
    useWindowDimensions,
    View,
} from 'react-native';
import { Snackbar, Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { gql } from '@apollo/client';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import FilterChipGroup from '@/components/FilterChipGroup';
import FilterSwitch from '@/components/FilterSwitch';
import { SPELL_LIST_FIELDS_FRAGMENT } from '@/graphql/spell.fragments';
import { toggleBooleanFilter, toggleFilterValue } from '@/lib/spellFilters';
import { fantasyTokens } from '@/theme/fantasyTheme';
import AddSpellBottomBar from './add-sheet/AddSpellBottomBar';
import AddSpellSectionList from './add-sheet/AddSpellSectionList';
import useAddSpellSelection from './add-sheet/useAddSpellSelection';
import SpellDetailModal from './SpellDetailModal';
import {
    ADD_SPELL_SCHOOL_OPTIONS,
    buildAddSpellFilterInput,
    CLASS_OPTIONS,
    COMPONENT_OPTIONS,
    countActiveFilters,
    defaultFilterForClass,
    LEVEL_OPTIONS,
    optionLabel,
    spellLevelLabel,
    type AddSpellFilterState,
} from './SpellFilterState';
import type { AddSpellDetail, AddSpellListItem, AddSpellSection } from './addSpell.types';

type AddSpellSheetProps = {
    visible: boolean;
    onClose: () => void;
    characterClass: string;
    knownSpellIds: string[];
    onSpellAdded: (spellId: string) => Promise<void>;
    onSpellRemoved: (spellId: string) => Promise<void>;
};

type ActiveFilterChip = {
    id: string;
    label: string;
    type: 'class' | 'level' | 'school' | 'component' | 'boolean';
    value: string;
};

type AddSpellSheetQueryData = {
    spells: AddSpellListItem[];
};

type AddSpellSheetQueryVariables = {
    filter?: Record<string, unknown>;
    pagination: {
        limit: number;
        offset: number;
    };
};

type AddSpellDetailQueryData = {
    spell: AddSpellDetail | null;
};

type AddSpellDetailQueryVariables = {
    id: string;
};

const SHEET_HEIGHT_PERCENTAGE = '92%';
const SEARCH_DEBOUNCE_MS = 300;
const MAX_SHEET_RESULTS = 500;
const SHEET_DISMISS_DRAG_DISTANCE = 88;
const DETAIL_DISMISS_DRAG_DISTANCE = 84;
const DISMISS_DRAG_VELOCITY = 800;
const SCROLL_TOP_TOLERANCE = 12;
const SHEET_HIDDEN_OFFSET = 48;
const DETAIL_HIDDEN_OFFSET = 48;

/**
 * Treats tiny initial scroll offsets as "still at the top" for dismiss gestures.
 */
function normaliseTopOffset(offsetY: number): number {
    if (offsetY <= SCROLL_TOP_TOLERANCE) return 0;
    return offsetY;
}

/**
 * GraphQL query used by the Add Spell sheet list.
 */
export const SEARCH_SPELLS_FOR_SHEET = gql`
    query AddSpellSheetSpells($filter: SpellFilter, $pagination: SpellPagination) {
        spells(filter: $filter, pagination: $pagination) {
            ...SpellListFields
            classIndexes
        }
    }
    ${SPELL_LIST_FIELDS_FRAGMENT}
`;

/**
 * GraphQL query for loading one spell's full details in the add-sheet modal.
 */
export const GET_SPELL_DETAIL_FOR_SHEET = gql`
    query AddSpellSheetSpellDetail($id: ID!) {
        spell(id: $id) {
            ...SpellListFields
            classIndexes
            description
            higherLevel
            components
            material
            duration
        }
    }
    ${SPELL_LIST_FIELDS_FRAGMENT}
`;

/**
 * Creates level-grouped sections for the add-sheet spell list.
 */
function groupSpellsByLevel(spells: AddSpellListItem[]): AddSpellSection[] {
    const grouped = new Map<number, AddSpellListItem[]>();

    for (const spell of spells) {
        const list = grouped.get(spell.level);
        if (list) {
            list.push(spell);
            continue;
        }

        grouped.set(spell.level, [spell]);
    }

    return Array.from(grouped.entries())
        .sort(([leftLevel], [rightLevel]) => leftLevel - rightLevel)
        .map(([level, levelSpells]) => ({
            title: spellLevelLabel(level),
            data: [...levelSpells].sort((leftSpell, rightSpell) => leftSpell.name.localeCompare(rightSpell.name)),
        }));
}

/**
 * Converts active filter state to removable filter-chip descriptors.
 */
function activeFilterChips(filters: AddSpellFilterState): ActiveFilterChip[] {
    const chips: ActiveFilterChip[] = [];

    for (const classKey of filters.classes) {
        chips.push({
            id: `class-${classKey}`,
            label: optionLabel(CLASS_OPTIONS, classKey),
            type: 'class',
            value: classKey,
        });
    }

    for (const level of filters.levels) {
        chips.push({
            id: `level-${level}`,
            label: spellLevelLabel(level),
            type: 'level',
            value: String(level),
        });
    }

    for (const school of filters.schools) {
        chips.push({
            id: `school-${school}`,
            label: optionLabel(ADD_SPELL_SCHOOL_OPTIONS, school),
            type: 'school',
            value: school,
        });
    }

    for (const component of filters.components) {
        chips.push({
            id: `component-${component}`,
            label: optionLabel(COMPONENT_OPTIONS, component),
            type: 'component',
            value: component,
        });
    }

    if (filters.ritual) {
        chips.push({ id: 'flag-ritual', label: 'Ritual', type: 'boolean', value: 'ritual' });
    }
    if (filters.concentration) {
        chips.push({ id: 'flag-concentration', label: 'Concentration', type: 'boolean', value: 'concentration' });
    }
    if (filters.hasHigherLevel) {
        chips.push({ id: 'flag-higher', label: 'Has Higher Level', type: 'boolean', value: 'hasHigherLevel' });
    }
    if (filters.hasMaterial) {
        chips.push({ id: 'flag-material', label: 'Requires Material', type: 'boolean', value: 'hasMaterial' });
    }

    return chips;
}

/**
 * Add Spell bottom sheet rendered over the character Spells tab.
 */
export default function AddSpellSheet({
    visible,
    onClose,
    characterClass,
    knownSpellIds,
    onSpellAdded,
    onSpellRemoved,
}: AddSpellSheetProps) {
    const apolloClient = useApolloClient();
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const sheetHiddenTranslateY = windowHeight + SHEET_HIDDEN_OFFSET;
    const detailHiddenTranslateY = windowHeight + DETAIL_HIDDEN_OFFSET;
    const [isRendered, setIsRendered] = useState(visible);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [appliedFilters, setAppliedFilters] = useState<AddSpellFilterState>(() => defaultFilterForClass(characterClass));
    const [draftFilters, setDraftFilters] = useState<AddSpellFilterState>(() => defaultFilterForClass(characterClass));
    const [filterPanelOpen, setFilterPanelOpen] = useState(false);
    const [selectedSpell, setSelectedSpell] = useState<AddSpellListItem | null>(null);
    const prefetchedSpellDetailIdsRef = useRef<Set<string>>(new Set());
    const {
        pendingSpellIds,
        sessionChangesCount,
        actionErrorMessage,
        isKnownSpell,
        clearActionErrorMessage,
        toggleSpellSelection,
    } = useAddSpellSelection({
        knownSpellIds,
        onSpellAdded,
        onSpellRemoved,
    });

    const sheetTranslateY = useRef(new Animated.Value(sheetHiddenTranslateY)).current;
    const sheetHiddenTranslateYRef = useRef(sheetHiddenTranslateY);
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const filterPanelTranslateX = useRef(new Animated.Value(windowWidth)).current;
    const detailOverlayOpacity = useRef(new Animated.Value(0)).current;
    const detailModalTranslateY = useRef(new Animated.Value(detailHiddenTranslateY)).current;
    const detailHiddenTranslateYRef = useRef(detailHiddenTranslateY);
    const spellListScrollOffsetYRef = useRef(0);
    const detailBodyScrollOffsetYRef = useRef(0);
    const sheetCloseInFlightRef = useRef(false);
    const detailCloseInFlightRef = useRef(false);

    const activeFilterCount = useMemo(() => countActiveFilters(appliedFilters), [appliedFilters]);
    const currentFilterChips = useMemo(() => activeFilterChips(appliedFilters), [appliedFilters]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery.trim());
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    useEffect(() => {
        sheetHiddenTranslateYRef.current = sheetHiddenTranslateY;
    }, [sheetHiddenTranslateY]);

    useEffect(() => {
        detailHiddenTranslateYRef.current = detailHiddenTranslateY;
    }, [detailHiddenTranslateY]);

    useEffect(() => {
        if (visible) return;
        prefetchedSpellDetailIdsRef.current.clear();
        spellListScrollOffsetYRef.current = 0;
        detailBodyScrollOffsetYRef.current = 0;
    }, [visible]);

    useEffect(() => {
        if (visible) {
            sheetCloseInFlightRef.current = false;
            detailCloseInFlightRef.current = false;
            spellListScrollOffsetYRef.current = 0;
            detailBodyScrollOffsetYRef.current = 0;
            setIsRendered(true);
            sheetTranslateY.setValue(sheetHiddenTranslateYRef.current);
            backdropOpacity.setValue(0);

            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 280,
                    useNativeDriver: true,
                }),
                Animated.timing(sheetTranslateY, {
                    toValue: 0,
                    duration: 320,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();

            return;
        }

        if (!isRendered) return;

        setFilterPanelOpen(false);
        setSelectedSpell(null);
        detailOverlayOpacity.setValue(0);
        detailModalTranslateY.setValue(detailHiddenTranslateYRef.current);

        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: sheetHiddenTranslateYRef.current,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsRendered(false);
        });
    }, [
        backdropOpacity,
        detailModalTranslateY,
        detailOverlayOpacity,
        isRendered,
        sheetTranslateY,
        visible,
    ]);

    useEffect(() => {
        Animated.spring(filterPanelTranslateX, {
            toValue: filterPanelOpen ? 0 : windowWidth,
            damping: 20,
            stiffness: 200,
            mass: 0.9,
            useNativeDriver: true,
        }).start();
    }, [filterPanelOpen, filterPanelTranslateX, windowWidth]);

    const filterInput = useMemo(() => {
        return buildAddSpellFilterInput(appliedFilters, debouncedSearchQuery);
    }, [appliedFilters, debouncedSearchQuery]);

    const queryVariables = useMemo<AddSpellSheetQueryVariables>(() => ({
        pagination: {
            limit: MAX_SHEET_RESULTS,
            offset: 0,
        },
        ...(filterInput ? { filter: filterInput } : {}),
    }), [filterInput]);

    const { data, loading, error } = useQuery<AddSpellSheetQueryData, AddSpellSheetQueryVariables>(SEARCH_SPELLS_FOR_SHEET, {
        variables: queryVariables,
        skip: !visible,
        notifyOnNetworkStatusChange: true,
    });

    const {
        data: selectedSpellDetailData,
        loading: selectedSpellDetailLoading,
        error: selectedSpellDetailError,
        refetch: refetchSelectedSpellDetail,
    } = useQuery<AddSpellDetailQueryData, AddSpellDetailQueryVariables>(GET_SPELL_DETAIL_FOR_SHEET, {
        variables: {
            id: selectedSpell?.id ?? '',
        },
        skip: selectedSpell == null,
        fetchPolicy: 'cache-first',
        nextFetchPolicy: 'cache-first',
    });

    const selectedSpellDetail = useMemo(() => {
        if (!selectedSpell) return null;

        const detailSpell = selectedSpellDetailData?.spell;
        if (!detailSpell) return null;
        if (detailSpell.id !== selectedSpell.id) return null;

        return detailSpell;
    }, [selectedSpell, selectedSpellDetailData?.spell]);

    const spells = useMemo(() => {
        const allSpells = data?.spells ?? [];

        if (appliedFilters.schools.length === 0) {
            return allSpells;
        }

        const selectedSchools = new Set(appliedFilters.schools);
        return allSpells.filter((spell) => selectedSchools.has(spell.schoolIndex));
    }, [appliedFilters.schools, data?.spells]);

    const sections = useMemo(() => groupSpellsByLevel(spells), [spells]);

    const handleOpenFilterPanel = useCallback(() => {
        setDraftFilters(appliedFilters);
        setFilterPanelOpen(true);
    }, [appliedFilters]);

    const handleCloseFilterPanel = useCallback(() => {
        setFilterPanelOpen(false);
    }, []);

    const handleApplyFilters = useCallback(() => {
        setAppliedFilters(draftFilters);
        setFilterPanelOpen(false);
    }, [draftFilters]);

    const handleClearDraftFilters = useCallback(() => {
        setDraftFilters(defaultFilterForClass(characterClass));
    }, [characterClass]);

    /**
     * Warms Apollo cache for spell details before the full press completes.
     */
    const handlePrefetchSpellDetail = useCallback((spellId: string) => {
        if (prefetchedSpellDetailIdsRef.current.has(spellId)) return;

        prefetchedSpellDetailIdsRef.current.add(spellId);

        void apolloClient.query<AddSpellDetailQueryData, AddSpellDetailQueryVariables>({
            query: GET_SPELL_DETAIL_FOR_SHEET,
            variables: { id: spellId },
            fetchPolicy: 'cache-first',
        }).catch(() => {
            prefetchedSpellDetailIdsRef.current.delete(spellId);
        });
    }, [apolloClient]);

    const openSpellDetail = useCallback((spell: AddSpellListItem) => {
        detailCloseInFlightRef.current = false;
        detailOverlayOpacity.setValue(0);
        detailModalTranslateY.setValue(detailHiddenTranslateY);
        detailBodyScrollOffsetYRef.current = 0;
        setSelectedSpell(spell);
    }, [detailHiddenTranslateY, detailModalTranslateY, detailOverlayOpacity]);

    /**
     * Retries the currently open spell detail query.
     */
    const handleRetrySpellDetail = useCallback(() => {
        if (!selectedSpell) return;
        void refetchSelectedSpellDetail({ id: selectedSpell.id });
    }, [refetchSelectedSpellDetail, selectedSpell]);

    const animateSheetBack = useCallback(() => {
        Animated.parallel([
            Animated.timing(sheetTranslateY, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [backdropOpacity, sheetTranslateY]);

    const animateDetailBack = useCallback(() => {
        Animated.parallel([
            Animated.timing(detailModalTranslateY, {
                toValue: 0,
                duration: 180,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(detailOverlayOpacity, {
                toValue: 0.55,
                duration: 180,
                useNativeDriver: true,
            }),
        ]).start();
    }, [detailModalTranslateY, detailOverlayOpacity]);

    /**
     * Applies live drag positioning to the main sheet.
     */
    const updateSheetDragPosition = useCallback((translationY: number) => {
        sheetTranslateY.setValue(translationY);
        const nextBackdropOpacity = Math.max(0, 1 - (translationY / 420));
        backdropOpacity.setValue(nextBackdropOpacity);
    }, [backdropOpacity, sheetTranslateY]);

    /**
     * Applies live drag positioning to the nested spell-detail sheet.
     */
    const updateDetailDragPosition = useCallback((translationY: number) => {
        detailModalTranslateY.setValue(translationY);
        const nextOverlayOpacity = Math.max(0, 0.55 - (translationY / 560));
        detailOverlayOpacity.setValue(nextOverlayOpacity);
    }, [detailModalTranslateY, detailOverlayOpacity]);

    const closeSpellDetail = useCallback(() => {
        if (detailCloseInFlightRef.current) return;

        detailCloseInFlightRef.current = true;
        Animated.parallel([
            Animated.timing(detailOverlayOpacity, {
                toValue: 0,
                duration: 220,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(detailModalTranslateY, {
                toValue: detailHiddenTranslateY,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            detailCloseInFlightRef.current = false;
            detailBodyScrollOffsetYRef.current = 0;
            setSelectedSpell(null);
        });
    }, [detailHiddenTranslateY, detailModalTranslateY, detailOverlayOpacity]);

    const requestSheetClose = useCallback(() => {
        if (sheetCloseInFlightRef.current || !isRendered) return;

        sheetCloseInFlightRef.current = true;
        setFilterPanelOpen(false);
        setSelectedSpell(null);
        detailOverlayOpacity.setValue(0);
        detailModalTranslateY.setValue(detailHiddenTranslateYRef.current);
        spellListScrollOffsetYRef.current = 0;
        detailBodyScrollOffsetYRef.current = 0;

        Animated.parallel([
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(sheetTranslateY, {
                toValue: sheetHiddenTranslateYRef.current,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start(() => {
            sheetCloseInFlightRef.current = false;
            setIsRendered(false);
            onClose();
        });
    }, [
        backdropOpacity,
        detailModalTranslateY,
        detailOverlayOpacity,
        isRendered,
        onClose,
        sheetTranslateY,
    ]);

    useEffect(() => {
        if (!selectedSpell) return;

        const animationFrameId = requestAnimationFrame(() => {
            Animated.parallel([
                Animated.timing(detailOverlayOpacity, {
                    toValue: 0.55,
                    duration: 280,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(detailModalTranslateY, {
                    toValue: 0,
                    duration: 320,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [detailModalTranslateY, detailOverlayOpacity, selectedSpell]);

    /**
     * Native pan gesture for dismissing the main add-spell sheet.
     * This lives in the same native gesture system as ScrollView/SectionList.
     */
    const sheetDismissGesture = useMemo(() => Gesture.Pan()
        .runOnJS(true)
        .activeOffsetY(6)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
            if (sheetCloseInFlightRef.current) return;
            if (spellListScrollOffsetYRef.current > SCROLL_TOP_TOLERANCE) return;
            if (event.translationY <= 0) return;

            updateSheetDragPosition(event.translationY);
        })
        .onEnd((event) => {
            if (sheetCloseInFlightRef.current) return;

            const shouldDismiss =
                spellListScrollOffsetYRef.current <= SCROLL_TOP_TOLERANCE
                && event.translationY > 0
                && (event.translationY > SHEET_DISMISS_DRAG_DISTANCE || event.velocityY > DISMISS_DRAG_VELOCITY);

            if (shouldDismiss) {
                requestSheetClose();
                return;
            }

            animateSheetBack();
        })
        .onFinalize(() => {
            if (sheetCloseInFlightRef.current) return;
            animateSheetBack();
        }), [animateSheetBack, requestSheetClose, updateSheetDragPosition]);

    /**
     * Native pan gesture for dismissing the nested spell-detail sheet.
     */
    const detailDismissGesture = useMemo(() => Gesture.Pan()
        .runOnJS(true)
        .activeOffsetY(6)
        .failOffsetX([-24, 24])
        .onUpdate((event) => {
            if (detailCloseInFlightRef.current) return;
            if (detailBodyScrollOffsetYRef.current > SCROLL_TOP_TOLERANCE) return;
            if (event.translationY <= 0) return;

            updateDetailDragPosition(event.translationY);
        })
        .onEnd((event) => {
            if (detailCloseInFlightRef.current) return;

            const shouldDismiss =
                detailBodyScrollOffsetYRef.current <= SCROLL_TOP_TOLERANCE
                && event.translationY > 0
                && (event.translationY > DETAIL_DISMISS_DRAG_DISTANCE || event.velocityY > DISMISS_DRAG_VELOCITY);

            if (shouldDismiss) {
                closeSpellDetail();
                return;
            }

            animateDetailBack();
        })
        .onFinalize(() => {
            if (detailCloseInFlightRef.current) return;
            animateDetailBack();
        }), [animateDetailBack, closeSpellDetail, updateDetailDragPosition]);

    const handleSpellListScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        spellListScrollOffsetYRef.current = normaliseTopOffset(event.nativeEvent.contentOffset.y);
    }, []);

    const handleDetailBodyScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        detailBodyScrollOffsetYRef.current = normaliseTopOffset(event.nativeEvent.contentOffset.y);
    }, []);


    const handleRemoveActiveFilterChip = useCallback((chip: ActiveFilterChip) => {
        setAppliedFilters((previousFilters) => {
            if (chip.type === 'class') {
                return {
                    ...previousFilters,
                    classes: previousFilters.classes.filter((classValue) => classValue !== chip.value),
                };
            }

            if (chip.type === 'level') {
                return {
                    ...previousFilters,
                    levels: previousFilters.levels.filter((level) => String(level) !== chip.value),
                };
            }

            if (chip.type === 'school') {
                return {
                    ...previousFilters,
                    schools: previousFilters.schools.filter((school) => school !== chip.value),
                };
            }

            if (chip.type === 'component') {
                return {
                    ...previousFilters,
                    components: previousFilters.components.filter((component) => component !== chip.value),
                };
            }

            if (chip.value === 'ritual') {
                return { ...previousFilters, ritual: undefined };
            }
            if (chip.value === 'concentration') {
                return { ...previousFilters, concentration: undefined };
            }
            if (chip.value === 'hasHigherLevel') {
                return { ...previousFilters, hasHigherLevel: undefined };
            }

            return { ...previousFilters, hasMaterial: undefined };
        });
    }, []);

    if (!isRendered) {
        return null;
    }

    return (
        <View style={styles.overlayContainer} pointerEvents="box-none">
            <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                <Pressable style={styles.backdropPressable} onPress={requestSheetClose} accessibilityLabel="Close add spell sheet" />
            </Animated.View>

            <GestureDetector gesture={sheetDismissGesture}>
                <Animated.View
                    style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}
                    onStartShouldSetResponderCapture={() => {
                        Keyboard.dismiss();
                        return false;
                    }}
                >
                <View style={styles.headerDragZone}>
                    <View style={styles.handleRow}>
                        <View style={styles.handle} />
                    </View>

                    <View style={styles.titleRow}>
                        <View>
                            <Text style={styles.title}>Add Spell</Text>
                            <Text style={styles.subtitle}>Choose spells to add to your spellbook</Text>
                        </View>
                    </View>

                    <View style={styles.searchFilterRow}>
                        <View style={styles.searchWrapper}>
                            <Ionicons name="search" size={14} color="rgba(245,230,200,0.35)" />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search spells..."
                                placeholderTextColor="rgba(245,230,200,0.28)"
                                style={styles.searchInput}
                                accessibilityLabel="Search spells"
                            />
                            <Pressable
                                onPress={() => setSearchQuery('')}
                                accessibilityRole="button"
                                accessibilityLabel="Clear spell search"
                                style={styles.clearSearchButton}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={16}
                                    color={searchQuery.length > 0 ? 'rgba(245,230,200,0.58)' : 'rgba(245,230,200,0.2)'}
                                />
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={handleOpenFilterPanel}
                            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
                            accessibilityLabel="Open spell filters"
                        >
                            <Ionicons name="filter" size={14} color="rgba(245,230,200,0.45)" />
                            <Text style={styles.filterButtonText}>Filter</Text>
                            {activeFilterCount > 0 && (
                                <View style={styles.filterCountBadge}>
                                    <Text style={styles.filterCountText}>{activeFilterCount}</Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                </View>

                {currentFilterChips.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.activeChipsScroll}
                        contentContainerStyle={styles.activeChipsRow}
                    >
                        {currentFilterChips.map((chip) => (
                            <View key={chip.id} style={styles.activeChip}>
                                <Text style={styles.activeChipText}>{chip.label}</Text>
                                <Pressable onPress={() => handleRemoveActiveFilterChip(chip)} accessibilityLabel={`Remove ${chip.label} filter`}>
                                    <Text style={styles.activeChipRemove}>x</Text>
                                </Pressable>
                            </View>
                        ))}
                    </ScrollView>
                )}

                <View style={styles.divider} />

                <AddSpellSectionList
                    sections={sections}
                    loading={loading}
                    errorMessage={error?.message}
                    isKnownSpell={isKnownSpell}
                    pendingSpellIds={pendingSpellIds}
                    onToggleSpellSelection={(spell) => {
                        void toggleSpellSelection(spell);
                    }}
                    onPrefetchSpellDetail={handlePrefetchSpellDetail}
                    onOpenSpellDetail={openSpellDetail}
                    onScroll={handleSpellListScroll}
                />

                <AddSpellBottomBar sessionChangesCount={sessionChangesCount} onDone={requestSheetClose} />

                <Animated.View style={[styles.filterPanel, { transform: [{ translateX: filterPanelTranslateX }] }]}>
                    <View style={styles.filterPanelHeader}>
                        <Pressable onPress={handleCloseFilterPanel} accessibilityLabel="Back to spell list">
                            <Text style={styles.filterBackText}>Back</Text>
                        </Pressable>
                        <Text style={styles.filterPanelTitle}>Filters</Text>
                        <Pressable onPress={handleClearDraftFilters} accessibilityLabel="Clear all filters">
                            <Text style={styles.filterClearText}>Clear</Text>
                        </Pressable>
                    </View>

                    <ScrollView style={styles.filterScroll} contentContainerStyle={styles.filterScrollContent}>
                        <FilterChipGroup
                            label="Class"
                            options={CLASS_OPTIONS}
                            selected={draftFilters.classes}
                            onToggle={(classKey) => {
                                setDraftFilters((previousFilters) => ({
                                    ...previousFilters,
                                    classes: toggleFilterValue(previousFilters.classes, classKey),
                                }));
                            }}
                        />

                        <FilterChipGroup
                            label="Level"
                            options={LEVEL_OPTIONS}
                            selected={draftFilters.levels.map(String)}
                            onToggle={(levelKey) => {
                                const level = Number(levelKey);

                                setDraftFilters((previousFilters) => ({
                                    ...previousFilters,
                                    levels: toggleFilterValue(previousFilters.levels, level),
                                }));
                            }}
                        />

                        <FilterSwitch
                            label="Ritual only"
                            value={draftFilters.ritual === true}
                            onToggle={() => {
                                setDraftFilters((previousFilters) => ({
                                    ...previousFilters,
                                    ritual: toggleBooleanFilter(previousFilters.ritual),
                                }));
                            }}
                        />

                        <FilterSwitch
                            label="Concentration"
                            value={draftFilters.concentration === true}
                            onToggle={() => {
                                setDraftFilters((previousFilters) => ({
                                    ...previousFilters,
                                    concentration: toggleBooleanFilter(previousFilters.concentration),
                                }));
                            }}
                        />

                        <FilterSwitch
                            label="Has higher level"
                            value={draftFilters.hasHigherLevel === true}
                            onToggle={() => {
                                setDraftFilters((previousFilters) => ({
                                    ...previousFilters,
                                    hasHigherLevel: toggleBooleanFilter(previousFilters.hasHigherLevel),
                                }));
                            }}
                        />

                        <FilterSwitch
                            label="Requires material"
                            value={draftFilters.hasMaterial === true}
                            onToggle={() => {
                                setDraftFilters((previousFilters) => ({
                                    ...previousFilters,
                                    hasMaterial: toggleBooleanFilter(previousFilters.hasMaterial),
                                }));
                            }}
                        />

                        <FilterChipGroup
                            label="Components"
                            options={COMPONENT_OPTIONS}
                            selected={draftFilters.components}
                            onToggle={(component) => {
                                setDraftFilters((previousFilters) => ({
                                    ...previousFilters,
                                    components: toggleFilterValue(previousFilters.components, component),
                                }));
                            }}
                        />

                        <FilterChipGroup
                            label="School"
                            options={ADD_SPELL_SCHOOL_OPTIONS}
                            selected={draftFilters.schools}
                            onToggle={(school) => {
                                setDraftFilters((previousFilters) => ({
                                    ...previousFilters,
                                    schools: toggleFilterValue(previousFilters.schools, school),
                                }));
                            }}
                        />
                    </ScrollView>

                    <View style={styles.filterApplyWrap}>
                        <Pressable onPress={handleApplyFilters} style={styles.filterApplyButton} accessibilityLabel="Show filtered spell results">
                            <Text style={styles.filterApplyButtonText}>Show Results</Text>
                        </Pressable>
                    </View>
                </Animated.View>

                {selectedSpell && (
                    <>
                        <Animated.View style={[styles.detailBackdrop, { opacity: detailOverlayOpacity }]}>
                            <Pressable style={styles.backdropPressable} onPress={closeSpellDetail} accessibilityLabel="Close spell details" />
                        </Animated.View>

                        <GestureDetector gesture={detailDismissGesture}>
                            <Animated.View style={[styles.detailModalWrap, { transform: [{ translateY: detailModalTranslateY }] }]}>
                                <SpellDetailModal
                                    spell={selectedSpellDetail}
                                    spellName={selectedSpell.name}
                                    known={isKnownSpell(selectedSpell.id)}
                                    loading={selectedSpellDetailLoading && selectedSpellDetail == null}
                                    errorMessage={selectedSpellDetailError?.message}
                                    onRetry={handleRetrySpellDetail}
                                    onToggleSelection={() => {
                                        void toggleSpellSelection(selectedSpell);
                                    }}
                                    onBodyScroll={handleDetailBodyScroll}
                                />
                            </Animated.View>
                        </GestureDetector>
                    </>
                )}

                <Snackbar
                    visible={actionErrorMessage != null}
                    onDismiss={clearActionErrorMessage}
                    duration={3000}
                    style={styles.errorSnackbar}
                >
                    {actionErrorMessage ?? ''}
                </Snackbar>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        height: SHEET_HEIGHT_PERCENTAGE,
        backgroundColor: fantasyTokens.colors.night,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(201,146,42,0.2)',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 20,
    },
    headerDragZone: {
        flexShrink: 0,
    },
    handleRow: {
        paddingTop: 16,
        paddingHorizontal: fantasyTokens.spacing.md,
        alignItems: 'center',
        position: 'relative',
        minHeight: 40,
        paddingBottom: 6,
    },
    handle: {
        position: 'absolute',
        top: 8,
        left: '50%',
        marginLeft: -18,
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(201,146,42,0.2)',
    },
    titleRow: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: 6,
        paddingBottom: 10,
    },
    title: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 18,
        fontWeight: '700',
    },
    subtitle: {
        color: fantasyTokens.colors.gold,
        opacity: 0.55,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 1,
    },
    searchFilterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingBottom: 10,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.15)',
        borderRadius: 10,
        backgroundColor: 'rgba(245,230,200,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 2,
        minHeight: 40,
    },
    searchInput: {
        flex: 1,
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 15,
        paddingVertical: 6,
    },
    clearSearchButton: {
        marginLeft: 4,
        paddingVertical: 2,
        paddingHorizontal: 2,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: 'rgba(201,146,42,0.18)',
        borderRadius: 10,
        backgroundColor: 'rgba(245,230,200,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    filterButtonActive: {
        backgroundColor: 'rgba(139,26,26,0.15)',
        borderColor: 'rgba(139,26,26,0.4)',
    },
    filterButtonText: {
        color: fantasyTokens.colors.parchment,
        opacity: 0.62,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    filterCountBadge: {
        borderRadius: 999,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    filterCountText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 8,
        fontWeight: '700',
    },
    activeChipsScroll: {
        maxHeight: 34,
    },
    activeChipsRow: {
        paddingHorizontal: 12,
        gap: 6,
        alignItems: 'center',
    },
    activeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(139,26,26,0.3)',
        backgroundColor: 'rgba(139,26,26,0.12)',
        paddingLeft: 10,
        paddingRight: 8,
        paddingVertical: 3,
    },
    activeChipText: {
        color: '#e3a8a8',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeChipRemove: {
        color: '#e3a8a8',
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 11,
        opacity: 0.7,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(201,146,42,0.1)',
    },
    filterPanel: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#140e06',
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(201,146,42,0.12)',
        zIndex: 10,
    },
    filterPanelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(201,146,42,0.1)',
    },
    filterBackText: {
        color: fantasyTokens.colors.gold,
        opacity: 0.6,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    filterPanelTitle: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 16,
        fontWeight: '700',
    },
    filterClearText: {
        color: fantasyTokens.colors.crimson,
        opacity: 0.85,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    filterScroll: {
        flex: 1,
        paddingHorizontal: fantasyTokens.spacing.md,
    },
    filterScrollContent: {
        paddingBottom: 120,
    },
    filterApplyWrap: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingTop: 12,
        paddingBottom: 20,
        backgroundColor: '#140e06',
        borderTopWidth: 1,
        borderTopColor: 'rgba(201,146,42,0.08)',
    },
    filterApplyButton: {
        borderRadius: 12,
        backgroundColor: fantasyTokens.colors.crimson,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 13,
    },
    filterApplyButtonText: {
        color: fantasyTokens.colors.parchment,
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '700',
    },
    detailBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        zIndex: 30,
    },
    detailModalWrap: {
        ...StyleSheet.absoluteFillObject,
        top: '10%',
        zIndex: 31,
    },
    errorSnackbar: {
        backgroundColor: '#8b1a1a',
    },
});
