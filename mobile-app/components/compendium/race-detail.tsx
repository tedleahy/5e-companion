import { countLabel, listOrFallback, sourceLabel } from '@/components/compendium/compendium-browse-presentation';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import CompendiumDetailHero from '@/components/compendium/detail/detail-hero';
import CompendiumDetailSection from '@/components/compendium/detail/detail-section';
import CompendiumFactGrid from '@/components/compendium/detail/fact-grid';
import CompendiumJumpLinks from '@/components/compendium/detail/jump-links';
import CompendiumReferenceList from '@/components/compendium/detail/reference-list';
import CompendiumTraitList from '@/components/compendium/detail/trait-list';
import { raceLanguageSummary, raceMark, type Race } from '@/components/compendium/race-presentation';

/** Lineage-rich race detail with in-page jump links to each rules block. */
export default function RaceDetail({
    race,
    onOpenSubrace,
}: {
    race: Race;
    onOpenSubrace: (value: string) => void;
}) {
    const languageChoices = race.languageChoiceCount > 0
        ? `Choose ${race.languageChoiceCount} additional ${race.languageChoiceCount === 1 ? 'language' : 'languages'}.`
        : 'No additional language choices.';

    return (
        <>
            <CompendiumDetailHero
                mark={raceMark(race)}
                eyebrow={sourceLabel(race.sourceBook, race.isCustom)}
                title={race.name}
                summary={race.abilitySummary ?? 'No ability score increase'}
                facts={[
                    { label: 'Speed', value: race.speed == null ? 'Not listed' : `${race.speed} ft.` },
                    { label: 'Size', value: race.size ?? 'Not listed' },
                    { label: 'Characters', value: countLabel(race.characterUsageCount, 'character') },
                    { label: 'Subraces', value: countLabel(race.subraces.length, 'available subrace') },
                ]}
            />
            <CompendiumJumpLinks
                links={[
                    { id: 'traits', label: 'Traits', count: race.traits.length },
                    { id: 'languages', label: 'Languages', count: race.languages.length },
                    { id: 'life-and-build', label: 'Life & build' },
                    { id: 'subraces', label: 'Subraces', count: race.subraces.length },
                ]}
            />
            <CompendiumDetailSection title="Lineage ledger">
                <CompendiumFactGrid facts={[
                    { label: 'Ability scores', value: race.abilitySummary ?? 'No bonus listed' },
                    { label: 'Languages', value: raceLanguageSummary(race) },
                    { label: 'Racial traits', value: countLabel(race.traits.length, 'trait') },
                ]} />
            </CompendiumDetailSection>
            <CompendiumDetailSection sectionId="traits" title="Racial traits">
                <CompendiumTraitList traits={race.traits} />
            </CompendiumDetailSection>
            <CompendiumDetailSection sectionId="languages" title="Languages">
                <CompendiumFactGrid facts={[
                    { label: 'Always known', value: listOrFallback(race.languages.map((language) => language.name)) },
                    { label: 'Additional choices', value: languageChoices },
                ]} />
                {race.languageDescription ? <CompendiumBodyText>{race.languageDescription}</CompendiumBodyText> : null}
            </CompendiumDetailSection>
            <CompendiumDetailSection sectionId="life-and-build" title="Life & build">
                <CompendiumFactGrid facts={[
                    { label: 'Age', value: race.age ?? 'Not listed' },
                    { label: 'Size', value: race.sizeDescription ?? race.size ?? 'Not listed' },
                    { label: 'Alignment', value: race.alignment ?? 'Not listed' },
                ]} />
            </CompendiumDetailSection>
            <CompendiumDetailSection sectionId="subraces" title="Subraces">
                <CompendiumReferenceList
                    items={race.subraces}
                    emptyLabel="No subraces are listed."
                    onSelect={onOpenSubrace}
                />
            </CompendiumDetailSection>
        </>
    );
}
