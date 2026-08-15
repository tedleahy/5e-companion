import { fireEvent, screen } from '@testing-library/react-native';
import SubraceCompendium from '@/components/compendium/subrace-compendium';
import {
    renderBrowseScreen,
    returnToListAndHideSrd,
} from '@/components/compendium/__tests__/compendium-browse-test-utils';
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

describe('SubraceCompendium', () => {
    beforeEach(() => {
        mockProtectedPush.mockClear();
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
});
