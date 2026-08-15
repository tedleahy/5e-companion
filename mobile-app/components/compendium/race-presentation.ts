import { countLabel, entryInitials } from '@/components/compendium/compendium-browse-presentation';
import { RACE_OPTIONS } from '@/lib/characterCreation/options';
import type { CompendiumRacesQuery } from '@/types/generated_graphql_types';

export type Race = CompendiumRacesQuery['compendiumRaces'][number];

export function raceMark(race: Pick<Race, 'name' | 'isCustom'>) {
    if (race.isCustom) return entryInitials(race.name);
    return raceIcon(race.name) ?? entryInitials(race.name);
}

export function raceIcon(name: string) {
    return RACE_OPTIONS.find((option) => option.label.toLocaleLowerCase() === name.toLocaleLowerCase())
        ?.icon;
}

export function raceAbilityPills(race: Pick<Race, 'abilityBonuses'>) {
    if (race.abilityBonuses.length === 6 && race.abilityBonuses.every((bonus) => bonus.bonus === 1)) {
        return ['All +1'];
    }
    return race.abilityBonuses.map((bonus) => `${bonus.abilityIndex.toLocaleUpperCase()} +${bonus.bonus}`);
}

export function raceLanguageSummary(race: Pick<Race, 'languages' | 'languageChoiceCount'>) {
    const fixed = countLabel(race.languages.length, 'fixed language');
    if (race.languageChoiceCount === 0) return fixed;
    return `${fixed} + ${countLabel(race.languageChoiceCount, 'choice')}`;
}
