import { fireEvent, render, screen } from '@testing-library/react-native';
import CompendiumBackButton from '@/components/compendium/compendium-back-button';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockCanGoBack = jest.fn();

jest.mock('@/hooks/useProtectedNavigation', () => ({
    __esModule: true,
    default: () => ({
        push: jest.fn(),
        replace: mockReplace,
        back: mockBack,
        canGoBack: mockCanGoBack,
    }),
}));

describe('CompendiumBackButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('invokes protected back when navigation history exists', () => {
        mockCanGoBack.mockReturnValue(true);
        render(<CompendiumBackButton />);

        fireEvent.press(screen.getByRole('button', { name: 'Back to all Compendium categories' }));

        expect(mockBack).toHaveBeenCalled();
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('replaces with the Compendium hub on direct entry with no history', () => {
        mockCanGoBack.mockReturnValue(false);
        render(<CompendiumBackButton />);

        fireEvent.press(screen.getByRole('button', { name: 'Back to all Compendium categories' }));

        expect(mockReplace).toHaveBeenCalledWith('/compendium');
        expect(mockBack).not.toHaveBeenCalled();
    });
});
