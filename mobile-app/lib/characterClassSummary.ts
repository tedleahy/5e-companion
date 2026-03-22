import type {
    CharacterClass,
    SpellSlot,
    SpellSlotKind,
    SpellcastingProfile,
} from '@/types/generated_graphql_types';

/**
 * Spell-slot kinds in the display order used by the character sheet.
 */
const SPELL_SLOT_KIND_ORDER: SpellSlotKind[] = ['STANDARD', 'PACT_MAGIC'];

/**
 * Sorts class rows by their persisted display order.
 */
function compareCharacterClassOrder(leftClass: CharacterClass, rightClass: CharacterClass): number {
    return leftClass.order - rightClass.order;
}

/**
 * Returns character classes in their persisted display order.
 */
export function sortCharacterClasses(classes: CharacterClass[]): CharacterClass[] {
    return [...classes].sort(compareCharacterClassOrder);
}

/**
 * Returns the first ordered class row, or `null` when unavailable.
 */
function primaryCharacterClass(classes: CharacterClass[]): CharacterClass | null {
    return sortCharacterClasses(classes)[0] ?? null;
}

/**
 * Returns the leading class id used for roster visuals such as gradients.
 */
export function primaryCharacterClassId(classes: CharacterClass[]): string | null {
    return primaryCharacterClass(classes)?.classId ?? null;
}

/**
 * Returns the leading class name used in edit-mode affordances.
 */
export function primaryCharacterClassName(classes: CharacterClass[]): string {
    return primaryCharacterClass(classes)?.className ?? 'Adventurer';
}

/**
 * Builds the display label for a single-class character row.
 */
function formatSingleClassSummary(classRow: CharacterClass): string {
    if (classRow.subclassName) {
        return `${classRow.subclassName} ${classRow.className}`;
    }

    return classRow.className;
}

/**
 * Builds one compact multiclass segment including class level.
 */
function formatMulticlassSegment(classRow: CharacterClass): string {
    return `${classRow.className} ${classRow.level}`;
}

/**
 * Formats a roster/header class summary from ordered class rows.
 */
export function formatCharacterClassSummary(classes: CharacterClass[]): string {
    const orderedClasses = sortCharacterClasses(classes);

    if (orderedClasses.length === 0) {
        return 'Unknown class';
    }

    if (orderedClasses.length === 1) {
        return formatSingleClassSummary(orderedClasses[0]);
    }

    return orderedClasses.map(formatMulticlassSegment).join(' / ');
}

/**
 * Returns unique class ids in display order for spell-filter defaults.
 */
export function orderedCharacterClassIds(classes: CharacterClass[]): string[] {
    const classIds = new Set<string>();

    for (const classRow of sortCharacterClasses(classes)) {
        classIds.add(classRow.classId);
    }

    return [...classIds];
}

/**
 * Returns whether the character has any spellcasting profile data.
 */
export function hasSpellcastingProfiles(spellcastingProfiles: SpellcastingProfile[]): boolean {
    return spellcastingProfiles.length > 0;
}

/**
 * Returns the highest spell attack bonus across all spellcasting profiles.
 */
export function strongestSpellAttackBonus(spellcastingProfiles: SpellcastingProfile[]): number | null {
    if (spellcastingProfiles.length === 0) {
        return null;
    }

    return Math.max(...spellcastingProfiles.map((profile) => profile.spellAttackBonus));
}

/**
 * Returns the highest spell save DC across all spellcasting profiles.
 */
export function strongestSpellSaveDc(spellcastingProfiles: SpellcastingProfile[]): number | null {
    if (spellcastingProfiles.length === 0) {
        return null;
    }

    return Math.max(...spellcastingProfiles.map((profile) => profile.spellSaveDC));
}

/**
 * Human-readable label for a spell-slot group kind.
 */
export function spellSlotKindLabel(kind: SpellSlotKind): string {
    if (kind === 'PACT_MAGIC') {
        return 'Pact Magic';
    }

    return 'Spell Slots';
}

/**
 * One ordered spell-slot group shown in the spell-slot card.
 */
export type SpellSlotGroup = {
    kind: SpellSlotKind;
    label: string;
    slots: SpellSlot[];
};

/**
 * Groups spell slots by kind while preserving level order within each group.
 */
export function groupSpellSlotsByKind(spellSlots: SpellSlot[]): SpellSlotGroup[] {
    const groups = new Map<SpellSlotKind, SpellSlot[]>();

    for (const kind of SPELL_SLOT_KIND_ORDER) {
        groups.set(kind, []);
    }

    for (const spellSlot of spellSlots) {
        const group = groups.get(spellSlot.kind);

        if (!group) {
            groups.set(spellSlot.kind, [spellSlot]);
            continue;
        }

        group.push(spellSlot);
    }

    return [...groups.entries()]
        .map(([kind, slots]) => ({
            kind,
            label: spellSlotKindLabel(kind),
            slots: [...slots]
                .filter((slot) => slot.total > 0)
                .sort((leftSlot, rightSlot) => leftSlot.level - rightSlot.level),
        }))
        .filter((group) => group.slots.length > 0);
}
