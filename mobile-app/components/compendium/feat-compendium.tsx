import CompendiumCollection from '@/components/compendium/compendium-collection';
import {
    entryInitials,
    sourceLabel,
} from '@/components/compendium/compendium-browse-presentation';
import CompendiumRowMark from '@/components/compendium/compendium-row-mark';
import useCompendiumBrowse from '@/components/compendium/use-compendium-browse';
import FeatDetail from '@/components/compendium/feat-detail';
import { featDescriptionParts, type Feat } from '@/components/compendium/feat-presentation';
import { GET_COMPENDIUM_FEATS } from '@/graphql/feat.operations';
import type { CompendiumFeatsQuery } from '@/types/generated_graphql_types';

const selectFeats = (data: CompendiumFeatsQuery | undefined) => data?.compendiumFeats ?? [];

const featSearchFields = (feat: Feat) => [
    feat.name,
    feat.description,
    sourceLabel(feat.sourceBook, feat.isCustom),
    feat.prerequisiteSummary,
];

/** Browse-only feat Compendium backed by the typed aggregate query. */
export default function FeatCompendium() {
    const browse = useCompendiumBrowse({
        document: GET_COMPENDIUM_FEATS,
        noun: 'feat',
        select: selectFeats,
        searchFields: featSearchFields,
    });

    return (
        <CompendiumCollection
            heading={{ title: 'Feats', noun: 'feat' }}
            filters={{ search: browse.search, includeSrd: browse.includeSrd }}
            collection={browse.collection}
            empty={{ title: 'No matching feats', body: 'Clear the filters to reopen the feat ledger.' }}
            row={{
                mark: (feat) => <CompendiumRowMark>{entryInitials(feat.name)}</CompendiumRowMark>,
                meta: (feat) => `${feat.prerequisiteSummary ?? 'Open to all'} · ${featDescriptionParts(feat.description).lead || 'No description listed'}`,
            }}
            renderDetail={(feat) => <FeatDetail feat={feat} />}
        />
    );
}
