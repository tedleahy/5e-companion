import { useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens, fantasyFonts } from '@/theme/fantasyTheme';
import type { SrdInvocation } from '@/lib/characterLevelUp/advancedClassChoices';
import type { InvocationPrerequisiteContext } from '@/lib/characterLevelUp/types';
import { checkInvocationPrerequisite } from '@/lib/characterLevelUp/advancedClassChoices';

type InvocationSwapPickerProps = {
    visible: boolean;
    title: string;
    invocations: readonly SrdInvocation[];
    selectedId: string | null;
    prerequisiteContext: InvocationPrerequisiteContext | null;
    onSelect: (invocation: SrdInvocation | null) => void;
    onDismiss: () => void;
    testIdPrefix: string;
    allowCustom?: boolean;
    customLabel?: string;
};

/**
 * Modal picker for selecting a single invocation (for swap-out or swap-in).
 * Displays invocations in a scrollable list with prerequisite checking.
 */
export default function InvocationSwapPicker({
    visible,
    title,
    invocations,
    selectedId,
    prerequisiteContext,
    onSelect,
    onDismiss,
    testIdPrefix,
    allowCustom = false,
    customLabel = '+ Custom Invocation',
}: InvocationSwapPickerProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    function toggleExpanded(id: string) {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function handleSelect(invocation: SrdInvocation) {
        onSelect(invocation);
        onDismiss();
    }

    function handleCustomSelect() {
        onSelect(null);
        onDismiss();
    }

    const annotatedInvocations = useMemo(() =>
        invocations.map((invocation) => {
            const isSelected = selectedId === invocation.id;
            const checkResult = prerequisiteContext && invocation.prerequisite
                ? checkInvocationPrerequisite(invocation.prerequisite, prerequisiteContext)
                : null;
            const prereq = checkResult && invocation.prerequisite
                ? { text: invocation.prerequisite, met: checkResult.met, reason: checkResult.reason }
                : null;
            return { invocation, isSelected, prereq };
        }),
        [invocations, selectedId, prerequisiteContext],
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onDismiss}
            testID={`${testIdPrefix}-modal`}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <Pressable
                            onPress={onDismiss}
                            style={styles.closeButton}
                            testID={`${testIdPrefix}-close`}
                            accessibilityLabel="Close picker"
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        testID={`${testIdPrefix}-scroll`}
                    >
                        {annotatedInvocations.map(({ invocation, isSelected, prereq }) => {
                            const isDisabled = prereq ? !prereq.met && !isSelected : false;
                            const isExpanded = expandedIds.has(invocation.id);
                            const hasLongerDescription = invocation.fullDescription.length > invocation.description.length + 10;

                            return (
                                <View
                                    key={invocation.id}
                                    style={[
                                        styles.optionCard,
                                        isSelected && styles.optionCardSelected,
                                        isDisabled && styles.optionCardDisabled,
                                    ]}
                                >
                                    <Pressable
                                        onPress={() => { if (!isDisabled) handleSelect(invocation); }}
                                        style={styles.optionToggleArea}
                                        testID={`${testIdPrefix}-option-${invocation.id}`}
                                        accessibilityRole="radio"
                                        accessibilityState={{ checked: isSelected, disabled: isDisabled }}
                                        accessibilityLabel={`Select ${invocation.name}`}
                                        disabled={isDisabled}
                                    >
                                        <View style={styles.optionHeader}>
                                            <Text style={[
                                                styles.optionName,
                                                isSelected && styles.optionNameSelected,
                                                isDisabled && styles.optionNameDisabled,
                                            ]}>
                                                {invocation.name}
                                            </Text>
                                            {isSelected ? <Text style={styles.selectedBadge}>Selected</Text> : null}
                                        </View>
                                        <Text style={[styles.optionDescription, isDisabled && styles.optionDescriptionDisabled]}>
                                            {isExpanded ? invocation.fullDescription : invocation.description}
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
                                            onPress={() => toggleExpanded(invocation.id)}
                                            hitSlop={8}
                                            testID={`${testIdPrefix}-read-more-${invocation.id}`}
                                        >
                                            <Text style={styles.readMoreText}>
                                                {isExpanded ? 'Show less' : 'Read more'}
                                            </Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            );
                        })}

                        {allowCustom ? (
                            <Pressable
                                onPress={handleCustomSelect}
                                style={[
                                    styles.customButton,
                                    selectedId === 'custom' && styles.customButtonSelected,
                                ]}
                                testID={`${testIdPrefix}-custom-option`}
                                accessibilityLabel={customLabel}
                            >
                                <Text style={[
                                    styles.customButtonText,
                                    selectedId === 'custom' && styles.customButtonTextSelected,
                                ]}>
                                    {customLabel}
                                </Text>
                            </Pressable>
                        ) : null}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: fantasyTokens.colors.parchment,
        borderTopLeftRadius: fantasyTokens.radii.lg,
        borderTopRightRadius: fantasyTokens.radii.lg,
        maxHeight: '80%',
        paddingBottom: fantasyTokens.spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: fantasyTokens.spacing.lg,
        paddingVertical: fantasyTokens.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: fantasyTokens.colors.sheetDivider,
    },
    title: {
        ...fantasyTokens.typography.sectionLabel,
        color: fantasyTokens.colors.inkDark,
        flex: 1,
    },
    closeButton: {
        padding: fantasyTokens.spacing.sm,
    },
    closeButtonText: {
        ...fantasyTokens.typography.bodyLarge,
        color: fantasyTokens.colors.inkLight,
    },
    scrollView: {
        maxHeight: '100%',
    },
    scrollContent: {
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.md,
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
    optionCardSelected: {
        borderColor: fantasyTokens.colors.claret,
        backgroundColor: 'rgba(106,17,48,0.06)',
    },
    optionCardDisabled: {
        opacity: 0.5,
        backgroundColor: 'rgba(212,201,180,0.3)',
    },
    optionToggleArea: {
        gap: fantasyTokens.spacing.xs,
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
    customButton: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.claret,
        borderRadius: fantasyTokens.radii.md,
        borderStyle: 'dashed',
        paddingVertical: fantasyTokens.spacing.md,
        alignItems: 'center',
        marginTop: fantasyTokens.spacing.sm,
    },
    customButtonSelected: {
        backgroundColor: 'rgba(106,17,48,0.06)',
    },
    customButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.claret,
    },
    customButtonTextSelected: {
        fontFamily: fantasyFonts.semiBold,
    },
});
