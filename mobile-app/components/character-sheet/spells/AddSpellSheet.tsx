import { Animated, Keyboard, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { GestureDetector } from 'react-native-gesture-handler';
import { fantasyTokens } from '@/theme/fantasyTheme';
import AddSpellBottomBar from './add-sheet/AddSpellBottomBar';
import AddSpellFilterPanel from './add-sheet/AddSpellFilterPanel';
import AddSpellSectionList from './add-sheet/AddSpellSectionList';
import AddSpellActiveFilterChips from './add-sheet/AddSpellActiveFilterChips';
import AddSpellSheetHeader from './add-sheet/AddSpellSheetHeader';
import { GET_SPELL_DETAIL_FOR_SHEET, SEARCH_SPELLS_FOR_SHEET } from './add-sheet/addSpellSheetQueries';
import useAddSpellSheetController from './add-sheet/useAddSpellSheetController';
import useAddSpellSheetMotion from './add-sheet/useAddSpellSheetMotion';
import SpellDetailModal from './SpellDetailModal';

type AddSpellSheetProps = {
    visible: boolean;
    onClose: () => void;
    characterClassIds: string[];
    knownSpellIds: string[];
    onSpellAdded: (spellId: string) => Promise<void>;
    onSpellRemoved: (spellId: string) => Promise<void>;
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
    onSpellAdded,
    onSpellRemoved,
}: AddSpellSheetProps) {
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const {
        actionErrorMessage,
        activeFilterChips,
        activeFilterCount,
        applyFilters,
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
                    <AddSpellSheetHeader
                        searchQuery={searchQuery}
                        onChangeSearchQuery={setSearchQuery}
                        onClearSearchQuery={() => setSearchQuery('')}
                        activeFilterCount={activeFilterCount}
                        onOpenFilterPanel={openFilterPanel}
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
                                <Pressable style={styles.backdropPressable} onPress={animateCloseSpellDetail} accessibilityLabel="Close spell details" />
                            </Animated.View>

                            <GestureDetector gesture={detailDismissGesture}>
                                <Animated.View style={[styles.detailModalWrap, { transform: [{ translateY: detailModalTranslateY }] }]}>
                                    <SpellDetailModal
                                        spell={selectedSpellDetail ?? null}
                                        spellName={selectedSpell.name}
                                        known={isKnownSpell(selectedSpell.id)}
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
