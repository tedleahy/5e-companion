import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Switch, Text } from 'react-native-paper';
import NumericStepper from '@/components/NumericStepper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { nightFormStyles } from '@/theme/nightFormStyles';
import {
    nextChoiceGroupId,
    PROFICIENCY_CATEGORIES,
    proficiencyCategoryForValue,
    proficiencyChoiceGroupForType,
    proficiencyChoiceGroups,
    type ProficiencyCategoryType,
    type ProficiencyChoiceGroup,
    withChoiceGroupForType,
    withFixedProficienciesForType,
} from './draft';
import { fieldStyles, RemovableChip } from './fields';
import ProficiencyPickerSheet, { type ProficiencyOption } from './ProficiencyPickerSheet';
import type { Draft } from './types';

type PickerTarget =
    | { kind: 'fixed'; type: ProficiencyCategoryType }
    | { kind: 'choice'; type: ProficiencyCategoryType };

type StashedPool = {
    choiceGroup?: number;
    choiceCount: number;
    values: string[];
};

type ProficiencyGrantEditorProps = {
    grant: 'STARTING' | 'MULTICLASS';
    draft: Draft;
    options: ProficiencyOption[];
    locked: boolean;
    onChange: (proficiencies: Draft['proficiencies']) => void;
};

function emptyPool(): StashedPool {
    return { choiceCount: 1, values: [] };
}

/**
 * Category accordion editor for one proficiency grant (STARTING or MULTICLASS).
 * Each type has always-granted chips plus an optional pick-N pool (hide-and-keep on toggle).
 */
export default function ProficiencyGrantEditor({
    grant,
    draft,
    options,
    locked,
    onChange,
}: ProficiencyGrantEditorProps) {
    const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
    /** User-explicit expand/collapse overrides auto-open-when-content. */
    const [openOverride, setOpenOverride] = useState<Partial<Record<ProficiencyCategoryType, boolean>>>({});
    const [choiceEnabled, setChoiceEnabled] = useState<Partial<Record<ProficiencyCategoryType, boolean>>>({});
    /** In-progress empty pools (not yet persisted because values.length === 0). */
    const [localPools, setLocalPools] = useState<Partial<Record<ProficiencyCategoryType, StashedPool>>>({});
    const stashRef = useRef<Partial<Record<ProficiencyCategoryType, StashedPool>>>({});

    const typeByValue = useMemo(() => {
        const map = new Map<string, string>();
        for (const option of options) map.set(option.value, option.type);
        return map;
    }, [options]);

    const nameByValue = useMemo(() => {
        const map = new Map(options.map((option) => [option.value, option.name]));
        return map;
    }, [options]);

    function labelFor(value: string) {
        return nameByValue.get(value) ?? value;
    }

    function fixedFor(type: ProficiencyCategoryType) {
        return draft.proficiencies
            .filter((item) => item.grant === grant && item.choiceGroup == null)
            .map((item) => item.value)
            .filter((value) => proficiencyCategoryForValue(value, typeByValue) === type);
    }

    function persistedChoice(type: ProficiencyCategoryType): ProficiencyChoiceGroup | null {
        return proficiencyChoiceGroupForType(draft, grant, type, typeByValue);
    }

    function isChoiceOn(type: ProficiencyCategoryType) {
        if (choiceEnabled[type] != null) return choiceEnabled[type] === true;
        return persistedChoice(type) != null || localPools[type] != null;
    }

    function activeChoice(type: ProficiencyCategoryType): StashedPool {
        const persisted = persistedChoice(type);
        if (persisted) {
            return {
                choiceGroup: persisted.choiceGroup,
                choiceCount: persisted.choiceCount,
                values: persisted.values,
            };
        }
        return localPools[type] ?? stashRef.current[type] ?? emptyPool();
    }

    function allocateChoiceGroupId(preferred?: number): number {
        if (preferred != null) return preferred;
        return nextChoiceGroupId(proficiencyChoiceGroups(draft, grant));
    }

    function persistChoice(type: ProficiencyCategoryType, pool: StashedPool) {
        if (pool.values.length === 0) {
            setLocalPools((current) => ({ ...current, [type]: pool }));
            if (persistedChoice(type)) {
                onChange(withChoiceGroupForType(draft, grant, type, null, typeByValue));
            }
            return;
        }

        const choiceGroup = allocateChoiceGroupId(pool.choiceGroup ?? persistedChoice(type)?.choiceGroup);
        const next: ProficiencyChoiceGroup = {
            choiceGroup,
            choiceCount: Math.min(Math.max(1, pool.choiceCount), pool.values.length),
            values: pool.values,
        };
        setLocalPools((current) => {
            const copy = { ...current };
            delete copy[type];
            return copy;
        });
        onChange(withChoiceGroupForType(draft, grant, type, next, typeByValue));
    }

    function setChoicePool(type: ProficiencyCategoryType, pool: StashedPool) {
        const next: StashedPool = {
            ...pool,
            choiceCount: Math.max(1, Math.min(pool.choiceCount, Math.max(1, pool.values.length || 1))),
        };
        persistChoice(type, next);
    }

    function toggleChoice(type: ProficiencyCategoryType, enabled: boolean) {
        if (enabled) {
            const restored = stashRef.current[type] ?? localPools[type] ?? emptyPool();
            setChoiceEnabled((current) => ({ ...current, [type]: true }));
            setLocalPools((current) => ({ ...current, [type]: restored }));
            if (restored.values.length > 0) {
                persistChoice(type, restored);
            }
            setOpenOverride((current) => ({ ...current, [type]: true }));
            return;
        }

        const current = activeChoice(type);
        stashRef.current[type] = current;
        setChoiceEnabled((currentEnabled) => ({ ...currentEnabled, [type]: false }));
        setLocalPools((currentLocal) => {
            const next = { ...currentLocal };
            delete next[type];
            return next;
        });
        // Keep the accordion open so the user can re-enable without hunting for the header.
        setOpenOverride((currentOpen) => ({ ...currentOpen, [type]: true }));
        if (persistedChoice(type)) {
            onChange(withChoiceGroupForType(draft, grant, type, null, typeByValue));
        }
    }

    function hasContent(type: ProficiencyCategoryType) {
        return fixedFor(type).length > 0 || isChoiceOn(type);
    }

    function isOpen(type: ProficiencyCategoryType) {
        if (openOverride[type] != null) return openOverride[type] === true;
        return hasContent(type);
    }

    function toggleOpen(type: ProficiencyCategoryType) {
        setOpenOverride((current) => ({ ...current, [type]: !isOpen(type) }));
    }

    function categorySummary(type: ProficiencyCategoryType): string {
        const fixed = fixedFor(type);
        const choiceOn = isChoiceOn(type);
        const choice = choiceOn ? activeChoice(type) : null;
        const fixedLabels = fixed.map(labelFor);

        if (fixed.length === 0 && (!choice || choice.values.length === 0)) {
            return 'None';
        }
        if (fixed.length > 0 && choice && choice.values.length > 0) {
            const granted = fixedLabels.slice(0, 2).join(', ');
            const more = fixed.length > 2 ? '…' : '';
            return `${granted}${more} + choose ${choice.choiceCount}`;
        }
        if (choice && choice.values.length > 0) {
            return `Choose ${choice.choiceCount} of ${choice.values.length}`;
        }
        if (fixed.length <= 3) return `${fixedLabels.join(', ')} granted`;
        return `${fixedLabels.slice(0, 2).join(', ')}… granted`;
    }

    const pickerOptions = useMemo(() => {
        if (!pickerTarget) return [] as ProficiencyOption[];
        return options.filter(
            (option) => proficiencyCategoryForValue(option.value, typeByValue) === pickerTarget.type,
        );
    }, [options, pickerTarget, typeByValue]);

    const usedElsewhere = useMemo(() => {
        if (!pickerTarget) return [] as string[];
        if (pickerTarget.kind === 'fixed') return activeChoice(pickerTarget.type).values;
        return fixedFor(pickerTarget.type);
        // draft/localPools drive activeChoice/fixedFor
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.proficiencies, localPools, pickerTarget, typeByValue]);

    const pickerSelected = useMemo(() => {
        if (!pickerTarget) return [] as string[];
        if (pickerTarget.kind === 'fixed') return fixedFor(pickerTarget.type);
        return activeChoice(pickerTarget.type).values;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.proficiencies, localPools, pickerTarget, typeByValue]);

    function handlePickerConfirm(values: string[]) {
        if (!pickerTarget) return;
        if (pickerTarget.kind === 'fixed') {
            onChange(
                withFixedProficienciesForType(draft, grant, pickerTarget.type, values, typeByValue),
            );
            return;
        }
        const current = activeChoice(pickerTarget.type);
        setChoicePool(pickerTarget.type, {
            ...current,
            choiceCount: Math.min(current.choiceCount, Math.max(1, values.length || 1)),
            values,
        });
    }

    return (
        <View style={styles.root} testID={`proficiency-grant-${grant}`}>
            {PROFICIENCY_CATEGORIES.map((category) => {
                const fixed = fixedFor(category.type);
                const choiceOn = isChoiceOn(category.type);
                const choice = activeChoice(category.type);
                const open = isOpen(category.type);
                const showGrantedBadge = fixed.length > 0;
                const showChoiceBadge = choiceOn && choice.values.length > 0;

                return (
                    <View
                        key={category.type}
                        style={styles.accordion}
                        testID={`proficiency-category-${grant}-${category.type}`}
                    >
                        <Pressable
                            style={styles.accordionHead}
                            onPress={() => toggleOpen(category.type)}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: open }}
                            accessibilityLabel={`${category.label}. ${categorySummary(category.type)}`}
                        >
                            <View style={styles.accordionLeft}>
                                <Text style={styles.accordionIcon}>{category.icon}</Text>
                                <View style={styles.accordionTitles}>
                                    <Text style={styles.accordionName}>{category.label}</Text>
                                    <Text style={styles.accordionSum}>{categorySummary(category.type)}</Text>
                                </View>
                            </View>
                            <View style={styles.accordionRight}>
                                {showGrantedBadge ? (
                                    <Text style={[styles.badge, styles.badgeMuted]}>Granted</Text>
                                ) : null}
                                {showChoiceBadge ? <Text style={styles.badge}>Choice</Text> : null}
                                <Text style={styles.chevron}>{open ? '▾' : '▸'}</Text>
                            </View>
                        </Pressable>

                        {open ? (
                            <View style={styles.accordionBody}>
                                <View style={styles.block}>
                                    <Text style={styles.blockLabel}>Always granted</Text>
                                    <View style={fieldStyles.chips}>
                                        {fixed.map((value) => (
                                            <RemovableChip
                                                key={value}
                                                label={labelFor(value)}
                                                disabled={locked}
                                                testID={`fixed-proficiency-${grant}-${value}`}
                                                onRemove={() =>
                                                    onChange(
                                                        withFixedProficienciesForType(
                                                            draft,
                                                            grant,
                                                            category.type,
                                                            fixed.filter((entry) => entry !== value),
                                                            typeByValue,
                                                        ),
                                                    )
                                                }
                                            />
                                        ))}
                                        {!locked ? (
                                            <Pressable
                                                style={styles.ghostAdd}
                                                testID={`add-fixed-${grant}-${category.type}`}
                                                onPress={() =>
                                                    setPickerTarget({ kind: 'fixed', type: category.type })
                                                }
                                            >
                                                <Text style={styles.ghostAddLabel}>+ add</Text>
                                            </Pressable>
                                        ) : null}
                                    </View>
                                    {category.type === 'SKILL' && fixed.length === 0 ? (
                                        <Text style={fieldStyles.helper}>
                                            Rare for classes — leave empty unless you want a fixed skill.
                                        </Text>
                                    ) : null}
                                </View>

                                <Pressable
                                    disabled={locked}
                                    onPress={() => toggleChoice(category.type, !choiceOn)}
                                    style={[styles.choiceToggle, locked && fieldStyles.disabled]}
                                    accessibilityRole="switch"
                                    accessibilityState={{ checked: choiceOn, disabled: locked }}
                                    accessibilityLabel={`Also let players choose ${category.label}`}
                                    testID={`toggle-choice-${grant}-${category.type}`}
                                >
                                    <View style={styles.choiceToggleText}>
                                        <Text style={styles.choiceToggleLabel}>Also let players choose</Text>
                                        <Text style={styles.choiceToggleSub}>Adds a separate pick-N pool</Text>
                                    </View>
                                    <Switch
                                        value={choiceOn}
                                        color={fantasyTokens.colors.crimson}
                                        style={styles.nonInteractiveSwitch}
                                        accessible={false}
                                        accessibilityElementsHidden
                                        importantForAccessibility="no-hide-descendants"
                                    />
                                </Pressable>

                                {choiceOn ? (
                                    <View style={styles.choiceBlock}>
                                        <Text style={styles.blockLabel}>Player chooses</Text>
                                        <View style={styles.chooseRow}>
                                            <Text style={styles.chooseLabel}>Choose</Text>
                                            <NumericStepper
                                                value={choice.choiceCount}
                                                canDecrease={!locked && choice.choiceCount > 1}
                                                canIncrease={
                                                    !locked
                                                    && choice.values.length > 0
                                                    && choice.choiceCount < choice.values.length
                                                }
                                                decrementLabel={`Decrease ${category.label} choose count`}
                                                incrementLabel={`Increase ${category.label} choose count`}
                                                tone="night"
                                                onDecrease={() =>
                                                    setChoicePool(category.type, {
                                                        ...choice,
                                                        choiceCount: Math.max(1, choice.choiceCount - 1),
                                                    })
                                                }
                                                onIncrease={() =>
                                                    setChoicePool(category.type, {
                                                        ...choice,
                                                        choiceCount: Math.min(
                                                            choice.values.length,
                                                            choice.choiceCount + 1,
                                                        ),
                                                    })
                                                }
                                            />
                                            <Text style={fieldStyles.helper}>
                                                {choice.values.length > 0
                                                    ? `of ${choice.values.length} options`
                                                    : 'from the options below'}
                                            </Text>
                                        </View>
                                        <View style={fieldStyles.chips}>
                                            {choice.values.map((value) => (
                                                <RemovableChip
                                                    key={value}
                                                    label={labelFor(value)}
                                                    disabled={locked}
                                                    testID={`choice-proficiency-${grant}-${value}`}
                                                    onRemove={() =>
                                                        setChoicePool(category.type, {
                                                            ...choice,
                                                            values: choice.values.filter(
                                                                (entry) => entry !== value,
                                                            ),
                                                        })
                                                    }
                                                />
                                            ))}
                                            {!locked ? (
                                                <Pressable
                                                    style={styles.ghostAdd}
                                                    testID={`add-choice-${grant}-${category.type}`}
                                                    onPress={() =>
                                                        setPickerTarget({
                                                            kind: 'choice',
                                                            type: category.type,
                                                        })
                                                    }
                                                >
                                                    <Text style={styles.ghostAddLabel}>+ add</Text>
                                                </Pressable>
                                            ) : null}
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                        ) : null}
                    </View>
                );
            })}

            <ProficiencyPickerSheet
                visible={pickerTarget != null}
                title={
                    pickerTarget?.kind === 'fixed'
                        ? `Add ${PROFICIENCY_CATEGORIES.find((item) => item.type === pickerTarget.type)?.label ?? 'proficiencies'}`
                        : 'Edit choice options'
                }
                options={pickerOptions}
                initiallySelected={pickerSelected}
                excludedValues={usedElsewhere}
                hideTypeFilters
                onConfirm={handlePickerConfirm}
                onClose={() => setPickerTarget(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { gap: fantasyTokens.spacing.sm },
    accordion: {
        ...nightFormStyles.card,
        overflow: 'hidden',
    },
    accordionHead: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
    },
    accordionLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: fantasyTokens.spacing.sm,
        flex: 1,
        minWidth: 0,
    },
    accordionIcon: {
        fontSize: 18,
        lineHeight: 24,
        width: 28,
        textAlign: 'center',
    },
    accordionTitles: { flex: 1, gap: 2 },
    accordionName: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchment,
        fontSize: 15,
    },
    accordionSum: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        opacity: 0.9,
    },
    accordionRight: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: fantasyTokens.spacing.xs,
        maxWidth: '42%',
    },
    badge: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: 10,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        paddingHorizontal: fantasyTokens.spacing.sm,
        paddingVertical: 3,
        borderRadius: 999,
        overflow: 'hidden',
        backgroundColor: fantasyTokens.colors.crimsonSoft,
        color: fantasyTokens.colors.goldLight,
    },
    badgeMuted: {
        backgroundColor: fantasyTokens.colors.nightOverlayDeep,
        color: fantasyTokens.colors.gold,
    },
    chevron: {
        color: fantasyTokens.colors.gold,
        fontSize: 12,
        paddingTop: 2,
    },
    accordionBody: {
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.sheet.form.border,
        padding: fantasyTokens.spacing.md,
        gap: fantasyTokens.spacing.md,
    },
    block: { gap: fantasyTokens.spacing.sm },
    blockLabel: {
        ...fantasyTokens.typography.buttonLabel,
        fontSize: 11,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
    },
    ghostAdd: {
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
    },
    ghostAddLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.goldLight,
    },
    choiceToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: fantasyTokens.spacing.sm,
        padding: fantasyTokens.spacing.md,
        borderWidth: 1,
        borderColor: fantasyTokens.sheet.form.border,
        borderRadius: fantasyTokens.radii.sm,
        backgroundColor: fantasyTokens.colors.nightOverlayMuted,
    },
    choiceToggleText: { flex: 1, gap: 2 },
    choiceToggleLabel: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.parchmentDeep,
    },
    choiceToggleSub: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.gold,
        fontStyle: 'italic',
        opacity: 0.85,
    },
    nonInteractiveSwitch: {
        pointerEvents: 'none',
    },
    choiceBlock: {
        gap: fantasyTokens.spacing.sm,
        paddingTop: fantasyTokens.spacing.sm,
        borderTopWidth: 1,
        borderTopColor: fantasyTokens.sheet.form.border,
        borderStyle: 'dashed',
    },
    chooseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: fantasyTokens.spacing.sm,
    },
    chooseLabel: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.parchmentDeep,
    },
});
