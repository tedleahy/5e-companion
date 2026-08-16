import { useLocalSearchParams } from 'expo-router';
import { fireEvent, screen } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import RaceCompendium from '@/components/compendium/race-compendium';
import {
    renderBrowseScreen,
    returnToListAndHideSrd,
} from '@/components/compendium/__tests__/compendium-browse-test-utils';
import { GET_COMPENDIUM_RACES } from '@/graphql/race.operations';
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

describe('RaceCompendium', () => {
    beforeEach(() => {
        mockProtectedPush.mockClear();
        (useLocalSearchParams as jest.Mock).mockReturnValue({});
    });

    it('browses, opens, and empties races', async () => {
        renderBrowseScreen(RaceCompendium, GET_COMPENDIUM_RACES, { compendiumRaces: [race] });

        await waitFor(() => expect(screen.getByTestId('compendium-row-elf')).toBeTruthy());
        expect(screen.getByText(/Medium · 30 ft/)).toBeTruthy();
        fireEvent.press(screen.getByTestId('compendium-row-elf'));
        expect(screen.getByText('Lineage ledger')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Jump to Traits (1)' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Jump to Languages (2)' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Jump to Life & build' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Jump to Subraces (1)' })).toBeTruthy();
        expect(screen.getByText('High Elf')).toBeTruthy();
        fireEvent.press(screen.getByRole('button', { name: 'High Elf' }));
        expect(mockProtectedPush).toHaveBeenCalledWith({
            pathname: '/(rail)/compendium/subraces',
            params: { value: 'high-elf' },
        });

        await returnToListAndHideSrd();
        expect(screen.getByText('No lineages found')).toBeTruthy();
    });

    it('opens a matching race deep link on arrival', async () => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({ value: 'elf' });
        renderBrowseScreen(RaceCompendium, GET_COMPENDIUM_RACES, { compendiumRaces: [race] });

        await waitFor(() => expect(screen.getByText('Lineage ledger')).toBeTruthy());
        expect(screen.getByRole('button', { name: 'Jump to Traits (1)' })).toBeTruthy();
    });

    it('scrolls race detail to the chosen jump target', async () => {
        const scrollTo = jest.spyOn(ScrollView.prototype, 'scrollTo').mockImplementation(() => {});
        try {
            renderBrowseScreen(RaceCompendium, GET_COMPENDIUM_RACES, { compendiumRaces: [race] });

            await waitFor(() => expect(screen.getByTestId('compendium-row-elf')).toBeTruthy());
            fireEvent.press(screen.getByTestId('compendium-row-elf'));
            fireEvent(screen.getByTestId('compendium-detail-body'), 'layout', {
                nativeEvent: { layout: { x: 0, y: 72, width: 400, height: 900 } },
            });
            fireEvent(screen.getByTestId('compendium-section-traits'), 'layout', {
                nativeEvent: { layout: { x: 0, y: 240, width: 400, height: 180 } },
            });
            fireEvent.press(screen.getByRole('button', { name: 'Jump to Traits (1)' }));

            expect(scrollTo).toHaveBeenCalledWith({ y: 312, animated: true });
        } finally {
            scrollTo.mockRestore();
        }
    });
});
