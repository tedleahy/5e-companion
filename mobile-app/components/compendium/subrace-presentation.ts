import { raceIcon } from '@/components/compendium/race-presentation';
import type { CompendiumSubracesQuery } from '@/types/generated_graphql_types';

export type Subrace = CompendiumSubracesQuery['compendiumSubraces'][number];

export function parentMark(parentName: string) {
    return raceIcon(parentName) ?? '✦';
}
