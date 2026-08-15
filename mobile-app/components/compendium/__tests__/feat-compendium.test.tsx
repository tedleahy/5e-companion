import { fireEvent, screen } from '@testing-library/react-native';
import FeatCompendium from '@/components/compendium/feat-compendium';
import {
    renderBrowseScreen,
    returnToListAndHideSrd,
} from '@/components/compendium/__tests__/compendium-browse-test-utils';
import { GET_COMPENDIUM_FEATS } from '@/graphql/feat.operations';
import { waitFor } from '@/test-utils/waitFor';

const feat = {
    __typename: 'CompendiumFeat' as const,
    id: 'feat-grappler', value: 'grappler', srdIndex: 'grappler', name: 'Grappler', isCustom: false,
    sourceBook: 'SRD', prerequisiteSummary: 'Strength 13 or higher', characterUsageCount: 1,
    prerequisites: [{ __typename: 'CompendiumFeatPrerequisite' as const, abilityIndex: 'str', abilityName: 'Strength', minimumScore: 13 }],
    description: ['You develop the skills necessary to hold your own in close-quarters grappling.', '- You have advantage on attack rolls against a creature you are grappling.'],
};

describe('FeatCompendium', () => {
    it('browses, opens, and empties feats', async () => {
        renderBrowseScreen(FeatCompendium, GET_COMPENDIUM_FEATS, { compendiumFeats: [feat] });

        await waitFor(() => expect(screen.getByTestId('compendium-row-grappler')).toBeTruthy());
        expect(screen.getByText(/Strength 13 or higher/)).toBeTruthy();
        fireEvent.press(screen.getByTestId('compendium-row-grappler'));
        expect(screen.getByText('What it grants')).toBeTruthy();
        expect(screen.getByText('At a glance')).toBeTruthy();

        await returnToListAndHideSrd();
        expect(screen.getByText('No matching feats')).toBeTruthy();
    });
});
