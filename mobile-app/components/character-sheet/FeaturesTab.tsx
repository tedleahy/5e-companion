import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { deriveProficienciesAndLanguages, groupFeatures } from '@/lib/featuresTabUtils';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';
import type {
    CharacterTraitsData,
    FeatureRow,
} from '@/components/character-sheet/features/features.types';
import FeatureSectionCard from './features/FeatureSectionCard';
import PersonalityCard from './features/PersonalityCard';
import ProficienciesCard from './features/ProficienciesCard';

type TraitTextField = 'personality' | 'ideals' | 'bonds' | 'flaws';
type TraitTagField = 'armorProficiencies' | 'weaponProficiencies' | 'toolProficiencies' | 'languages';

/**
 * Props for the Features tab section of the character sheet.
 */
type FeaturesTabProps = {
    className: string;
    race: string;
    background: string;
    features: FeatureRow[];
    traits: CharacterTraitsData;
    editMode: boolean;
    onAddClassFeature: () => void;
    onAddRacialTrait: () => void;
    onAddFeat: () => void;
    onChangeFeature: (featureId: string, changes: Partial<FeatureRow>) => void;
    onRemoveFeature: (featureId: string) => void;
    onChangeTraitText: (field: TraitTextField, value: string) => void;
    onAddTraitTag: (field: TraitTagField) => void;
    onChangeTraitTag: (field: TraitTagField, index: number, value: string) => void;
    onRemoveTraitTag: (field: TraitTagField, index: number) => void;
};

/**
 * Features tab with class/racial/feat sections plus personality and proficiencies.
 */
export default function FeaturesTab({
    className,
    race,
    background,
    features,
    traits,
    editMode,
    onAddClassFeature,
    onAddRacialTrait,
    onAddFeat,
    onChangeFeature,
    onRemoveFeature,
    onChangeTraitText,
    onAddTraitTag,
    onChangeTraitTag,
    onRemoveTraitTag,
}: FeaturesTabProps) {
    const groupedFeatures = groupFeatures(features, className, race);
    const proficienciesAndLanguages = deriveProficienciesAndLanguages(traits);
    /** Whether there is any proficiency/language metadata to render. */
    const hasProficienciesData =
        proficienciesAndLanguages.armor.length > 0
        || proficienciesAndLanguages.weapons.length > 0
        || proficienciesAndLanguages.tools.length > 0
        || proficienciesAndLanguages.languages.length > 0;

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
                <PersonalityCard
                    background={background}
                    traits={traits}
                    index={3}
                    editMode={editMode}
                    onChangeTraitText={onChangeTraitText}
                />
                {(hasProficienciesData || editMode) && (
                    <ProficienciesCard
                        data={proficienciesAndLanguages}
                        index={4}
                        editMode={editMode}
                        onAddTag={onAddTraitTag}
                        onChangeTag={onChangeTraitTag}
                        onRemoveTag={onRemoveTraitTag}
                    />
                )}
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
