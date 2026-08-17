import { useLocalSearchParams } from 'expo-router';
import { fireEvent, screen } from '@testing-library/react-native';
import LanguageCompendium from '@/components/compendium/language-compendium';
import {
    renderBrowseScreen,
    returnToListAndHideSrd,
} from '@/components/compendium/__tests__/compendium-browse-test-utils';
import { GET_COMPENDIUM_LANGUAGES } from '@/graphql/language.operations';
import { waitFor } from '@/test-utils/waitFor';

type LanguageFixture = {
    value: string;
    name: string;
    type: string;
    script: string | null;
    typicalSpeakers: string[];
    sameScriptLanguages?: Array<{ value: string; name: string }>;
};

/** Builds a language browse fixture with the GraphQL fields the screen reads. */
function languageFixture({
    value,
    name,
    type,
    script,
    typicalSpeakers,
    sameScriptLanguages = [],
}: LanguageFixture) {
    return {
        __typename: 'CompendiumLanguage' as const,
        id: `language-${value}`,
        value,
        srdIndex: value,
        name,
        isCustom: false,
        sourceBook: 'SRD',
        type,
        script,
        typicalSpeakers,
        description: `${name} description.`,
        characterUsageCount: 0,
        grantingRaces: [],
        grantingBackgrounds: [],
        grantingTraits: [],
        sameScriptLanguages: sameScriptLanguages.map((peer) => ({
            __typename: 'CompendiumReference' as const,
            ...peer,
        })),
    };
}

const common = languageFixture({
    value: 'common',
    name: 'Common',
    type: 'Standard',
    script: 'Common',
    typicalSpeakers: ['Humans'],
    sameScriptLanguages: [{ value: 'halfling', name: 'Halfling' }],
});
const halfling = languageFixture({
    value: 'halfling',
    name: 'Halfling',
    type: 'Standard',
    script: 'Common',
    typicalSpeakers: ['Halflings'],
    sameScriptLanguages: [{ value: 'common', name: 'Common' }],
});
const draconic = languageFixture({
    value: 'draconic',
    name: 'Draconic',
    type: 'Exotic',
    script: 'Draconic',
    typicalSpeakers: ['Dragons'],
});

describe('LanguageCompendium', () => {
    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
    });

    it('browses, filters, opens, and empties languages', async () => {
        renderBrowseScreen(LanguageCompendium, GET_COMPENDIUM_LANGUAGES, {
            compendiumLanguages: [common],
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

    it('filters Standard and Exotic languages from the category chips', async () => {
        renderBrowseScreen(LanguageCompendium, GET_COMPENDIUM_LANGUAGES, {
            compendiumLanguages: [common, draconic],
        });

        await waitFor(() => expect(screen.getByTestId('compendium-row-common')).toBeTruthy());
        expect(screen.getByTestId('compendium-row-draconic')).toBeTruthy();

        fireEvent.press(screen.getByTestId('language-type-filter-standard'));
        expect(screen.getByTestId('compendium-row-common')).toBeTruthy();
        expect(screen.queryByTestId('compendium-row-draconic')).toBeNull();

        fireEvent.press(screen.getByTestId('language-type-filter-exotic'));
        expect(screen.queryByTestId('compendium-row-common')).toBeNull();
        expect(screen.getByTestId('compendium-row-draconic')).toBeTruthy();

        fireEvent.press(screen.getByTestId('language-type-filter-all'));
        expect(screen.getByTestId('compendium-row-common')).toBeTruthy();
        expect(screen.getByTestId('compendium-row-draconic')).toBeTruthy();
    });

    it('selects a same-script peer even when search would hide it, without clearing filters', async () => {
        renderBrowseScreen(LanguageCompendium, GET_COMPENDIUM_LANGUAGES, {
            compendiumLanguages: [common, halfling],
        });

        await waitFor(() => expect(screen.getByTestId('compendium-row-common')).toBeTruthy());
        fireEvent.press(screen.getByTestId('language-type-filter-standard'));
        fireEvent.changeText(screen.getByLabelText('Search languages'), 'Humans');
        expect(screen.queryByTestId('compendium-row-halfling')).toBeNull();

        fireEvent.press(screen.getByTestId('compendium-row-common'));
        fireEvent.press(screen.getByRole('button', { name: 'Halfling' }));

        expect(screen.getByText('Halflings')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Common' })).toBeTruthy();

        // Returning to the list must restore the search and type filter the peer
        // jump was made from, rather than silently resetting them.
        fireEvent.press(screen.getByTestId('compendium-detail-back'));
        expect(screen.getByLabelText('Search languages').props.value).toBe('Humans');
        expect(screen.getByTestId('language-type-filter-standard').props.accessibilityState.selected).toBe(true);
        expect(screen.queryByTestId('compendium-row-halfling')).toBeNull();
    });

    it('opens a matching language deep link on arrival', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ value: 'common' });
        renderBrowseScreen(LanguageCompendium, GET_COMPENDIUM_LANGUAGES, {
            compendiumLanguages: [common, draconic],
        });

        await waitFor(() => expect(screen.getByText('Typical speakers')).toBeTruthy());
        expect(screen.getByText('Humans')).toBeTruthy();
    });
});
