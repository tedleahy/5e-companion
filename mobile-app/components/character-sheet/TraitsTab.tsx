import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { deriveProficienciesAndLanguages } from '@/lib/featuresTabUtils';
import { keyboardAwareBottomOffset, keyboardAwareScrollProps } from '@/lib/keyboardUtils';
import type { CharacterTraitsData } from '@/components/character-sheet/features/features.types';
import PersonalityCard from './features/PersonalityCard';
import ProficienciesCard from './features/ProficienciesCard';

type TraitTextField = 'personality' | 'ideals' | 'bonds' | 'flaws';
type TraitTagField = 'armorProficiencies' | 'weaponProficiencies' | 'toolProficiencies' | 'languages';

/**
 * Props for the Traits tab section of the character sheet.
 */
type TraitsTabProps = {
    background: string;
    traits: CharacterTraitsData;
    editMode: boolean;
    onChangeTraitText: (field: TraitTextField, value: string) => void;
    onAddTraitTag: (field: TraitTagField) => void;
    onChangeTraitTag: (field: TraitTagField, index: number, value: string) => void;
    onRemoveTraitTag: (field: TraitTagField, index: number) => void;
};

/**
 * Traits tab displaying personality/background and proficiencies/languages.
 *
 * **React Native learning note:**
 * Splitting this into its own tab (from Features) means PagerView gives it
 * a dedicated swipeable page. Each tab component owns its own scroll view
 * so scroll positions are independent across tabs.
 */
export default function TraitsTab({
    background,
    traits,
    editMode,
    onChangeTraitText,
    onAddTraitTag,
    onChangeTraitTag,
    onRemoveTraitTag,
}: TraitsTabProps) {
    const proficienciesAndLanguages = deriveProficienciesAndLanguages(traits);
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
                <PersonalityCard
                    background={background}
                    traits={traits}
                    index={0}
                    editMode={editMode}
                    onChangeTraitText={onChangeTraitText}
                />
                {(hasProficienciesData || editMode) && (
                    <ProficienciesCard
                        data={proficienciesAndLanguages}
                        index={1}
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

/** Styles for the Traits tab layout. */
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
