import { fireEvent, screen } from '@testing-library/react-native';
import BackgroundCompendium from '@/components/compendium/background-compendium';
import {
    renderBrowseScreen,
    returnToListAndHideSrd,
} from '@/components/compendium/__tests__/compendium-browse-test-utils';
import { GET_COMPENDIUM_BACKGROUNDS } from '@/graphql/background.operations';
import { waitFor } from '@/test-utils/waitFor';

const background = {
    __typename: 'CompendiumBackground' as const,
    id: 'background-acolyte', value: 'acolyte', srdIndex: 'acolyte', name: 'Acolyte',
    isCustom: false, sourceBook: 'SRD', featureName: 'Shelter of the Faithful',
    featureDescription: ['You command the respect of those who share your faith.'],
    languageChoiceCount: 2, characterUsageCount: 1,
    proficiencies: [
        { __typename: 'CompendiumProficiency' as const, value: 'insight', name: 'Insight', type: 'SKILL', isCustom: false },
        { __typename: 'CompendiumProficiency' as const, value: 'religion', name: 'Religion', type: 'SKILL', isCustom: false },
    ],
    languages: [],
    // Matches `backgroundSeedPayload(acolyte)`: fixed grants plus one row per
    // choice group, named after the SRD equipment category.
    startingEquipment: [
        { __typename: 'CompendiumEquipment' as const, name: 'Clothes, common', quantity: 1, choiceGroup: null, choiceCount: null },
        { __typename: 'CompendiumEquipment' as const, name: 'Pouch', quantity: 1, choiceGroup: null, choiceCount: null },
        { __typename: 'CompendiumEquipment' as const, name: 'Holy Symbols', quantity: 1, choiceGroup: 1, choiceCount: 1 },
    ],
    suggestedCharacteristics: {
        __typename: 'CompendiumSuggestedCharacteristics' as const,
        personalityTraits: { __typename: 'CompendiumCharacteristicOptions' as const, choose: 2, options: ['I idolize a particular hero of my faith.'] },
        ideals: { __typename: 'CompendiumCharacteristicOptions' as const, choose: 1, options: ['Tradition guides me.'] },
        bonds: { __typename: 'CompendiumCharacteristicOptions' as const, choose: 1, options: ['I would die to recover an ancient relic.'] },
        flaws: { __typename: 'CompendiumCharacteristicOptions' as const, choose: 1, options: ['I judge others harshly.'] },
    },
};

describe('BackgroundCompendium', () => {
    it('browses, opens, and empties backgrounds', async () => {
        renderBrowseScreen(BackgroundCompendium, GET_COMPENDIUM_BACKGROUNDS, {
            compendiumBackgrounds: [background],
        });

        await waitFor(() => expect(screen.getByTestId('compendium-row-acolyte')).toBeTruthy());
        expect(screen.getByText(/Insight, Religion/)).toBeTruthy();
        fireEvent.press(screen.getByTestId('compendium-row-acolyte'));
        expect(screen.getByText('Starting equipment')).toBeTruthy();
        expect(screen.getByText('1× Clothes, common')).toBeTruthy();
        // A choice group carries exactly one "Choose" affordance.
        expect(screen.getByText('Choose:')).toBeTruthy();
        expect(screen.getByText('1× Holy Symbols')).toBeTruthy();
        expect(screen.queryByText(/Choose 1: /)).toBeNull();
        expect(screen.getByText('Background feature')).toBeTruthy();
        fireEvent.press(screen.getByTestId('background-characteristics'));
        expect(screen.getByText(/Tradition guides me\./)).toBeTruthy();

        await returnToListAndHideSrd();
        expect(screen.getByText('No matching backgrounds')).toBeTruthy();
    });

    it('omits the roleplaying prompts section when a background has none', async () => {
        renderBrowseScreen(BackgroundCompendium, GET_COMPENDIUM_BACKGROUNDS, {
            compendiumBackgrounds: [{ ...background, suggestedCharacteristics: null }],
        });

        await waitFor(() => expect(screen.getByTestId('compendium-row-acolyte')).toBeTruthy());
        fireEvent.press(screen.getByTestId('compendium-row-acolyte'));

        expect(screen.getByText('Background feature')).toBeTruthy();
        expect(screen.queryByText('Suggested characteristics')).toBeNull();
        expect(screen.queryByTestId('background-characteristics')).toBeNull();
    });
});
