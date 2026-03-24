import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fantasyTokens } from '@/theme/fantasyTheme';
import type { CharacterTraitsData } from '@/components/character-sheet/features/features.types';
import CardDivider from '../CardDivider';
import InlineField from '../edit-mode/InlineField';
import SectionLabel from '../SectionLabel';
import SheetCard from '../SheetCard';

type TraitTextField = 'personality' | 'ideals' | 'bonds' | 'flaws';

/**
 * Props for the personality/background card.
 */
type PersonalityCardProps = {
    background: string;
    traits: CharacterTraitsData;
    index: number;
    editMode: boolean;
    onChangeTraitText: (field: TraitTextField, value: string) => void;
};

/**
 * Props for a single personality trait text block.
 */
type TraitBlockProps = {
    label: string;
    text: string;
    editMode: boolean;
    placeholder: string;
    onChangeText: (value: string) => void;
};

/**
 * Displays one labeled personality field with an empty placeholder.
 */
function TraitBlock({ label, text, editMode, placeholder, onChangeText }: TraitBlockProps) {
    const hasText = text.trim().length > 0;

    return (
        <View style={styles.traitBlock}>
            <Text style={styles.traitLabel}>{label}</Text>
            <InlineField
                value={text}
                onChangeText={onChangeText}
                editMode={editMode}
                style={[styles.traitText, !hasText && styles.placeholderText]}
                placeholder={placeholder}
                multiline
            />
        </View>
    );
}

/**
 * Displays background plus personality/ideals/bonds/flaws content.
 */
export default function PersonalityCard({
    background,
    traits,
    index,
    editMode,
    onChangeTraitText,
}: PersonalityCardProps) {
    return (
        <SheetCard index={index}>
            <SectionLabel>Personality & Background</SectionLabel>

            <View style={styles.backgroundRow}>
                <Text style={styles.backgroundText}>{background}</Text>
            </View>

            <View style={styles.content}>
                <TraitBlock
                    label="Personality Traits"
                    text={traits.personality}
                    editMode={editMode}
                    placeholder="No entry yet."
                    onChangeText={(value: string) => onChangeTraitText('personality', value)}
                />
                <CardDivider />
                <TraitBlock
                    label="Ideals"
                    text={traits.ideals}
                    editMode={editMode}
                    placeholder="No entry yet."
                    onChangeText={(value: string) => onChangeTraitText('ideals', value)}
                />
                <CardDivider />
                <TraitBlock
                    label="Bonds"
                    text={traits.bonds}
                    editMode={editMode}
                    placeholder="No entry yet."
                    onChangeText={(value: string) => onChangeTraitText('bonds', value)}
                />
                <CardDivider />
                <TraitBlock
                    label="Flaws"
                    text={traits.flaws}
                    editMode={editMode}
                    placeholder="No entry yet."
                    onChangeText={(value: string) => onChangeTraitText('flaws', value)}
                />
            </View>
        </SheetCard>
    );
}

/** Styles for personality/background card content. */
const styles = StyleSheet.create({
    backgroundRow: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 2,
    },
    backgroundText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.caption,
        color: fantasyTokens.colors.gold,
        opacity: 0.7,
    },
    content: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 14,
        gap: 8,
    },
    traitBlock: {
        paddingVertical: 4,
        gap: 4,
    },
    traitLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.45,
    },
    traitText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.body,
        lineHeight: 19,
        color: fantasyTokens.colors.inkLight,
        fontStyle: 'italic',
    },
    placeholderText: {
        opacity: 0.4,
    },
});
