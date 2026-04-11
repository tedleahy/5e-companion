import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { LevelUpInvocationState } from '@/lib/characterLevelUp/advancedClassChoices';
import CustomEntryCard from './CustomEntryCard';
import { levelUpPickerStyles } from './levelUpPickerStyles';

type LevelUpInvocationSwapSectionProps = {
    state: LevelUpInvocationState;
    onChangeSwapOut: (invocationId: string | null) => void;
    onChangeSwapIn: (invocation: { id: string; name: string; isCustom: boolean } | null) => void;
};

/**
 * Optional section that allows swapping one existing invocation for another.
 */
export default function LevelUpInvocationSwapSection({
    state,
    onChangeSwapOut,
    onChangeSwapIn,
}: LevelUpInvocationSwapSectionProps) {
    const isSwapping = state.isSwappingInvocation;

    return (
        <View style={levelUpPickerStyles.pickerSection} testID="level-up-invocation-swap">
            <Text style={levelUpPickerStyles.pickerTitle}>Swap an Invocation</Text>
            <Text style={levelUpPickerStyles.bodyText}>
                You may replace one invocation you know with a different one.
            </Text>

            {!isSwapping ? (
                <Pressable
                    onPress={() => onChangeSwapOut('')}
                    style={levelUpPickerStyles.addCustomButton}
                    testID="level-up-invocation-start-swap"
                    accessibilityLabel="Start invocation swap"
                >
                    <Text style={levelUpPickerStyles.addCustomButtonText}>Swap an Invocation</Text>
                </Pressable>
            ) : (
                <CustomEntryCard
                    firstLabel="Invocation to replace"
                    firstValue={state.swapOutInvocationId ?? ''}
                    onFirstChange={(text) => onChangeSwapOut(text)}
                    firstPlaceholder="Name of invocation to remove"
                    firstTestID="level-up-invocation-swap-out"
                    secondLabel="New invocation name"
                    secondValue={state.swapInInvocation?.name ?? ''}
                    onSecondChange={(text) => onChangeSwapIn(text ? { id: `custom-swap-${text}`, name: text, isCustom: true } : null)}
                    secondPlaceholder="Name of replacement invocation"
                    secondTestID="level-up-invocation-swap-in"
                    onRemove={() => {
                        onChangeSwapOut(null);
                        onChangeSwapIn(null);
                    }}
                    removeLabel="Cancel Swap"
                    cardTestID="level-up-invocation-swap-entry"
                />
            )}
        </View>
    );
}
