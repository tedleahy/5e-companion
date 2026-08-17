import { countLabel, entryInitials } from '@/components/compendium/compendium-browse-presentation';
import { RACE_OPTIONS } from '@/lib/characterCreation/options';
import type { CompendiumRacesQuery } from '@/types/generated_graphql_types';

export type Race = CompendiumRacesQuery['compendiumRaces'][number];

/** Ability scores a race can be granted a bonus in. */
const ABILITY_COUNT = 6;

export function raceMark(race: Pick<Race, 'value' | 'name' | 'isCustom'>) {
    if (race.isCustom) return entryInitials(race.name);
    return raceIcon(race.value) ?? entryInitials(race.name);
}

/**
 * Emblem for an SRD race, resolved by `value` (`srdIndex ?? id`) rather than by
 * display label, so renaming a race cannot silently drop its icon.
 */
export function raceIcon(value: string) {
    return RACE_OPTIONS.find(
        (option) => option.value.toLocaleLowerCase() === value.toLocaleLowerCase(),
    )?.icon;
}

/**
 * Collapses a uniform spread into one pill. Mirrors the `All +N` case in
 * `abilitySummaryOf` (server/resolvers/compendiumResolver.ts) so the row pills
 * and the summary agree for any bonus, not just +1.
 */
export function raceAbilityPills(race: Pick<Race, 'abilityBonuses'>) {
    const [first] = race.abilityBonuses;
    if (first != null
        && race.abilityBonuses.length === ABILITY_COUNT
        && race.abilityBonuses.every((bonus) => bonus.bonus === first.bonus)) {
        return [`All +${first.bonus}`];
    }
    return race.abilityBonuses.map((bonus) => `${bonus.abilityIndex.toLocaleUpperCase()} +${bonus.bonus}`);
}

export function raceLanguageSummary(race: Pick<Race, 'languages' | 'languageChoiceCount'>) {
    const fixed = countLabel(race.languages.length, 'fixed language');
    if (race.languageChoiceCount === 0) return fixed;
    return `${fixed} + ${countLabel(race.languageChoiceCount, 'choice')}`;
}
