import { Animated, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { GestureDetector } from 'react-native-gesture-handler';
import { fantasyTokens } from '@/theme/fantasyTheme';
import BottomSheetShell from '@/components/sheets/BottomSheetShell';
import AddSpellBottomBar from './add-sheet/AddSpellBottomBar';
import AddSpellFilterPanel from './add-sheet/AddSpellFilterPanel';
import AddSpellSectionList from './add-sheet/AddSpellSectionList';
import AddSpellActiveFilterChips from './add-sheet/AddSpellActiveFilterChips';
import AddSpellSheetHeader from './add-sheet/AddSpellSheetHeader';
import { GET_SPELL_DETAIL_FOR_SHEET, SEARCH_SPELLS_FOR_SHEET } from './add-sheet/addSpellSheetQueries';
import useAddSpellSheetController from './add-sheet/useAddSpellSheetController';
import useAddSpellSheetMotion from './add-sheet/useAddSpellSheetMotion';
import SpellDetailModal from './SpellDetailModal';
import type { AddSpellListItem } from './addSpell.types';
import type { AddSpellFilterState } from './SpellFilterState';

type AddSpellSheetProps = {
    visible: boolean;
    onClose: () => void;
    characterClassIds: string[];
    knownSpellIds: string[];
    blockedSpellIds?: string[];
    forcedFilters?: Partial<AddSpellFilterState>;
    selectionLimit?: number;
    title?: string;
    subtitle?: string;
    showFilterButton?: boolean;
    onSpellAdded: (spell: AddSpellListItem) => Promise<void>;
    onSpellRemoved: (spell: AddSpellListItem) => Promise<void>;
};

/** Visible height of the main add-spell sheet. */
const SHEET_HEIGHT_PERCENTAGE = '92%';

export { GET_SPELL_DETAIL_FOR_SHEET, SEARCH_SPELLS_FOR_SHEET };

/**
 * Add Spell bottom sheet rendered over the character Spells tab.
 */
export default function AddSpellSheet({
    visible,
    onClose,
    characterClassIds,
    knownSpellIds,
    blockedSpellIds = [],
    forcedFilters,
    selectionLimit,
    title,
    subtitle,
    showFilterButton = true,
    onSpellAdded,
    onSpellRemoved,
}: AddSpellSheetProps) {
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const {
        actionErrorMessage,
        activeFilterChips,
        activeFilterCount,
        applyFilters,
        blockedReasonForSpell,
        clearActionErrorMessage,
        clearDraftFilters,
        clearSelectedSpell,
        closeFilterPanel,
        draftFilters,
        errorMessage,
        filterPanelOpen,
        isKnownSpell,
        loading,
        openFilterPanel,
        openSpellDetail,
        pendingSpellIds,
        prefetchSpellDetail,
        removeAppliedFilterChip,
        retrySelectedSpellDetail,
        searchQuery,
        sections,
        selectedSpell,
        selectedSpellDetail,
        selectedSpellDetailErrorMessage,
        selectedSpellDetailLoading,
        sessionChangesCount,
        setDraftFilters,
        setSearchQuery,
        toggleSpellSelection,
    } = useAddSpellSheetController({
        visible,
        characterClassIds,
        knownSpellIds,
        blockedSpellIds,
        forcedFilters,
        selectionLimit,
        onSpellAdded,
        onSpellRemoved,
    });
    const {
        animateCloseSpellDetail,
        backdropOpacity,
        detailDismissGesture,
        detailModalTranslateY,
        detailOverlayOpacity,
        filterPanelTranslateX,
        handleDetailBodyScroll,
        handleSpellListScroll,
        isRendered,
        requestSheetClose,
        sheetDismissGesture,
        sheetTranslateY,
    } = useAddSpellSheetMotion({
        visible,
        filterPanelOpen,
        selectedSpellVisible: selectedSpell != null,
        windowHeight,
        windowWidth,
        onClose,
        closeFilterPanel,
        clearSelectedSpell,
    });

    return (
        <BottomSheetShell
            isRendered={isRendered}
            backdropOpacity={backdropOpacity}
            sheetTranslateY={sheetTranslateY}
            sheetDismissGesture={sheetDismissGesture}
            onRequestClose={requestSheetClose}
            closeAccessibilityLabel="Close add spell sheet"
            testID="add-spell-sheet"
            sheetStyle={styles.sheet}
        >
            <AddSpellSheetHeader
                searchQuery={searchQuery}
                onChangeSearchQuery={setSearchQuery}
                onClearSearchQuery={() => setSearchQuery('')}
                activeFilterCount={activeFilterCount}
                onOpenFilterPanel={openFilterPanel}
                title={title}
                subtitle={subtitle}
                showFilterButton={showFilterButton}
            />

            <AddSpellActiveFilterChips
                chips={activeFilterChips}
                onRemoveChip={removeAppliedFilterChip}
            />

            <View style={styles.divider} />

            <AddSpellSectionList
                sections={sections}
                loading={loading}
                errorMessage={errorMessage}
                isKnownSpell={isKnownSpell}
                blockedReasonForSpell={blockedReasonForSpell}
                pendingSpellIds={pendingSpellIds}
                onToggleSpellSelection={(spell) => {
                    void toggleSpellSelection(spell);
                }}
                onPrefetchSpellDetail={prefetchSpellDetail}
                onOpenSpellDetail={openSpellDetail}
                onScroll={handleSpellListScroll}
            />

            <AddSpellBottomBar sessionChangesCount={sessionChangesCount} onDone={requestSheetClose} />

            <Animated.View style={[styles.filterPanel, { transform: [{ translateX: filterPanelTranslateX }] }]}>
                <AddSpellFilterPanel
                    draftFilters={draftFilters}
                    setDraftFilters={setDraftFilters}
                    onBack={closeFilterPanel}
                    onClear={clearDraftFilters}
                    onApply={applyFilters}
                />
            </Animated.View>

            {selectedSpell && (
                <>
                    <Animated.View style={[styles.detailBackdrop, { opacity: detailOverlayOpacity }]}>
                        <Pressable
                            style={styles.backdropPressable}
                            onPress={animateCloseSpellDetail}
                            accessibilityRole="button"
                            accessibilityLabel="Close spell details"
                        />
                    </Animated.View>

                    <GestureDetector gesture={detailDismissGesture}>
                        <Animated.View style={[styles.detailModalWrap, { transform: [{ translateY: detailModalTranslateY }] }]}>
                            <SpellDetailModal
                                spell={selectedSpellDetail ?? null}
                                spellName={selectedSpell.name}
                                known={isKnownSpell(selectedSpell.id)}
                                blockedReason={blockedReasonForSpell(selectedSpell.id)}
                                loading={selectedSpellDetailLoading && selectedSpellDetail == null}
                                errorMessage={selectedSpellDetailErrorMessage}
                                onRetry={retrySelectedSpellDetail}
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
        </BottomSheetShell>
    );
}

const styles = StyleSheet.create({
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        height: SHEET_HEIGHT_PERCENTAGE,
    },
    divider: {
        height: 1,
        backgroundColor: fantasyTokens.rail.border,
    },
    filterPanel: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: fantasyTokens.colors.night,
        borderLeftWidth: 1,
        borderLeftColor: fantasyTokens.rail.border,
        zIndex: 10,
    },
    detailBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: fantasyTokens.rail.backdrop,
        zIndex: 30,
    },
    detailModalWrap: {
        ...StyleSheet.absoluteFillObject,
        top: '10%',
        zIndex: 31,
    },
    errorSnackbar: {
        backgroundColor: fantasyTokens.colors.inspired,
    },
});
