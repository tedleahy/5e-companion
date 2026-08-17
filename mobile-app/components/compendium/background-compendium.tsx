import BackgroundDetail from '@/components/compendium/background-detail';
import { proficienciesOfType, type Background } from '@/components/compendium/background-presentation';
import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    countLabel,
    entryInitials,
    listOrFallback,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import CompendiumRowMark from '@/components/compendium/compendium-row-mark';
import useCompendiumBrowse from '@/components/compendium/use-compendium-browse';
import { GET_COMPENDIUM_BACKGROUNDS } from '@/graphql/background.operations';
import type { CompendiumBackgroundsQuery } from '@/types/generated_graphql_types';

const selectBackgrounds = (data: CompendiumBackgroundsQuery | undefined) => data?.compendiumBackgrounds ?? [];

const backgroundSearchFields = (background: Background) => [
    background.name,
    sourceLabel(background.sourceBook, background.isCustom),
    background.proficiencies.map((proficiency) => proficiency.name),
    background.featureName,
    background.featureDescription,
];

function backgroundMeta(background: Background) {
    const skills = proficienciesOfType(background, 'SKILL');
    const tools = proficienciesOfType(background, 'TOOL');
    const languageText = background.languageChoiceCount > 0
        ? `${countLabel(background.languageChoiceCount, 'language')} of choice`
        : listOrFallback(background.languages.map((language) => language.name), 'No languages');

    return `${listOrFallback(skills, 'No skills')} · ${listOrFallback(tools, 'No tools')} · ${languageText} · ${background.featureDescription[0] ?? background.featureName ?? 'No feature listed'}`;
}

/** Browse-only background Compendium with grants, equipment, and roleplaying prompts. */
export default function BackgroundCompendium() {
    const browse = useCompendiumBrowse({
        document: GET_COMPENDIUM_BACKGROUNDS,
        noun: 'background',
        select: selectBackgrounds,
        searchFields: backgroundSearchFields,
    });

    return (
        <CompendiumCollection
            heading={{ title: 'Backgrounds', noun: 'background' }}
            filters={{ search: browse.search, includeSrd: browse.includeSrd }}
            collection={browse.collection}
            empty={{ title: 'No matching backgrounds', body: 'Clear the filters to browse every recorded origin.' }}
            row={{
                mark: (background) => <CompendiumRowMark>{entryInitials(background.name)}</CompendiumRowMark>,
                meta: backgroundMeta,
            }}
            renderDetail={(background) => <BackgroundDetail background={background} />}
        />
    );
}
