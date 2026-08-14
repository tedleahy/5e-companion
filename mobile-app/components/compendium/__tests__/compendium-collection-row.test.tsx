import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import CompendiumCollectionRow from '@/components/compendium/compendium-collection-row';

describe('CompendiumCollectionRow', () => {
    it('renders shared row chrome and selects by stable value', () => {
        const onSelect = jest.fn();
        render(
            <CompendiumCollectionRow
                value="high-elf"
                name="High Elf"
                isCustom={false}
                mark={<Text>HE</Text>}
                meta="Elf · +1 Intelligence"
                extra={<Text>Darkvision</Text>}
                onSelect={onSelect}
                testID="high-elf-row"
            />,
        );

        expect(screen.getByText('HE')).toBeTruthy();
        expect(screen.getByText('SRD')).toBeTruthy();
        expect(screen.getByText('Darkvision')).toBeTruthy();
        expect(screen.getByText('Elf · +1 Intelligence').props.numberOfLines).toBe(2);

        fireEvent.press(screen.getByTestId('high-elf-row'));
        expect(onSelect).toHaveBeenCalledWith('high-elf');
    });

    it('labels custom content distinctly for sighted and screen-reader users', () => {
        render(
            <CompendiumCollectionRow
                value="custom-feat"
                name="Dragon Friend"
                isCustom
                mark={<Text>DF</Text>}
                meta="A custom feat"
                onSelect={jest.fn()}
            />,
        );

        expect(screen.getByText('Custom')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Dragon Friend, Custom' })).toBeTruthy();
    });
});
