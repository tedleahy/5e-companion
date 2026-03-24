import type { ProficienciesAndLanguages } from '@/components/character-sheet/features/features.types';
import { fantasyTokens } from '@/theme/fantasyTheme';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import InlineField from '../edit-mode/InlineField';
import SectionHeader from '../edit-mode/SectionHeader';
import SheetCard from '../SheetCard';

type TraitTagField =
    | 'armorProficiencies'
    | 'weaponProficiencies'
    | 'toolProficiencies'
    | 'languages';

/**
 * Props for the proficiencies/languages summary card.
 */
type ProficienciesCardProps = {
    data: ProficienciesAndLanguages;
    index: number;
    editMode: boolean;
    onAddTag: (field: TraitTagField) => void;
    onChangeTag: (field: TraitTagField, index: number, value: string) => void;
    onRemoveTag: (field: TraitTagField, index: number) => void;
};

/**
 * Props for one labeled proficiency row.
 */
type ProficiencyRowProps = {
    field: TraitTagField;
    label: string;
    values: string[];
    editMode: boolean;
    onAddTag: (field: TraitTagField) => void;
    onChangeTag: (field: TraitTagField, index: number, value: string) => void;
    onRemoveTag: (field: TraitTagField, index: number) => void;
};

/**
 * Renders one proficiency category as a set of pill tags.
 */
function ProficiencyRow({
    field,
    label,
    values,
    editMode,
    onAddTag,
    onChangeTag,
    onRemoveTag,
}: ProficiencyRowProps) {
    return (
        <View style={styles.row}>
            <View style={styles.rowHeader}>
                <Text style={styles.rowLabel}>{label}</Text>
                {editMode && (
                    <Pressable
                        onPress={() => onAddTag(field)}
                        accessibilityRole="button"
                        accessibilityLabel={`Add ${label.toLowerCase()} proficiency`}
                    >
                        <Text style={styles.addTagButton}>+ Add</Text>
                    </Pressable>
                )}
            </View>
            <View style={styles.tags}>
                {values.map((value, index) => (
                    <View key={`${field}-${index}`} style={styles.tag}>
                        <InlineField
                            value={value}
                            onChangeText={(nextValue: string) =>
                                onChangeTag(field, index, nextValue)
                            }
                            editMode={editMode}
                            style={styles.tagText}
                            placeholder="Tag"
                        />
                        {editMode && (
                            <Pressable
                                onPress={() => onRemoveTag(field, index)}
                                style={styles.removeBadge}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove ${label.toLowerCase()} tag`}
                            >
                                <Text style={styles.removeBadgeText}>×</Text>
                            </Pressable>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

/**
 * Displays armor/weapon/tool/language proficiencies.
 */
export default function ProficienciesCard({
    data,
    index,
    editMode,
    onAddTag,
    onChangeTag,
    onRemoveTag,
}: ProficienciesCardProps) {
    return (
        <SheetCard index={index}>
            <SectionHeader title="Proficiencies & Languages" editMode={false} />
            {!editMode && (
                <Text style={styles.readOnlyHint}>Tap Edit to modify</Text>
            )}
            <View style={styles.block}>
                <ProficiencyRow
                    field="armorProficiencies"
                    label="Armor"
                    values={data.armor}
                    editMode={editMode}
                    onAddTag={onAddTag}
                    onChangeTag={onChangeTag}
                    onRemoveTag={onRemoveTag}
                />
                <ProficiencyRow
                    field="weaponProficiencies"
                    label="Weapons"
                    values={data.weapons}
                    editMode={editMode}
                    onAddTag={onAddTag}
                    onChangeTag={onChangeTag}
                    onRemoveTag={onRemoveTag}
                />
                <ProficiencyRow
                    field="toolProficiencies"
                    label="Tools"
                    values={data.tools}
                    editMode={editMode}
                    onAddTag={onAddTag}
                    onChangeTag={onChangeTag}
                    onRemoveTag={onRemoveTag}
                />
                <ProficiencyRow
                    field="languages"
                    label="Languages"
                    values={data.languages}
                    editMode={editMode}
                    onAddTag={onAddTag}
                    onChangeTag={onChangeTag}
                    onRemoveTag={onRemoveTag}
                />
            </View>
        </SheetCard>
    );
}

/** Styles for proficiency rows and tags. */
const styles = StyleSheet.create({
    block: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 14,
        gap: 12,
    },
    row: {
        gap: 6,
    },
    rowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowLabel: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.inkLight,
        opacity: 0.45,
    },
    addTagButton: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: fantasyTokens.colors.gold,
        opacity: 0.75,
    },
    tags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    tag: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: fantasyTokens.colors.divider,
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        position: 'relative',
    },
    tagText: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.label,
        color: fantasyTokens.colors.inkLight,
    },
    removeBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(139,26,26,0.14)',
    },
    removeBadgeText: {
        color: fantasyTokens.colors.crimson,
        fontSize: fantasyTokens.fontSizes.caption,
        lineHeight: 11,
        fontWeight: '700',
    },
    readOnlyHint: {
        fontFamily: fantasyTokens.fonts.regular,
        fontSize: fantasyTokens.fontSizes.utility,
        letterSpacing: 1,
        color: fantasyTokens.colors.inkSoft,
        textAlign: 'center',
        marginTop: -2,
        marginBottom: 2,
    },
});
