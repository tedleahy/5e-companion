import type { ComponentType } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MockedProvider } from '@apollo/client/testing/react';
import type { DocumentNode } from 'graphql';
import { PaperProvider } from 'react-native-paper';
import BackgroundCompendium from '@/components/compendium/background-compendium';
import FeatCompendium from '@/components/compendium/feat-compendium';
import LanguageCompendium from '@/components/compendium/language-compendium';
import RaceCompendium from '@/components/compendium/race-compendium';
import SubraceCompendium from '@/components/compendium/subrace-compendium';
import { GET_COMPENDIUM_BACKGROUNDS } from '@/graphql/background.operations';
import { GET_COMPENDIUM_FEATS } from '@/graphql/feat.operations';
import { GET_COMPENDIUM_LANGUAGES } from '@/graphql/language.operations';
import { GET_COMPENDIUM_RACES } from '@/graphql/race.operations';
import { GET_COMPENDIUM_SUBRACES } from '@/graphql/subrace.operations';
import { waitFor } from '@/test-utils/waitFor';

const mockProtectedPush = jest.fn();

jest.mock('@/hooks/useProtectedNavigation', () => ({
    __esModule: true,
    default: () => ({
        push: mockProtectedPush,
        replace: jest.fn(),
        back: jest.fn(),
        canGoBack: jest.fn(() => false),
    }),
}));

function renderBrowseScreen(
    Component: ComponentType,
    query: DocumentNode,
    data: Record<string, unknown>,
) {
    return render(
        <MockedProvider
            mocks={[{ request: { query }, result: { data } }]}
            mockLinkDefaultOptions={{ delay: 0 }}
            showWarnings={false}
        >
            <PaperProvider><Component /></PaperProvider>
        </MockedProvider>,
    );
}

async function returnToListAndHideSrd() {
    fireEvent.press(screen.getByTestId('compendium-detail-back'));
    await waitFor(() => expect(screen.getByTestId('compendium-collection-list')).toBeTruthy());
    fireEvent(screen.getByRole('switch'), 'valueChange', false);
}

const language = {
    __typename: 'CompendiumLanguage' as const,
    id: 'language-common', value: 'common', srdIndex: 'common', name: 'Common', isCustom: false,
    sourceBook: 'SRD', type: 'STANDARD', script: 'Common', typicalSpeakers: ['Humans'],
    description: 'The shared trade tongue.', characterUsageCount: 2,
    grantingRaces: [{ __typename: 'CompendiumReference' as const, value: 'human', name: 'Human' }],
    grantingBackgrounds: [], grantingTraits: [],
    sameScriptLanguages: [{ __typename: 'CompendiumReference' as const, value: 'halfling', name: 'Halfling' }],
};

const feat = {
    __typename: 'CompendiumFeat' as const,
    id: 'feat-grappler', value: 'grappler', srdIndex: 'grappler', name: 'Grappler', isCustom: false,
    sourceBook: 'SRD', prerequisiteSummary: 'Strength 13 or higher', characterUsageCount: 1,
    prerequisites: [{ __typename: 'CompendiumFeatPrerequisite' as const, abilityIndex: 'str', abilityName: 'Strength', minimumScore: 13 }],
    description: ['You develop the skills necessary to hold your own in close-quarters grappling.', '- You have advantage on attack rolls against a creature you are grappling.'],
};

const race = {
    __typename: 'CompendiumRace' as const,
    id: 'race-elf', value: 'elf', srdIndex: 'elf', name: 'Elf', isCustom: false, sourceBook: 'SRD',
    speed: 30, size: 'Medium', sizeDescription: 'Elves range from under 5 to over 6 feet tall.',
    age: 'Elves mature at much the same rate as humans.', alignment: 'Elves love freedom.',
    languageDescription: 'You can speak, read, and write Common and Elvish.', languageChoiceCount: 0,
    abilitySummary: '+2 Dexterity', characterUsageCount: 1,
    abilityBonuses: [{ __typename: 'CompendiumAbilityBonus' as const, abilityIndex: 'dex', abilityName: 'Dexterity', bonus: 2 }],
    traits: [{ __typename: 'CompendiumTrait' as const, value: 'darkvision', name: 'Darkvision', description: ['You can see in dim light.'], languageChoiceCount: null }],
    languages: [
        { __typename: 'CompendiumReference' as const, value: 'common', name: 'Common' },
        { __typename: 'CompendiumReference' as const, value: 'elvish', name: 'Elvish' },
    ],
    subraces: [{
        __typename: 'CompendiumSubraceSummary' as const,
        value: 'high-elf', name: 'High Elf', abilitySummary: '+1 Intelligence', traitCount: 1,
        abilityBonuses: [{ __typename: 'CompendiumAbilityBonus' as const, abilityIndex: 'int', abilityName: 'Intelligence', bonus: 1 }],
    }],
};

const subrace = {
    __typename: 'CompendiumSubrace' as const,
    id: 'subrace-high-elf', value: 'high-elf', srdIndex: 'high-elf', name: 'High Elf',
    description: 'High elves have a keen mind.', isCustom: false, sourceBook: 'SRD',
    abilitySummary: '+1 Intelligence', characterUsageCount: 1,
    parentRace: {
        __typename: 'CompendiumParentRace' as const,
        value: 'elf', name: 'Elf', speed: 30, size: 'Medium',
        languageDescription: 'You know Common and Elvish.', languageChoiceCount: 0,
        abilitySummary: '+2 Dexterity',
        abilityBonuses: [{ __typename: 'CompendiumAbilityBonus' as const, abilityIndex: 'dex', abilityName: 'Dexterity', bonus: 2 }],
        traits: [{ __typename: 'CompendiumTrait' as const, value: 'darkvision', name: 'Darkvision', description: ['You can see in dim light.'], languageChoiceCount: null }],
        languages: [{ __typename: 'CompendiumReference' as const, value: 'elvish', name: 'Elvish' }],
    },
    abilityBonuses: [{ __typename: 'CompendiumAbilityBonus' as const, abilityIndex: 'int', abilityName: 'Intelligence', bonus: 1 }],
    traits: [{ __typename: 'CompendiumTrait' as const, value: 'cantrip', name: 'Cantrip', description: ['You know one wizard cantrip.'], languageChoiceCount: null }],
};

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
    startingEquipment: [
        { __typename: 'CompendiumEquipment' as const, name: 'Holy symbol', quantity: 1, choiceGroup: null, choiceCount: null },
        { __typename: 'CompendiumEquipment' as const, name: 'Prayer book', quantity: 1, choiceGroup: 1, choiceCount: 1 },
        { __typename: 'CompendiumEquipment' as const, name: 'Prayer wheel', quantity: 1, choiceGroup: 1, choiceCount: 1 },
    ],
    suggestedCharacteristics: {
        __typename: 'CompendiumSuggestedCharacteristics' as const,
        personalityTraits: { __typename: 'CompendiumCharacteristicOptions' as const, choose: 2, options: ['I idolize a particular hero of my faith.'] },
        ideals: { __typename: 'CompendiumCharacteristicOptions' as const, choose: 1, options: ['Tradition guides me.'] },
        bonds: { __typename: 'CompendiumCharacteristicOptions' as const, choose: 1, options: ['I would die to recover an ancient relic.'] },
        flaws: { __typename: 'CompendiumCharacteristicOptions' as const, choose: 1, options: ['I judge others harshly.'] },
    },
};

describe('browse-only Compendium screens', () => {
    beforeEach(() => {
        mockProtectedPush.mockClear();
    });

    it('browses, filters, opens, and empties languages', async () => {
        renderBrowseScreen(LanguageCompendium, GET_COMPENDIUM_LANGUAGES, {
            compendiumLanguages: [language],
        });

        await waitFor(() => expect(screen.getByTestId('compendium-row-common')).toBeTruthy());
        expect(screen.getByTestId('language-type-filter-all')).toBeTruthy();
        fireEvent.press(screen.getByTestId('language-script-filter'));
        await waitFor(() => expect(screen.getByTestId('language-script-filter-Common')).toBeTruthy());
        fireEvent.press(screen.getByTestId('language-script-filter-Common'));
        fireEvent.press(screen.getByTestId('compendium-row-common'));
        expect(screen.getByText('Typical speakers')).toBeTruthy();
        expect(screen.getByText('Learning this language')).toBeTruthy();

        await returnToListAndHideSrd();
        expect(screen.getByText('No matching languages')).toBeTruthy();
    });

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

    it('browses, opens, and empties races', async () => {
        renderBrowseScreen(RaceCompendium, GET_COMPENDIUM_RACES, { compendiumRaces: [race] });

        await waitFor(() => expect(screen.getByTestId('compendium-row-elf')).toBeTruthy());
        expect(screen.getByText(/Medium · 30 ft/)).toBeTruthy();
        fireEvent.press(screen.getByTestId('compendium-row-elf'));
        expect(screen.getByText('Lineage ledger')).toBeTruthy();
        expect(screen.getAllByText('Life & build')).toHaveLength(2);
        expect(screen.getByText('High Elf')).toBeTruthy();
        fireEvent.press(screen.getByRole('button', { name: 'High Elf' }));
        expect(mockProtectedPush).toHaveBeenCalledWith({
            pathname: '/(rail)/compendium/subraces',
            params: { value: 'high-elf' },
        });

        await returnToListAndHideSrd();
        expect(screen.getByText('No lineages found')).toBeTruthy();
    });

    it('browses, filters, opens, and empties subraces', async () => {
        renderBrowseScreen(SubraceCompendium, GET_COMPENDIUM_SUBRACES, {
            compendiumSubraces: [subrace],
        });

        await waitFor(() => expect(screen.getByTestId('compendium-row-high-elf')).toBeTruthy());
        expect(screen.getByTestId('subrace-parent-filter-elf')).toBeTruthy();
        fireEvent.press(screen.getByTestId('subrace-parent-filter-elf'));
        fireEvent.press(screen.getByTestId('compendium-row-high-elf'));
        expect(screen.getByText('Lineage inheritance')).toBeTruthy();
        expect(screen.getByText('Parent race rules')).toBeTruthy();
        fireEvent.press(screen.getByRole('button', { name: 'Elf' }));
        expect(mockProtectedPush).toHaveBeenCalledWith({
            pathname: '/(rail)/compendium/races',
            params: { value: 'elf' },
        });
        fireEvent.press(screen.getByTestId('subrace-parent-rules'));
        expect(screen.getByText('You know Common and Elvish.')).toBeTruthy();

        await returnToListAndHideSrd();
        expect(screen.getByText('No matching lineages')).toBeTruthy();
    });

    it('browses, opens, and empties backgrounds', async () => {
        renderBrowseScreen(BackgroundCompendium, GET_COMPENDIUM_BACKGROUNDS, {
            compendiumBackgrounds: [background],
        });

        await waitFor(() => expect(screen.getByTestId('compendium-row-acolyte')).toBeTruthy());
        expect(screen.getByText(/Insight, Religion/)).toBeTruthy();
        fireEvent.press(screen.getByTestId('compendium-row-acolyte'));
        expect(screen.getByText('Starting equipment')).toBeTruthy();
        expect(screen.getByText('Background feature')).toBeTruthy();
        fireEvent.press(screen.getByTestId('background-characteristics'));
        expect(screen.getByText(/Tradition guides me\./)).toBeTruthy();

        await returnToListAndHideSrd();
        expect(screen.getByText('No matching backgrounds')).toBeTruthy();
    });
});
