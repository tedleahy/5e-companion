import { useState } from 'react';
import { countLabel, listOrFallback, sourceLabel } from '@/components/compendium/compendium-browse-presentation';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import CompendiumDetailHero from '@/components/compendium/detail/detail-hero';
import CompendiumDetailSection from '@/components/compendium/detail/detail-section';
import CompendiumDisclosure from '@/components/compendium/detail/disclosure';
import CompendiumFactGrid from '@/components/compendium/detail/fact-grid';
import CompendiumLineageBranch from '@/components/compendium/detail/lineage-branch';
import CompendiumReferenceList from '@/components/compendium/detail/reference-list';
import CompendiumTraitList from '@/components/compendium/detail/trait-list';
import {
    lineageInheritanceLabel,
    parentMark,
    subraceBonusGlyph,
    type Subrace,
} from '@/components/compendium/subrace-presentation';

type SubraceDetailProps = {
    subrace: Subrace;
    onOpenParentRace: (value: string) => void;
};

/** Subrace detail with a parent → child inheritance diagram and inherited rules. */
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
                <CompendiumLineageBranch
                    accessibilityLabel={lineageInheritanceLabel(subrace)}
                    parent={{
                        glyph: parentMark(parent.name),
                        label: 'Parent race',
                        name: parent.name,
                        detail: parent.abilitySummary == null
                            ? 'No inherited bonus'
                            : `${parent.abilitySummary} inherited`,
                    }}
                    child={{
                        glyph: subraceBonusGlyph(subrace.abilityBonuses),
                        label: 'Subrace bonus',
                        name: subrace.abilitySummary ?? 'No additional bonus',
                        detail: `${countLabel(subrace.traits.length, 'trait')} added`,
                        emphasiseGlyph: true,
                    }}
                />
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
