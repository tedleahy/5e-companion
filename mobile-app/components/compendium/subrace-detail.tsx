import { useState } from 'react';
import { countLabel, listOrFallback, sourceLabel } from '@/components/compendium/compendium-browse-presentation';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import CompendiumDetailHero from '@/components/compendium/detail/detail-hero';
import CompendiumDetailSection from '@/components/compendium/detail/detail-section';
import CompendiumDisclosure from '@/components/compendium/detail/disclosure';
import CompendiumFactGrid from '@/components/compendium/detail/fact-grid';
import CompendiumReferenceList from '@/components/compendium/detail/reference-list';
import CompendiumTraitList from '@/components/compendium/detail/trait-list';
import { parentMark, type Subrace } from '@/components/compendium/subrace-presentation';

type SubraceDetailProps = {
    subrace: Subrace;
    onOpenParentRace: (value: string) => void;
};

export default function SubraceDetail({ subrace, onOpenParentRace }: SubraceDetailProps) {
    const [parentExpanded, setParentExpanded] = useState(false);
    const parent = subrace.parentRace;

    return (
        <>
            <CompendiumDetailHero
                mark={parentMark(parent.name)}
                eyebrow={`${sourceLabel(subrace.sourceBook, subrace.isCustom)} · ${parent.name} lineage`}
                title={subrace.name}
                summary={subrace.description ?? 'No description is recorded.'}
                facts={[{ label: 'Characters', value: countLabel(subrace.characterUsageCount, 'character') }]}
            />
            <CompendiumDetailSection title="Lineage inheritance">
                <CompendiumFactGrid facts={[
                    { label: `${parent.name} grants`, value: parent.abilitySummary || 'No bonus listed' },
                    { label: `${subrace.name} adds`, value: subrace.abilitySummary || 'No additional bonus' },
                    { label: 'Added traits', value: countLabel(subrace.traits.length, 'trait') },
                ]} />
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Subrace traits">
                <CompendiumTraitList traits={subrace.traits} emptyLabel="No additional traits are listed." />
            </CompendiumDetailSection>
            <CompendiumDetailSection title="Parent race rules">
                <CompendiumReferenceList
                    items={[{ value: parent.value, name: parent.name }]}
                    onSelect={onOpenParentRace}
                />
                <CompendiumDisclosure
                    title={`Inherited from ${parent.name}`}
                    summary={`${parent.speed ?? '—'} ft. · ${parent.size ?? 'Unknown size'} · ${countLabel(parent.traits.length, 'trait')}`}
                    expanded={parentExpanded}
                    onToggle={() => setParentExpanded((current) => !current)}
                    testID="subrace-parent-rules"
                >
                    <CompendiumFactGrid facts={[
                        { label: 'Speed', value: parent.speed == null ? 'Not listed' : `${parent.speed} ft.` },
                        { label: 'Size', value: parent.size ?? 'Not listed' },
                        { label: 'Languages', value: listOrFallback(parent.languages.map((language) => language.name)) },
                    ]} />
                    {parent.languageDescription ? (
                        <CompendiumBodyText>{parent.languageDescription}</CompendiumBodyText>
                    ) : null}
                    <CompendiumTraitList traits={parent.traits} emptyLabel="No inherited traits are listed." />
                </CompendiumDisclosure>
            </CompendiumDetailSection>
        </>
    );
}
