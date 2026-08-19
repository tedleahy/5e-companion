import { countLabel, sourceLabel } from '@/components/compendium/compendium-browse-presentation';
import CompendiumBodyText from '@/components/compendium/detail/body-text';
import CompendiumDetailHero from '@/components/compendium/detail/detail-hero';
import CompendiumDetailSection from '@/components/compendium/detail/detail-section';
import {
    classMark,
    orderedSubclassFeatures,
    subclassDescription,
    type Subclass,
} from '@/components/compendium/subclass-presentation';
import SubclassFeatureList from '@/components/compendium/subclass-feature-list';

type SubclassDetailProps = {
    subclass: Subclass;
};

/** Subclass detail: where it is picked, what it grants, and how it is used. */
export default function SubclassDetail({ subclass }: SubclassDetailProps) {
    const features = orderedSubclassFeatures(subclass.features);

    return (
        <>
            <CompendiumDetailHero
                mark={classMark(subclass.classId)}
                eyebrow={`${sourceLabel(subclass.sourceBook, subclass.isCustom)} · ${subclass.className}`}
                title={subclass.name}
                summary={subclassDescription(subclass) ?? 'No description is recorded.'}
                facts={[
                    { label: 'Chosen at', value: `Level ${subclass.selectionLevel}` },
                    { label: 'Features', value: countLabel(features.length, 'feature') },
                    { label: 'Characters', value: countLabel(subclass.characterUsageCount, 'character') },
                ]}
            />
            <CompendiumDetailSection title="Subclass features">
                {features.length === 0
                    ? <CompendiumBodyText>No subclass features are recorded.</CompendiumBodyText>
                    : <SubclassFeatureList features={features} />}
            </CompendiumDetailSection>
        </>
    );
}
