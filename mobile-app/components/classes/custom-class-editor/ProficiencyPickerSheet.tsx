import { useEffect, useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import ParchmentWizardSheetShell from '@/components/sheets/ParchmentWizardSheetShell';
import useBottomSheetMotion from '@/hooks/useBottomSheetMotion';
import { fantasyTokens } from '@/theme/fantasyTheme';
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

type ProficiencyPickerSheetProps = {
    visible: boolean;
    title: string;
    options: ProficiencyOption[];
    initiallySelected: string[];
    excludedValues?: string[];
    onConfirm: (values: string[]) => void;
    onClose: () => void;
};

/**
 * Nested parchment sheet for multi-selecting proficiency reference values.
 */
export default function ProficiencyPickerSheet({
    visible,
    title,
    options,
    initiallySelected,
    excludedValues = [],
    onConfirm,
    onClose,
}: ProficiencyPickerSheetProps) {
    const { height: windowHeight } = useWindowDimensions();
    const [selected, setSelected] = useState<string[]>(initiallySelected);
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [search, setSearch] = useState('');

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
        onClose,
    });

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

    return (
        <ParchmentWizardSheetShell
            isRendered={isRendered}
            backdropOpacity={backdropOpacity}
            sheetTranslateY={sheetTranslateY}
            sheetDismissGesture={sheetDismissGesture}
            closeAccessibilityLabel="Dismiss proficiency picker"
            testID="proficiency-picker-sheet"
            overlayZIndex={40}
            sheetStyle={styles.sheet}
            onRequestClose={requestSheetClose}
        >
            <View style={styles.root}>
                <View style={styles.header}>
                    <Pressable onPress={requestSheetClose} accessibilityRole="button">
                        <Text style={styles.cancel}>Cancel</Text>
                    </Pressable>
                    <Text style={styles.title}>{title}</Text>
                    <Pressable
                        testID="proficiency-picker-confirm"
                        onPress={() => {
                            onConfirm(selected);
                            requestSheetClose();
                        }}
                        accessibilityRole="button"
                    >
                        <Text style={styles.confirm}>Done</Text>
                    </Pressable>
                </View>

                <TextInput
                    mode="outlined"
                    label="Search"
                    value={search}
                    onChangeText={setSearch}
                    outlineColor={fantasyTokens.colors.accordionBorder}
                    activeOutlineColor={fantasyTokens.colors.claret}
                    textColor={fantasyTokens.colors.inkDark}
                    style={styles.search}
                    dense
                />

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

                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    keyboardShouldPersistTaps="handled"
                >
                    {filtered.map((option) => {
                        const isSelected = selected.includes(option.value);
                        return (
                            <Pressable
                                key={option.value}
                                testID={`proficiency-option-${option.value}`}
                                onPress={() => toggle(option.value)}
                                style={[styles.option, isSelected && styles.optionSelected]}
                            >
                                <View style={styles.optionText}>
                                    <Text style={styles.optionName}>{option.name}</Text>
                                    <Text style={styles.optionMeta}>
                                        {option.type}
                                        {option.isCustom ? ' · Custom' : ''}
                                    </Text>
                                </View>
                                <Text style={styles.check}>{isSelected ? '✓' : ''}</Text>
                            </Pressable>
                        );
                    })}
                    {filtered.length === 0 ? (
                        <Text style={fieldStyles.helper}>No matching proficiencies.</Text>
                    ) : null}
                </ScrollView>
            </View>
        </ParchmentWizardSheetShell>
    );
}

const styles = StyleSheet.create({
    sheet: {
        height: fantasyTokens.sheet.tallHeight,
    },
    root: {
        flex: 1,
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
    },
    cancel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkSoft,
    },
    title: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.inkDark,
        flex: 1,
        textAlign: 'center',
    },
    confirm: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
    search: {
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    list: {
        flex: 1,
    },
    listContent: {
        gap: fantasyTokens.spacing.sm,
        paddingBottom: fantasyTokens.spacing.xxl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: fantasyTokens.spacing.md,
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.accordionBorder,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.parchmentLight,
    },
    optionSelected: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: fantasyTokens.colors.claretSoft,
    },
    optionText: {
        flex: 1,
        gap: fantasyTokens.spacing.xs,
    },
    optionName: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    optionMeta: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
    },
    check: {
        ...fantasyTokens.typography.sectionTitle,
        color: fantasyTokens.colors.claret,
        minWidth: fantasyTokens.spacing.md,
        textAlign: 'center',
    },
});
