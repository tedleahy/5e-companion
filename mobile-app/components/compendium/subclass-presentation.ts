import { CLASS_OPTIONS } from '@/lib/characterCreation/options';
import { countLabel } from '@/components/compendium/compendium-browse-presentation';
import type { CompendiumSubclassesQuery } from '@/types/generated_graphql_types';

export type Subclass = CompendiumSubclassesQuery['compendiumSubclasses'][number];
export type SubclassFeature = Subclass['features'][number];

/**
 * Parent-class emblem for the row and detail marks. Resolved by `classId`, which
 * carries the class SRD index, so display labels cannot drift it.
 */
export function classMark(classId: string) {
    return CLASS_OPTIONS.find((option) => option.value === classId)?.icon ?? '✦';
}

/** Features ordered by the level they unlock, then by name within a level. */
export function orderedSubclassFeatures(features: readonly SubclassFeature[]): SubclassFeature[] {
    return [...features].sort((left, right) => (
        left.level === right.level
            ? left.name.localeCompare(right.name)
            : left.level - right.level
    ));
}

/** Row meta line: where the subclass is picked and how much it carries. */
export function subclassMeta(subclass: Subclass) {
    return `${subclass.className} · level ${subclass.selectionLevel} · ${countLabel(subclass.features.length, 'feature')}`;
}

/** Paragraphs joined for display; null when the subclass records no description. */
export function subclassDescription(subclass: Pick<Subclass, 'description'>): string | null {
    const description = subclass.description.join('\n\n').trim();
    return description.length === 0 ? null : description;
}
