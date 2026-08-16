import { render, screen } from '@testing-library/react-native';
import CompendiumLineageBranch from '@/components/compendium/detail/lineage-branch';

describe('CompendiumLineageBranch', () => {
    it('renders parent then subrace nodes with a plus connector', () => {
        render(
            <CompendiumLineageBranch
                accessibilityLabel="Lineage inheritance: Elf grants +2 Dexterity; High Elf adds +1 Intelligence"
                parent={{
                    glyph: '🧝',
                    label: 'Parent race',
                    name: 'Elf',
                    detail: '+2 Dexterity inherited',
                }}
                child={{
                    glyph: '+1',
                    label: 'Subrace bonus',
                    name: '+1 Intelligence',
                    detail: '1 trait added',
                    emphasiseGlyph: true,
                }}
            />,
        );

        expect(screen.getByTestId('compendium-lineage-branch').props.accessibilityLabel).toBe(
            'Lineage inheritance: Elf grants +2 Dexterity; High Elf adds +1 Intelligence',
        );
        expect(screen.getByText('Parent race')).toBeTruthy();
        expect(screen.getByText('Elf')).toBeTruthy();
        expect(screen.getByText('+2 Dexterity inherited')).toBeTruthy();
        expect(screen.getByText('plus')).toBeTruthy();
        expect(screen.getByText('Subrace bonus')).toBeTruthy();
        expect(screen.getByText('+1 Intelligence')).toBeTruthy();
        expect(screen.getByText('1 trait added')).toBeTruthy();
    });
});
