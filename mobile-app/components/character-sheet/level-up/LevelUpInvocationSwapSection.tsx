import { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import type { LevelUpInvocationState, SrdInvocation } from '@/lib/characterLevelUp/advancedClassChoices';
import type { InvocationPrerequisiteContext } from '@/lib/characterLevelUp/types';
import { SRD_INVOCATIONS } from '@/lib/characterLevelUp/advancedClassChoices';
import { levelUpPickerStyles } from './levelUpPickerStyles';
import { fantasyTokens } from '@/theme/fantasyTheme';
import InvocationSwapPicker from './InvocationSwapPicker';

type LevelUpInvocationSwapSectionProps = {
    state: LevelUpInvocationState;
    prerequisiteContext: InvocationPrerequisiteContext | null;
    existingInvocations: readonly SrdInvocation[];
    onChangeSwapOut: (invocationId: string | null) => void;
    onChangeSwapIn: (invocation: { id: string; name: string; isCustom: boolean } | null) => void;
};

/**
 * Optional section that allows swapping one existing invocation for another.
 * Uses modal pickers for both the invocation to swap out and the new invocation.
 */
export default function LevelUpInvocationSwapSection({
    state,
    prerequisiteContext,
    existingInvocations,
    onChangeSwapOut,
    onChangeSwapIn,
}: LevelUpInvocationSwapSectionProps) {
    const isSwapping = state.isSwappingInvocation;
    const [showSwapOutPicker, setShowSwapOutPicker] = useState(false);
    const [showSwapInPicker, setShowSwapInPicker] = useState(false);
    const [customName, setCustomName] = useState('');

    const selectedSwapOutInvocation = existingInvocations.find(
        (inv) => inv.id === state.swapOutInvocationId,
    );

    const selectedSwapInSrdInvocation = SRD_INVOCATIONS.find(
        (inv) => inv.id === state.swapInInvocation?.id,
    );

    const isSwapInCustom = state.swapInInvocation?.isCustom ?? false;

    function handleStartSwap() {
        onChangeSwapOut('');
    }

    function handleSwapOutSelect(invocation: SrdInvocation | null) {
        if (invocation) {
            onChangeSwapOut(invocation.id);
        } else {
            onChangeSwapOut('');
        }
    }

    function handleSwapInSelect(invocation: SrdInvocation | null) {
        if (invocation) {
            onChangeSwapIn({
                id: invocation.id,
                name: invocation.name,
                isCustom: false,
            });
            setCustomName('');
        } else {
            // Custom selected - keep current or init with empty
            onChangeSwapIn({
                id: `custom-${Date.now()}`,
                name: customName || 'Custom Invocation',
                isCustom: true,
            });
        }
    }

    function handleCustomNameChange(value: string) {
        setCustomName(value);
        if (isSwapInCustom) {
            onChangeSwapIn({
                id: `custom-${Date.now()}`,
                name: value || 'Custom Invocation',
                isCustom: true,
            });
        }
    }

    function handleCancelSwap() {
        onChangeSwapOut(null);
        onChangeSwapIn(null);
        setCustomName('');
    }

    // Filter out the swapped-out invocation from available swap-in options
    const availableSwapInInvocations = SRD_INVOCATIONS.filter(
        (inv) => inv.id !== state.swapOutInvocationId,
    );

    return (
        <View style={levelUpPickerStyles.pickerSection} testID="level-up-invocation-swap">
            <Text style={levelUpPickerStyles.pickerTitle}>Swap an Invocation</Text>
            <Text style={levelUpPickerStyles.bodyText}>
                You may replace one invocation you know with a different one.
            </Text>

            {!isSwapping ? (
                <Pressable
                    onPress={handleStartSwap}
                    style={levelUpPickerStyles.addCustomButton}
                    testID="level-up-invocation-start-swap"
                    accessibilityLabel="Start invocation swap"
                >
                    <Text style={levelUpPickerStyles.addCustomButtonText}>Swap an Invocation</Text>
                </Pressable>
            ) : (
                <View style={styles.swapCard} testID="level-up-invocation-swap-entry">
                    {/* Swap Out Input */}
                    <Pressable
                        onPress={() => setShowSwapOutPicker(true)}
                        style={styles.selectorInput}
                        testID="level-up-invocation-swap-out-input"
                        accessibilityLabel="Select invocation to replace"
                    >
                        <Text style={styles.selectorLabel}>Invocation to replace</Text>
                        <Text style={selectedSwapOutInvocation ? styles.selectorValue : styles.selectorPlaceholder}>
                            {selectedSwapOutInvocation?.name ?? 'Tap to select...'}
                        </Text>
                    </Pressable>

                    {/* Swap In Input */}
                    <Pressable
                        onPress={() => setShowSwapInPicker(true)}
                        style={styles.selectorInput}
                        testID="level-up-invocation-swap-in-input"
                        accessibilityLabel="Select new invocation"
                    >
                        <Text style={styles.selectorLabel}>New invocation</Text>
                        <Text style={selectedSwapInSrdInvocation || isSwapInCustom ? styles.selectorValue : styles.selectorPlaceholder}>
                            {selectedSwapInSrdInvocation?.name
                                ?? (isSwapInCustom ? state.swapInInvocation?.name : 'Tap to select...')}
                        </Text>
                    </Pressable>

                    {/* Custom name input (only when custom is selected) */}
                    {isSwapInCustom ? (
                        <TextInput
                            label="Custom invocation name"
                            mode="outlined"
                            value={customName}
                            onChangeText={handleCustomNameChange}
                            style={styles.customInput}
                            testID="level-up-invocation-swap-in-custom-name"
                        />
                    ) : null}

                    <Pressable
                        onPress={handleCancelSwap}
                        style={styles.removeButton}
                        testID="level-up-invocation-cancel-swap"
                    >
                        <Text style={styles.removeButtonText}>Cancel Swap</Text>
                    </Pressable>
                </View>
            )}

            {/* Swap Out Picker Modal */}
            <InvocationSwapPicker
                visible={showSwapOutPicker}
                title="Select Invocation to Replace"
                invocations={existingInvocations}
                selectedId={state.swapOutInvocationId}
                prerequisiteContext={null}
                onSelect={handleSwapOutSelect}
                onDismiss={() => setShowSwapOutPicker(false)}
                testIdPrefix="swap-out-picker"
            />

            {/* Swap In Picker Modal */}
            <InvocationSwapPicker
                visible={showSwapInPicker}
                title="Select New Invocation"
                invocations={availableSwapInInvocations}
                selectedId={isSwapInCustom ? 'custom' : state.swapInInvocation?.id ?? null}
                prerequisiteContext={prerequisiteContext}
                onSelect={handleSwapInSelect}
                onDismiss={() => setShowSwapInPicker(false)}
                testIdPrefix="swap-in-picker"
                allowCustom={true}
                customLabel="+ Custom Invocation"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    swapCard: {
        borderRadius: fantasyTokens.radii.md,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        backgroundColor: fantasyTokens.colors.parchmentLight,
        padding: fantasyTokens.spacing.lg,
        gap: fantasyTokens.spacing.sm,
        marginTop: fantasyTokens.spacing.sm,
    },
    selectorInput: {
        borderWidth: 1,
        borderColor: fantasyTokens.colors.sheetDivider,
        borderRadius: fantasyTokens.radii.md,
        paddingHorizontal: fantasyTokens.spacing.md,
        paddingVertical: fantasyTokens.spacing.sm,
        backgroundColor: fantasyTokens.colors.parchment,
    },
    selectorLabel: {
        ...fantasyTokens.typography.bodySmall,
        color: fantasyTokens.colors.inkSoft,
        marginBottom: fantasyTokens.spacing.xs,
    },
    selectorValue: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkDark,
    },
    selectorPlaceholder: {
        ...fantasyTokens.typography.body,
        color: fantasyTokens.colors.inkSoft,
        fontStyle: 'italic',
    },
    customInput: {
        marginTop: fantasyTokens.spacing.xs,
    },
    removeButton: {
        alignSelf: 'flex-end',
        marginTop: fantasyTokens.spacing.sm,
    },
    removeButtonText: {
        ...fantasyTokens.typography.buttonLabel,
        color: fantasyTokens.colors.ember,
    },
});
