import { fireEvent, screen } from '@testing-library/react-native';
import LanguageCompendium from '@/components/compendium/language-compendium';
import {
    renderBrowseScreen,
    returnToListAndHideSrd,
} from '@/components/compendium/__tests__/compendium-browse-test-utils';
import { GET_COMPENDIUM_LANGUAGES } from '@/graphql/language.operations';
import { waitFor } from '@/test-utils/waitFor';

const language = {
    __typename: 'CompendiumLanguage' as const,
    id: 'language-common', value: 'common', srdIndex: 'common', name: 'Common', isCustom: false,
    sourceBook: 'SRD', type: 'STANDARD', script: 'Common', typicalSpeakers: ['Humans'],
    description: 'The shared trade tongue.', characterUsageCount: 2,
    grantingRaces: [{ __typename: 'CompendiumReference' as const, value: 'human', name: 'Human' }],
    grantingBackgrounds: [], grantingTraits: [],
    sameScriptLanguages: [{ __typename: 'CompendiumReference' as const, value: 'halfling', name: 'Halfling' }],
};

describe('LanguageCompendium', () => {
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
});
