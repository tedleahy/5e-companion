import { fireEvent, render, screen } from '@testing-library/react-native';
import CompendiumBackButton from '@/components/compendium/compendium-back-button';

const mockReplace = jest.fn();

jest.mock('@/hooks/useProtectedNavigation', () => ({
    __esModule: true,
    default: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
}));

describe('CompendiumBackButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('replaces the category route with the Compendium hub', () => {
        render(<CompendiumBackButton />);

        fireEvent.press(screen.getByRole('button', { name: 'Back to all Compendium categories' }));

        expect(mockReplace).toHaveBeenCalledWith('/compendium');
    });
});
