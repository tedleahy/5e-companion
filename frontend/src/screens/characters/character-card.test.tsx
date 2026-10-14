import { render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import type { CharacterSummary } from '@/api/characters';

import { CharacterCard } from './character-card';

const vesper: CharacterSummary = {
    id: '2',
    name: 'Vesper Quill',
    ancestry: { race_name: 'Gnome', subrace_name: 'Rock gnome' },
    classes: [
        { name: 'Wizard', level: 5, subclass_name: 'Divination' },
        { name: 'Rogue', level: 2, subclass_name: null },
    ],
    total_level: 7,
    hit_points: { current: 12, maximum: 26, temporary: 5 },
};

afterEach(() => {
    jest.restoreAllMocks();
});

describe.each(['ios', 'android'] as const)('CharacterCard accessibility on %s', (platform) => {
    beforeEach(() => {
        jest.replaceProperty(Platform, 'OS', platform);
    });

    it('includes the visible summary in the card label', async () => {
        await render(<CharacterCard character={vesper} />);

        expect(
            screen.getByRole('link', {
                name: 'Vesper Quill. Rock gnome wizard 5 / rogue 2, Divination. Level 7. 12/26 hit points, 5 temporary',
            }),
        ).toBeOnTheScreen();
    });

    it('announces missing ancestry, classes, level, and hit points', async () => {
        await render(
            <CharacterCard
                character={{
                    ...vesper,
                    ancestry: { race_name: null, subrace_name: null },
                    classes: [],
                    total_level: 0,
                    hit_points: { current: null, maximum: null, temporary: 0 },
                }}
            />,
        );

        expect(
            screen.getByRole('link', {
                name: 'Vesper Quill. Race and class not set. Level not set. Hit points not set',
            }),
        ).toBeOnTheScreen();
    });
});

it('keeps the short character name for the web link', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    await render(<CharacterCard character={vesper} />);

    expect(screen.getByRole('link', { name: 'Vesper Quill' })).toBeOnTheScreen();
});
