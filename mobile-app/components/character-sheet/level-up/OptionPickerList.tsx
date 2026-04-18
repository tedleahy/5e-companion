import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens, fantasyFonts } from '@/theme/fantasyTheme';
import CustomEntryCard from './CustomEntryCard';

/**
 * Base option type for the picker - must have at least these fields.
 */
type BaseOption = {
    id: string;
    name: string;
    description: string;
    fullDescription: string;
};

/**
 * Optional prerequisite info for an option.
 */
type OptionPrerequisite = {
    text: string;
    met: boolean;
    reason: string | null;
};

/**
 * Props for the generic option picker list.
 * Supports single-select (radio) or multi-select (checkboxes) with optional custom entry.
 */
type OptionPickerListProps<T extends BaseOption> = {
    mode: 'multi' | 'single';
    options: readonly T[];
    selectedIds: string[]; // For single-select, use array with 0 or 1 element
    onToggle: (id: string) => void;
    testIdPrefix: string;
    getPrerequisite?: (option: T) => OptionPrerequisite | null;
    // Multi-select only (optional)
    title?: string;
    gainCount?: number;
    customEntry?: { name: string; description: string } | null;
    onChangeCustom?: (custom: { name: string; description: string } | null) => void;
    addCustomLabel?: string;
    customNameLabel?: string;
    customDescriptionLabel?: string;
    removeCustomLabel?: string;
};

/**
 * Generic picker for selecting options from an SRD list.
 * Supports single-select (radio) or multi-select (checkboxes) with optional custom entry.
 * Used for invocations, metamagic, and potentially other class feature pickers.
 */
export default function OptionPickerList<T extends BaseOption>({
    mode,
    options,
    selectedIds,
    onToggle,
    testIdPrefix,
    getPrerequisite,
    title,
    gainCount,
    customEntry,
    onChangeCustom,
    addCustomLabel,
    customNameLabel,
    customDescriptionLabel,
    removeCustomLabel,
}: OptionPickerListProps<T>) {
    const { width } = useWindowDimensions();
    const isTablet = width >= fantasyTokens.breakpoints.tablet;

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const isMulti = mode === 'multi';
    const selectedCount = selectedIds.length + (customEntry?.name.trim().length ?? 0 > 0 ? 1 : 0);
    const showCustomFields = customEntry != null;

    function toggleExpanded(id: string) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    // Pre-compute annotated options with prerequisite info to avoid calling getPrerequisite twice per option
    const annotatedOptions = useMemo(() =>
        options.map((option) => {
            const isSelected = selectedIds.includes(option.id);
            const prereq = getPrerequisite?.(option) ?? null;
            // Determine visibility: show if selected, prerequisite met, or spell-only prereq (show disabled)
            let isVisible = true;
            if (prereq && !prereq.met && !isSelected) {
                const prereqStr = prereq.text ?? '';
                const isSpellOnlyPrereq = prereqStr.includes('Eldritch Blast') && !prereqStr.includes('level') && !prereqStr.includes('Pact');
                isVisible = isSpellOnlyPrereq;
            }
            return { option, isSelected, prereq, isVisible };
        }).filter(({ isVisible }) => isVisible),
        [options, selectedIds, getPrerequisite],
    );


    return (
        <View style={isMulti ? styles.pickerSection : undefined} testID={`${testIdPrefix}-picker`}>
            {isMulti && (
                <>
                    <Text style={styles.pickerTitle}>{title}</Text>
                    <Text style={styles.pickerCounter}>
                        {`${selectedCount} of ${gainCount} selected`}
                    </Text>
                </>
            )}

            <View style={isTablet ? styles.optionsGrid : styles.optionsList}>
                {annotatedOptions.map(({ option, isSelected, prereq }) => {
                    const isDisabled = prereq ? !prereq.met && !isSelected : false;
                    const isExpanded = expandedIds.has(option.id);
                    const hasLongerDescription = option.fullDescription.length > option.description.length + 10;

                    return (
                        <View
                            key={option.id}
                            style={[
                                styles.optionCard,
                                isTablet && styles.optionCardTablet,
                                isSelected && styles.optionCardSelected,
                                isDisabled && styles.optionCardDisabled,
                            ]}
                        >
                        <Pressable
                            onPress={() => { if (!isDisabled) onToggle(option.id); }}
                            style={styles.optionToggleArea}
                            testID={`${testIdPrefix}-${option.id}`}
                            accessibilityRole={isMulti ? 'checkbox' : 'radio'}
                            accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                            accessibilityLabel={`${isSelected ? 'Unselect' : 'Select'} ${option.name}${isSelected ? ', selected' : ''}${isDisabled ? ', unavailable' : ''}`}
                            disabled={isDisabled}
                        >
                            <View style={styles.optionHeader}>
                                <Text style={[
                                    styles.optionName,
                                    isSelected && styles.optionNameSelected,
                                    isDisabled && styles.optionNameDisabled,
                                ]}>
                                    {option.name}
                                </Text>
                                {isSelected ? <Text style={styles.selectedBadge}>Selected</Text> : null}
                            </View>
                            <Text style={[styles.optionDescription, isDisabled && styles.optionDescriptionDisabled]}>
                                {isExpanded ? option.fullDescription : option.description}
                            </Text>
                            {prereq?.text ? (
                                <Text style={[
                                    styles.prerequisiteText,
                                    isDisabled && styles.prerequisiteTextUnmet,
                                ]}>
                                    {isDisabled
                                        ? `Requires: ${prereq.reason}`
                                        : `Prerequisite: ${prereq.text}`}
                                </Text>
                            ) : null}
                        </Pressable>
                        {hasLongerDescription ? (
                            <Pressable
                                onPress={() => toggleExpanded(option.id)}
                                hitSlop={8}
                                testID={`${testIdPrefix}-read-more-${option.id}`}
                                accessibilityRole="button"
                                accessibilityLabel={`${isExpanded ? 'Show less' : 'Read more'} about ${option.name}`}
                                accessibilityState={{ expanded: isExpanded }}
                            >
                                <Text style={styles.readMoreText}>
                                    {isExpanded ? 'Show less' : 'Read more'}
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                );
            })}</View>

            {isMulti && (
                !showCustomFields ? (
                    <Pressable
                        onPress={() => onChangeCustom?.({ name: '', description: '' })}
                        style={styles.addCustomButton}
                        testID={`${testIdPrefix}-add-custom`}
                        accessibilityLabel={addCustomLabel}
                    >
                        <Text style={styles.addCustomButtonText}>{addCustomLabel}</Text>
                    </Pressable>
                ) : (
                    <CustomEntryCard
                        firstLabel={customNameLabel ?? ''}
                        firstValue={customEntry?.name ?? ''}
                        onFirstChange={(text) => onChangeCustom?.({ name: text, description: customEntry?.description ?? '' })}
                        firstTestID={`${testIdPrefix}-custom-name`}
                        secondLabel={customDescriptionLabel ?? ''}
                        secondValue={customEntry?.description ?? ''}
                        onSecondChange={(text) => onChangeCustom?.({ name: customEntry?.name ?? '', description: text })}
                        secondMultiline
                        secondTestID={`${testIdPrefix}-custom-description`}
                        onRemove={() => onChangeCustom?.(null)}
                        removeLabel={removeCustomLabel ?? ''}
                        cardTestID={`${testIdPrefix}-custom-entry`}
                    />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    pickerSection: {
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.md,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.colors.sheetDivider,
        paddingTop: fantasyTokens.spacing.md,
    },
    pickerTitle: {
        ...fantasyTokens.typography.sectionLabel,
        color: fantasyTokens.colors.claret,
    },
    pickerCounter: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.inkLight,
        marginBottom: fantasyTokens.spacing.xs,
    },
    optionsList: {
        gap: fantasyTokens.spacing.sm,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    optionCard: {
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.xs,
    },
    optionCardTablet: {
        width: '31.5%', // slightly less than 33.33% to account for gap
    },
    optionToggleArea: {
        gap: fantasyTokens.spacing.xs,
    },
    optionCardSelected: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: 'rgba(106,17,48,0.06)',
    },
    optionCardDisabled: {
        opacity: 0.5,
        backgroundColor: 'rgba(212,201,180,0.3)',
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionName: {
        ...fantasyTokens.typography.cardTitle,
        color: fantasyTokens.colors.inkDark,
        flex: 1,
    },
    optionNameSelected: {
        color: fantasyTokens.colors.claret,
    },
    optionNameDisabled: {
        color: fantasyTokens.colors.inkSoft,
    },
    optionDescription: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkLight,
    },
    optionDescriptionDisabled: {
        color: fantasyTokens.colors.inkSoft,
    },
    selectedBadge: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.claret,
        fontFamily: fantasyFonts.semiBold,
    },
    readMoreText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.claret,
        fontFamily: fantasyFonts.semiBold,
    },
    prerequisiteText: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.ember,
        fontStyle: 'italic',
    },
    prerequisiteTextUnmet: {
        color: fantasyTokens.colors.ember,
        fontFamily: fantasyFonts.semiBold,
    },
    addCustomButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.md,
        borderStyle: 'dashed',
        paddingVertical: fantasyTokens.spacing.md,
        alignItems: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
    addCustomButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
});
