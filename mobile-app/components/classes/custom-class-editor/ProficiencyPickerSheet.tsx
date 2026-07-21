import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';
import { Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FantasyFormTextInput } from '@/components/FantasyFormTextInput';
import BottomSheetShell from '@/components/sheets/BottomSheetShell';
import { OVERLAY_LAYER } from '@/components/sheets/overlayLayers';
import useConfirm from '@/hooks/useConfirm';
import useBottomSheetMotion from '@/hooks/useBottomSheetMotion';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import { PROFICIENCY_CATEGORIES } from './draft';
import { Chip, fieldStyles } from './fields';

export type ProficiencyOption = {
    value: string;
    name: string;
    type: string;
    isCustom: boolean;
};

const TYPE_FILTERS = [
    { value: 'ALL', label: 'All' },
    { value: 'ARMOR', label: 'Armor' },
    { value: 'WEAPON', label: 'Weapons' },
    { value: 'TOOL', label: 'Tools' },
    { value: 'SKILL', label: 'Skills' },
    { value: 'OTHER', label: 'Other' },
] as const;

const CATEGORY_BY_TYPE = new Map(
    PROFICIENCY_CATEGORIES.map((category) => [category.type, category]),
);

type ProficiencyPickerSheetProps = {
    visible: boolean;
    title: string;
    options: ProficiencyOption[];
    initiallySelected: string[];
    excludedValues?: string[];
    /** When true, hide the Armor/Weapons/… filter chips (caller already scoped options). */
    hideTypeFilters?: boolean;
    onConfirm: (values: string[]) => void;
    onClose: () => void;
};

/**
 * Nested bottom sheet for multi-selecting proficiency reference values.
 */
export default function ProficiencyPickerSheet({
    visible,
    title,
    options,
    initiallySelected,
    excludedValues = [],
    hideTypeFilters = false,
    onConfirm,
    onClose,
}: ProficiencyPickerSheetProps) {
    const { height: windowHeight } = useWindowDimensions();
    const [selected, setSelected] = useState<string[]>(initiallySelected);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [search, setSearch] = useState('');
    const { confirm, confirmDialogElement } = useConfirm();
    const skipDiscardCheckRef = useRef(false);
    const requestSheetCloseRef = useRef<() => void>(() => {});

    const isDirty = useMemo(
        () => selected.length !== initiallySelected.length
            || selected.some((value) => !initiallySelected.includes(value)),
        [initiallySelected, selected],
    );

    const handleRequestClose = useCallback((): boolean | void => {
        if (!skipDiscardCheckRef.current && isDirty) {
            confirm({
                title: 'Discard proficiency changes?',
                message: 'Your unsaved proficiency selections will be lost.',
                confirmLabel: 'Discard',
                cancelLabel: 'Keep Editing',
                onConfirm: () => {
                    skipDiscardCheckRef.current = true;
                    requestSheetCloseRef.current();
                    skipDiscardCheckRef.current = false;
                },
            });
            return false;
        }
    }, [confirm, isDirty]);

    const {
        isRendered,
        backdropOpacity,
        sheetTranslateY,
        requestSheetClose,
        handleScroll,
        sheetDismissGesture,
    } = useBottomSheetMotion({
        visible,
        windowHeight,
        onRequestClose: handleRequestClose,
        onClose,
    });

    requestSheetCloseRef.current = requestSheetClose;

    useEffect(() => {
        if (!visible) return;
        setSelected(initiallySelected);
        setTypeFilter('ALL');
        setSearch('');
        // Reset only when the sheet opens; avoid wiping in-progress selection on parent re-renders.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed on visible
    }, [visible]);

    const excluded = useMemo(() => new Set(excludedValues), [excludedValues]);

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return options.filter((option) => {
            if (excluded.has(option.value) && !selected.includes(option.value)) return false;
            if (typeFilter !== 'ALL' && option.type !== typeFilter) return false;
            if (!query) return true;
            return option.name.toLowerCase().includes(query) || option.value.toLowerCase().includes(query);
        });
    }, [excluded, options, search, selected, typeFilter]);

    function toggle(value: string) {
        setSelected((current) =>
            current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
        );
    }

    function confirmSelection() {
        onConfirm(selected);
        skipDiscardCheckRef.current = true;
        requestSheetClose();
        skipDiscardCheckRef.current = false;
    }

    const selectedCount = selected.length;
    const resultLabel = filtered.length === 1
        ? '1 match'
        : `${filtered.length} matches`;
    const selectionLabel = selectedCount === 0
        ? 'Tap rows to select'
        : `${selectedCount} selected`;

    return (
        <>
            <BottomSheetShell
                isRendered={isRendered}
                backdropOpacity={backdropOpacity}
                sheetTranslateY={sheetTranslateY}
                sheetDismissGesture={sheetDismissGesture}
                closeAccessibilityLabel="Dismiss proficiency picker"
                testID="proficiency-picker-sheet"
                overlayZIndex={OVERLAY_LAYER.nestedSheet}
                sheetStyle={styles.sheet}
                onRequestClose={requestSheetClose}
            >
                <View style={styles.root}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.subtitle}>Choose one or more options</Text>
                    </View>

                    <FantasyFormTextInput
                        label="Search"
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Filter by name…"
                        dense
                    />

                    {hideTypeFilters ? null : (
                        <View style={fieldStyles.chips}>
                            {TYPE_FILTERS.map((filter) => (
                                <Chip
                                    key={filter.value}
                                    label={filter.label}
                                    selected={typeFilter === filter.value}
                                    onPress={() => setTypeFilter(filter.value)}
                                />
                            ))}
                        </View>
                    )}

                    <View style={styles.statusRow}>
                        <Text style={styles.statusText}>{resultLabel}</Text>
                        <View style={styles.statusDivider} />
                        <Text style={[styles.statusText, selectedCount > 0 && styles.statusTextEmphasis]}>
                            {selectionLabel}
                        </Text>
                    </View>

                    <ScrollView
                        style={styles.list}
                        contentContainerStyle={styles.listContent}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        keyboardShouldPersistTaps="handled"
                    >
                        {filtered.map((option) => {
                            const isSelected = selected.includes(option.value);
                            const category = CATEGORY_BY_TYPE.get(
                                option.type as (typeof PROFICIENCY_CATEGORIES)[number]['type'],
                            );
                            const showTypeMeta = !hideTypeFilters;
                            const showCustom = option.isCustom;

                            return (
                                <Pressable
                                    key={option.value}
                                    testID={`proficiency-option-${option.value}`}
                                    onPress={() => toggle(option.value)}
                                    style={({ pressed }) => [
                                        styles.option,
                                        isSelected && styles.optionSelected,
                                        pressed && !isSelected && styles.optionPressed,
                                    ]}
                                    accessibilityRole="checkbox"
                                    accessibilityState={{ checked: isSelected }}
                                    accessibilityLabel={`${option.name}${isSelected ? ', selected' : ''}`}
                                >
                                    <View style={[styles.iconBadge, isSelected && styles.iconBadgeSelected]}>
                                        <Text style={styles.iconBadgeText}>{category?.icon ?? '✨'}</Text>
                                    </View>

                                    <View style={styles.optionText}>
                                        <Text
                                            style={[styles.optionName, isSelected && styles.optionNameSelected]}
                                            numberOfLines={2}
                                        >
                                            {option.name}
                                        </Text>
                                        {showTypeMeta || showCustom ? (
                                            <View style={styles.metaRow}>
                                                {showTypeMeta ? (
                                                    <View style={styles.metaPill}>
                                                        <Text style={styles.metaPillText}>
                                                            {category?.label ?? option.type}
                                                        </Text>
                                                    </View>
                                                ) : null}
                                                {showCustom ? (
                                                    <View style={[styles.metaPill, styles.metaPillCustom]}>
                                                        <Text style={[styles.metaPillText, styles.metaPillCustomText]}>
                                                            Custom
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                        ) : null}
                                    </View>

                                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                        {isSelected ? (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color={fantasyTokens.colors.parchment}
                                            />
                                        ) : null}
                                    </View>
                                </Pressable>
                            );
                        })}
                        {filtered.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyTitle}>No matches</Text>
                                <Text style={fieldStyles.helper}>
                                    Try a different search{hideTypeFilters ? '' : ' or filter'}.
                                </Text>
                            </View>
                        ) : null}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Text style={styles.footerHint}>{selectionLabel}</Text>
                        <Pressable
                            testID="proficiency-picker-confirm"
                            onPress={confirmSelection}
                            style={({ pressed }) => [
                                styles.doneButton,
                                pressed && styles.doneButtonPressed,
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel="Done adding proficiencies"
                        >
                            <Text style={styles.doneButtonText}>Done</Text>
                        </Pressable>
                    </View>
                </View>
            </BottomSheetShell>
            {confirmDialogElement}
        </>
    );
}

const styles = StyleSheet.create({
    sheet: {
        height: fantasyTokens.sheet.tallHeight,
    },
    root: {
        flex: 1,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingTop: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.md,
    },
    header: {
        gap: fantasyTokens.spacing.xs,
        paddingBottom: fantasyTokens.spacing.xs,
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
    },
    subtitle: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.sm,
    },
    statusText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.gold,
        fontSize: fantasyTokens.fontSizes.caption,
        opacity: 0.75,
    },
    statusTextEmphasis: {
        color: fantasyTokens.colors.goldLight,
        opacity: 1,
    },
    statusDivider: {
        width: StyleSheet.hairlineWidth,
        height: fantasyTokens.spacing.md,
        backgroundColor: fantasyTokens.sheet.form.border,
    },
    list: {
        flex: 1,
    },
    listContent: {
        gap: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.md,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs,
        paddingHorizontal: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.md,
        backgroundColor: fantasyTokens.sheet.form.card,
    },
    optionPressed: {
        backgroundColor: fantasyTokens.colors.nightOverlay,
    },
    optionSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        boxShadow: fantasyTokens.sheet.form.glow,
    },
    iconBadge: {
        width: fantasyTokens.spacing.xl + fantasyTokens.spacing.sm,
        height: fantasyTokens.spacing.xl + fantasyTokens.spacing.sm,
        borderRadius: fantasyTokens.radii.sm,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
    },
    iconBadgeSelected: {
        backgroundColor: fantasyTokens.colors.crimson,
        borderColor: fantasyTokens.colors.gold,
    },
    iconBadgeText: {
        fontSize: fantasyTokens.fontSizes.body,
        lineHeight: fantasyTokens.fontSizes.bodyLarge,
    },
    optionText: {
        flex: 1,
        gap: fantasyTokens.spacing.xs,
        minWidth: 0,
    },
    optionName: {
        ...fantasyTokens.typography.body,
        fontFamily: fantasyTokens.fonts.semiBold,
        color: fantasyTokens.colors.parchment,
    },
    optionNameSelected: {
        color: fantasyTokens.colors.goldLight,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.xs,
    },
    metaPill: {
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: fantasyTokens.spacing.xs / 2,
    },
    metaPillCustom: {
        borderColor: fantasyTokens.sheet.form.positiveBorder,
        backgroundColor: fantasyTokens.sheet.form.positiveSoft,
    },
    metaPillText: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: fantasyTokens.fontSizes.utility,
        color: fantasyTokens.colors.gold,
    },
    metaPillCustomText: {
        color: fantasyTokens.colors.success,
    },
    checkbox: {
        width: fantasyTokens.spacing.xl,
        height: fantasyTokens.spacing.xl,
        borderRadius: fantasyTokens.radii.sm,
        borderWidth: 1.5,
        borderColor: fantasyTokens.sheet.form.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
    },
    checkboxSelected: {
        borderColor: fantasyTokens.colors.gold,
        backgroundColor: fantasyTokens.colors.crimson,
    },
    emptyState: {
        ...nightFormStyles.card,
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.xs,
        alignItems: 'center',
    },
    emptyTitle: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.parchment,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.md,
        paddingTop: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.sheet.form.border,
    },
    footerHint: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        flex: 1,
        fontStyle: 'italic',
    },
    doneButton: {
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.crimson,
        paddingHorizontal: fantasyTokens.spacing.xl,
        paddingVertical: fantasyTokens.spacing.sm + fantasyTokens.spacing.xs / 2,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.gold,
    },
    doneButtonPressed: {
        opacity: 0.88,
    },
    doneButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
    },
});
