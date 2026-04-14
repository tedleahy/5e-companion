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
import OptionPickerList from './OptionPickerList';

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
 * Adapter to convert SrdInvocation to the format expected by OptionPickerList.
 */
type OptionShape = {
    id: string;
    name: string;
    description: string;
    fullDescription: string;
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
    // Convert invocations to the shape expected by OptionPickerList
    const options: OptionShape[] = invocations.map((inv) => ({
        id: inv.id,
        name: inv.name,
        description: inv.description,
        fullDescription: inv.fullDescription,
    }));

    function getPrerequisite(option: OptionShape) {
        const invocation = invocations.find((i) => i.id === option.id);
        if (!invocation || !prerequisiteContext || !invocation.prerequisite) return null;
        const result = checkInvocationPrerequisite(invocation.prerequisite, prerequisiteContext);
        return {
            text: invocation.prerequisite,
            met: result.met,
            reason: result.reason,
        };
    }

    function handleSelect(optionId: string) {
        const invocation = invocations.find((i) => i.id === optionId) ?? null;
        onSelect(invocation);
        onDismiss();
    }

    function handleCustomSelect() {
        onSelect(null);
        onDismiss();
    }

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
                        <OptionPickerList<OptionShape>
                            mode="single"
                            options={options}
                            selectedIds={selectedId ? [selectedId] : []}
                            onToggle={handleSelect}
                            testIdPrefix={testIdPrefix}
                            getPrerequisite={getPrerequisite}
                        />

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
