import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import type { InventoryItem } from '@/types/generated_graphql_types';
import InventoryCard from '../InventoryCard';

type RenderInventoryCardOptions = {
    inventory?: InventoryItem[];
    editMode?: boolean;
};

/**
 * Creates one inventory item fixture with sensible defaults for card tests.
 */
function buildInventoryItem(overrides: Partial<InventoryItem>): InventoryItem {
    return {
        __typename: 'InventoryItem',
        id: 'item-1',
        name: 'Spellbook',
        quantity: 1,
        weight: 3,
        description: 'Contains prepared notes',
        equipped: false,
        magical: false,
        ...overrides,
    };
}

/**
 * Renders InventoryCard with the shared Paper provider and overridable props.
 */
function renderInventoryCard({
    inventory = [],
    editMode = false,
}: RenderInventoryCardOptions = {}) {
    const onAddInventoryItem = jest.fn();
    const onChangeInventoryItem = jest.fn();
    const onRemoveInventoryItem = jest.fn();
    const onToggleInventoryEquip = jest.fn();

    render(
        <PaperProvider>
            <InventoryCard
                inventory={inventory}
                editMode={editMode}
                onAddInventoryItem={onAddInventoryItem}
                onChangeInventoryItem={onChangeInventoryItem}
                onRemoveInventoryItem={onRemoveInventoryItem}
                onToggleInventoryEquip={onToggleInventoryEquip}
            />
        </PaperProvider>
    );

    return {
        onAddInventoryItem,
        onToggleInventoryEquip,
    };
}

describe('InventoryCard', () => {
    it('shows the empty state when no inventory exists outside edit mode', () => {
        renderInventoryCard();

        expect(screen.getByText('No inventory items yet.')).toBeTruthy();
        expect(screen.queryByTestId('inventory-group-backpack')).toBeNull();
        expect(screen.queryByTestId('inventory-group-equipped')).toBeNull();
    });

    it('keeps the backpack section available in edit mode when inventory is empty', () => {
        const { onAddInventoryItem } = renderInventoryCard({ editMode: true });

        expect(screen.queryByText('No inventory items yet.')).toBeNull();
        expect(screen.getByTestId('inventory-group-backpack')).toBeTruthy();

        fireEvent.press(screen.getByLabelText('Add backpack'));

        expect(onAddInventoryItem).toHaveBeenCalledTimes(1);
    });

    it('renders only non-empty groups outside edit mode', () => {
        renderInventoryCard({
            inventory: [
                buildInventoryItem({ id: 'item-equipped', name: 'Staff of Power', equipped: true, magical: true }),
            ],
        });

        expect(screen.getByTestId('inventory-group-equipped')).toBeTruthy();
        expect(screen.queryByTestId('inventory-group-backpack')).toBeNull();
        expect(screen.getByText('Staff of Power')).toBeTruthy();
    });

    it('keeps the equip action wired to the item row', () => {
        const item = buildInventoryItem({ id: 'item-pack', name: 'Potion of Healing', quantity: 2 });
        const { onToggleInventoryEquip } = renderInventoryCard({ inventory: [item] });

        fireEvent.press(screen.getByText('Equip'));

        expect(onToggleInventoryEquip).toHaveBeenCalledWith('item-pack');
    });
});
