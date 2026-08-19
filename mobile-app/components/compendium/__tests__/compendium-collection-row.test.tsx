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

    it('renders declared actions with their own labels and destructive tint', () => {
        const onEdit = jest.fn();
        const onDelete = jest.fn();
        render(
            <CompendiumCollectionRow
                value="path-of-embers"
                name="Path of Embers"
                isCustom
                mark={<Text>PE</Text>}
                meta="Barbarian · level 3"
                actions={[
                    {
                        icon: 'create-outline',
                        accessibilityLabel: 'Edit Path of Embers',
                        onPress: onEdit,
                        testID: 'edit-path-of-embers',
                    },
                    {
                        icon: 'trash-outline',
                        accessibilityLabel: 'Delete Path of Embers',
                        onPress: onDelete,
                        destructive: true,
                        testID: 'delete-path-of-embers',
                    },
                ]}
                onSelect={jest.fn()}
            />,
        );

        fireEvent.press(screen.getByTestId('edit-path-of-embers'));
        expect(onEdit).toHaveBeenCalledTimes(1);

        const remove = screen.getByTestId('delete-path-of-embers');
        fireEvent.press(remove);
        expect(onDelete).toHaveBeenCalledTimes(1);
        expect(remove.props.accessibilityLabel).toBe('Delete Path of Embers');
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
