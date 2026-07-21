import React from 'react';
import { render } from '@testing-library/react-native';
import { OVERLAY_LAYER } from '@/components/sheets/overlayLayers';
import AddSpellSheet from '../AddSpellSheet';

type BottomSheetShellMockProps = {
    children?: React.ReactNode;
    overlayZIndex?: number;
};

const mockBottomSheetShell = jest.fn((_props: BottomSheetShellMockProps) => null);

jest.mock('@/components/sheets/BottomSheetShell', () => ({
    __esModule: true,
    default: (props: BottomSheetShellMockProps) => mockBottomSheetShell(props),
}));

jest.mock('../add-sheet/useAddSpellSheetController', () => ({
    __esModule: true,
    default: () => ({
        actionErrorMessage: null,
        activeFilterChips: [],
        activeFilterCount: 0,
        applyFilters: jest.fn(),
        blockedReasonForSpell: () => null,
        clearActionErrorMessage: jest.fn(),
        clearDraftFilters: jest.fn(),
        clearSelectedSpell: jest.fn(),
        closeFilterPanel: jest.fn(),
        draftFilters: {},
        errorMessage: null,
        filterPanelOpen: false,
        isKnownSpell: () => false,
        loading: false,
        openFilterPanel: jest.fn(),
        openSpellDetail: jest.fn(),
        pendingSpellIds: new Set(),
        prefetchSpellDetail: jest.fn(),
        removeAppliedFilterChip: jest.fn(),
        retrySelectedSpellDetail: jest.fn(),
        searchQuery: '',
        sections: [],
        selectedSpell: null,
        selectedSpellDetail: null,
        selectedSpellDetailErrorMessage: null,
        selectedSpellDetailLoading: false,
        sessionChangesCount: 0,
        setDraftFilters: jest.fn(),
        setSearchQuery: jest.fn(),
        toggleSpellSelection: jest.fn(),
        loadMoreSpells: jest.fn(),
        loadingMore: false,
    }),
}));

jest.mock('../add-sheet/useAddSpellSheetMotion', () => {
    const { Animated } = require('react-native') as typeof import('react-native');
    return {
        __esModule: true,
        default: () => ({
            animateCloseSpellDetail: jest.fn(),
            backdropOpacity: new Animated.Value(1),
            detailDismissGesture: { enabled: false },
            detailModalTranslateY: new Animated.Value(0),
            detailOverlayOpacity: new Animated.Value(0),
            filterPanelTranslateX: new Animated.Value(0),
            handleDetailBodyScroll: jest.fn(),
            handleSpellListScroll: jest.fn(),
            isRendered: true,
            requestSheetClose: jest.fn(),
            sheetDismissGesture: { enabled: false },
            sheetTranslateY: new Animated.Value(0),
        }),
    };
});

jest.mock('../add-sheet/AddSpellSheetHeader', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('../add-sheet/AddSpellSectionList', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('../add-sheet/AddSpellFilterPanel', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('../add-sheet/AddSpellActiveFilterChips', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('../add-sheet/AddSpellBottomBar', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('../SpellDetailModal', () => ({
    __esModule: true,
    default: () => null,
}));

describe('AddSpellSheet overlay layering', () => {
    beforeEach(() => {
        mockBottomSheetShell.mockClear();
    });

    it('defaults above parent editor and wizard sheets', () => {
        render(
            <AddSpellSheet
                visible
                onClose={jest.fn()}
                characterClassIds={['wizard']}
                knownSpellIds={[]}
                onSpellAdded={jest.fn().mockResolvedValue(undefined)}
                onSpellRemoved={jest.fn().mockResolvedValue(undefined)}
            />,
        );

        expect(mockBottomSheetShell).toHaveBeenCalledWith(
            expect.objectContaining({
                overlayZIndex: OVERLAY_LAYER.nestedSheet,
            }),
        );
        expect(OVERLAY_LAYER.nestedSheet).toBeGreaterThan(OVERLAY_LAYER.sheet);
    });
});
