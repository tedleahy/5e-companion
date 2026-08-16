import { fireEvent, render, screen } from '@testing-library/react-native';
import { CompendiumDetailScrollContext } from '@/components/compendium/compendium-detail-scroll';
import CompendiumJumpLinks from '@/components/compendium/detail/jump-links';

describe('CompendiumJumpLinks', () => {
    it('asks the detail scroll to jump to the chosen section', () => {
        const scrollToSection = jest.fn();
        render(
            <CompendiumDetailScrollContext.Provider
                value={{
                    registerContentOffset: jest.fn(),
                    registerSection: jest.fn(),
                    scrollToSection,
                }}
            >
                <CompendiumJumpLinks links={[
                    { id: 'traits', label: 'Traits', count: 4 },
                    { id: 'life-and-build', label: 'Life & build' },
                ]} />
            </CompendiumDetailScrollContext.Provider>,
        );

        fireEvent.press(screen.getByRole('button', { name: 'Jump to Traits (4)' }));
        fireEvent.press(screen.getByRole('button', { name: 'Jump to Life & build' }));

        expect(scrollToSection).toHaveBeenCalledWith('traits');
        expect(scrollToSection).toHaveBeenCalledWith('life-and-build');
    });
});
