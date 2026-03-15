import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { groupFeatures } from '@/lib/featuresTabUtils';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';
import type { FeatureRow } from '@/components/character-sheet/features/features.types';
import FeatureSectionCard from './features/FeatureSectionCard';

/**
 * Props for the Features tab section of the character sheet.
 */
type FeaturesTabProps = {
    className: string;
    race: string;
    features: FeatureRow[];
    editMode: boolean;
    onAddClassFeature: () => void;
    onAddRacialTrait: () => void;
    onAddFeat: () => void;
    onChangeFeature: (featureId: string, changes: Partial<FeatureRow>) => void;
    onRemoveFeature: (featureId: string) => void;
};

/**
 * Features tab with class features, racial traits, and feats.
 */
export default function FeaturesTab({
    className,
    race,
    features,
    editMode,
    onAddClassFeature,
    onAddRacialTrait,
    onAddFeat,
    onChangeFeature,
    onRemoveFeature,
}: FeaturesTabProps) {
    const groupedFeatures = groupFeatures(features, className, race);

    return (
        <View style={styles.container}>
            <KeyboardAwareScrollView
                {...keyboardAwareScrollProps}
                bottomOffset={keyboardAwareBottomOffset}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <FeatureSectionCard
                    title="Class Features"
                    features={groupedFeatures.classFeatures}
                    emptyText="No class features recorded."
                    category="class"
                    index={0}
                    editMode={editMode}
                    onAdd={onAddClassFeature}
                    onChangeFeature={onChangeFeature}
                    onRemoveFeature={onRemoveFeature}
                />
                <FeatureSectionCard
                    title="Racial Traits"
                    features={groupedFeatures.racialTraits}
                    emptyText="No racial traits recorded."
                    category="racial"
                    index={1}
                    editMode={editMode}
                    onAdd={onAddRacialTrait}
                    onChangeFeature={onChangeFeature}
                    onRemoveFeature={onRemoveFeature}
                />
                <FeatureSectionCard
                    title="Feats"
                    features={groupedFeatures.feats}
                    emptyText="No feats recorded."
                    category="feat"
                    index={2}
                    editMode={editMode}
                    onAdd={onAddFeat}
                    onChangeFeature={onChangeFeature}
                    onRemoveFeature={onRemoveFeature}
                />
            </KeyboardAwareScrollView>
        </View>
    );
}

/** Styles for the Features tab layout. */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: fantasyTokens.colors.night,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: fantasyTokens.spacing.md,
        paddingTop: 10,
        paddingBottom: fantasyTokens.spacing.xl * 2,
        gap: 12,
    },
});
