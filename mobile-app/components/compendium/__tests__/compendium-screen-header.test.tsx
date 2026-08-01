import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import CompendiumScreenHeader from '@/components/compendium/compendium-screen-header';

describe('CompendiumScreenHeader', () => {
    it('renders eyebrow and title without a leading control on the hub', () => {
        render(<CompendiumScreenHeader eyebrow="Library" title="Compendium" />);

        expect(screen.getByText('Library')).toBeTruthy();
        expect(screen.getByText('Compendium')).toBeTruthy();
    });

    it('renders a leading control beside the category title', () => {
        render(
            <CompendiumScreenHeader
                eyebrow="Compendium"
                title="Classes"
                leading={<Text>Lead</Text>}
            />,
        );

        expect(screen.getByText('Lead')).toBeTruthy();
        expect(screen.getByText('Compendium')).toBeTruthy();
        expect(screen.getByText('Classes')).toBeTruthy();
    });
});
