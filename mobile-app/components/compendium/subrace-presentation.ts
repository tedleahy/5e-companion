import { raceIcon } from '@/components/compendium/race-presentation';
import type { CompendiumSubracesQuery } from '@/types/generated_graphql_types';

export type Subrace = CompendiumSubracesQuery['compendiumSubraces'][number];

/** Parent-race mark reused as the subrace row and detail emblem. */
export function parentMark(parentName: string) {
    return raceIcon(parentName) ?? '✦';
}

/** Compact glyph for the subrace side of the inheritance diagram. */
export function subraceBonusGlyph(bonuses: readonly { bonus: number }[]) {
    if (bonuses.length === 0) return '—';
    if (bonuses.length === 1) return `+${bonuses[0]!.bonus}`;
    return '+';
}

/** Spoken summary of parent grants plus the subrace addition. */
export function lineageInheritanceLabel(subrace: Pick<Subrace, 'name' | 'abilitySummary' | 'parentRace'>) {
    const parentGrant = subrace.parentRace.abilitySummary ?? 'no listed bonus';
    const addition = subrace.abilitySummary == null
        ? 'adds no additional ability bonus'
        : `adds ${subrace.abilitySummary}`;
    return `Lineage inheritance: ${subrace.parentRace.name} grants ${parentGrant}; ${subrace.name} ${addition}`;
}
