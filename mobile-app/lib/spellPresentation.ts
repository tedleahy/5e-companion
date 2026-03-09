/**
 * Uppercases the first character of a single word segment.
 */
function capitaliseSegment(segment: string): string {
    if (segment.length === 0) return segment;
    return segment.charAt(0).toUpperCase() + segment.slice(1);
}

/**
 * Converts a kebab-case spell school index into a human-friendly label.
 */
export function spellSchoolLabel(schoolIndex: string): string {
    return schoolIndex
        .split('-')
        .map((segment) => capitaliseSegment(segment))
        .join(' ');
}

/**
 * Builds an ordinal suffix label for a numeric spell level.
 */
export function spellLevelLabel(level: number): string {
    if (level === 0) return 'Cantrip';

    const suffixMap: Record<number, string> = {
        1: 'st',
        2: 'nd',
        3: 'rd',
    };

    const suffix = suffixMap[level] ?? 'th';
    return `${level}${suffix} Level`;
}

/**
 * Builds a section header title for grouped spell lists.
 */
export function spellLevelSectionTitle(level: number | null): string {
    if (level == null) return 'Spells';
    if (level === 0) return 'Cantrips';
    return spellLevelLabel(level);
}
