import { fireEvent, render, screen } from '@testing-library/react-native';

import type { CharacterSummary } from '@/api/characters';

import { CardScaleProvider } from './card-scale';
import { CharacterRow } from './character-row';

const vesper: CharacterSummary = {
    id: '2',
    name: 'Vesper Quill',
    ancestry: { race_name: 'Gnome', subrace_name: 'Rock gnome' },
    classes: [
        { name: 'Wizard', level: 5, subclass_name: 'Divination' },
        { name: 'Rogue', level: 2, subclass_name: null },
    ],
    total_level: 7,
    hit_points: { current: 12, maximum: 26, temporary: 0 },
};

/** Renders a row at desktop scale, as the desktop layout does. */
async function renderRow(onOpen?: () => void) {
    return render(
        <CardScaleProvider wide>
            <CharacterRow character={vesper} onOpen={onOpen} />
        </CardScaleProvider>,
    );
}

describe('CharacterRow', () => {
    it('shows the name as a heading, then the subtitle, level and hit points', async () => {
        await renderRow();

        expect(screen.getByRole('heading', { name: 'Vesper Quill' })).toBeOnTheScreen();

        expect(screen.getByText('Rock gnome wizard 5 / rogue 2, Divination')).toBeOnTheScreen();

        expect(screen.getByLabelText('Level 7')).toBeOnTheScreen();

        expect(screen.getByText('12/26 hit points')).toBeOnTheScreen();
    });

    it('uses the large level label', async () => {
        await renderRow();

        expect(screen.getByText('Level')).toHaveStyle({ fontSize: 13 });
    });

    it('opens the sheet from a link named for the character, not from the row', async () => {
        const onOpen = jest.fn();
        await renderRow(onOpen);

        expect(screen.getAllByRole('link')).toHaveLength(1);

        await fireEvent.press(screen.getByRole('link', { name: "Open Vesper Quill's sheet" }));

        expect(onOpen).toHaveBeenCalledTimes(1);
    });
});
