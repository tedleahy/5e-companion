import { act, fireEvent, screen } from '@testing-library/react-native';

import type { CharacterList, CharacterSummary, Draft } from '@/api/characters';
import { SEARCH_DEBOUNCE_MS } from '@/hooks/use-character-list';
import { renderWithQuery } from '@/test-utils/render-with-query';

import { Characters } from '.';

const thorn: CharacterSummary = {
    id: '1',
    name: 'Thorn Grimsby',
    ancestry: { race_name: 'Dwarf', subrace_name: 'Mountain dwarf' },
    classes: [{ name: 'Fighter', level: 8, subclass_name: 'Champion' }],
    total_level: 8,
    hit_points: { current: 68, maximum: 72, temporary: 0 },
};

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

const levelUp: Draft = {
    id: '10',
    kind: 'level_up',
    character_id: '6',
    character_name: 'Kethra Ironsong',
    from_level: 3,
    to_level: 4,
    completed_choices: 3,
    total_choices: 5,
    next_step: 'ability_score_or_feat',
};

const creation: Draft = {
    id: '11',
    kind: 'creation',
    name: 'Nyra Ashfall',
    completed_choices: 2,
    total_choices: 5,
    next_step: 'choose_class',
};

/** The URL of every request the screen has sent, oldest first. */
let requests: URL[];
/** What the mocked API answers with. */
let body: CharacterList;

function lastRequest(): URL {
    return requests[requests.length - 1];
}

/** Moves the fake clock on, letting the query settle in between. */
async function advance(ms: number) {
    await act(async () => {
        await jest.advanceTimersByTimeAsync(ms);
    });
}

/** Renders the screen and waits for the first response. */
async function renderScreen() {
    const view = await renderWithQuery(<Characters />);
    await advance(0);
    return view;
}

beforeEach(() => {
    jest.useFakeTimers();
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
    process.env.EXPO_PUBLIC_API_TOKEN = 'test-token';
    requests = [];
    body = { characters: [thorn, vesper], drafts: [levelUp, creation] };

    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
        requests.push(new URL(String(input)));
        return { ok: true, status: 200, json: async () => body } as Response;
    });
});

afterEach(() => {
    jest.useRealTimers();
    delete process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_API_TOKEN;
});

describe('Characters', () => {
    it('shows the screen title as a heading', async () => {
        await renderScreen();

        expect(screen.getByRole('heading', { name: 'Characters' })).toBeOnTheScreen();
    });

    it('renders a card for each character with its name, subtitle and hit point line', async () => {
        await renderScreen();

        expect(screen.getByText('Thorn Grimsby')).toBeOnTheScreen();

        expect(screen.getByText('Mountain dwarf fighter, Champion')).toBeOnTheScreen();

        expect(screen.getByText('68/72 hit points')).toBeOnTheScreen();

        expect(screen.getByText('Vesper Quill')).toBeOnTheScreen();

        expect(screen.getByText('Rock gnome wizard 5 / rogue 2, Divination')).toBeOnTheScreen();

        expect(screen.getByText('12/26 hit points')).toBeOnTheScreen();
    });

    it('makes each card a link named by its character', async () => {
        await renderScreen();

        expect(screen.getByRole('link', { name: 'Thorn Grimsby' })).toBeOnTheScreen();

        expect(screen.getByRole('link', { name: 'Vesper Quill' })).toBeOnTheScreen();
    });

    it('shows both kinds of draft in the tray', async () => {
        await renderScreen();

        expect(screen.getByRole('heading', { name: 'Waiting to be finished' })).toBeOnTheScreen();

        expect(screen.getByText('Kethra Ironsong')).toBeOnTheScreen();

        expect(screen.getByText('Nyra Ashfall')).toBeOnTheScreen();

        expect(
            screen.getByRole('button', { name: "Resume Kethra Ironsong's level-up" }),
        ).toBeOnTheScreen();

        expect(
            screen.getByRole('button', { name: 'Resume creating Nyra Ashfall' }),
        ).toBeOnTheScreen();
    });

    it('names a Resume button for an unnamed creation draft', async () => {
        body = { characters: [], drafts: [{ ...creation, name: null }] };
        await renderScreen();

        expect(
            screen.getByRole('button', { name: 'Resume creating a new character' }),
        ).toBeOnTheScreen();
    });

    it('leaves the tray out when there are no drafts', async () => {
        body = { characters: [thorn], drafts: [] };
        await renderScreen();

        expect(screen.getByText('Thorn Grimsby')).toBeOnTheScreen();

        expect(screen.queryByRole('heading', { name: 'Waiting to be finished' })).toBeNull();
    });

    it('renders the plate and an empty list before the first response', async () => {
        globalThis.fetch = jest.fn(() => new Promise<Response>(() => {}));
        await renderScreen();

        expect(screen.getByRole('heading', { name: 'Characters' })).toBeOnTheScreen();

        expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('flips the sort label and asks for the other order when sort is tapped', async () => {
        await renderScreen();

        expect(lastRequest().searchParams.get('sort')).toBe('level');

        await fireEvent.press(screen.getByRole('button', { name: 'Sort: level' }));
        await advance(0);

        expect(screen.getByRole('button', { name: 'Sort: name' })).toBeOnTheScreen();

        expect(lastRequest().searchParams.get('sort')).toBe('name');
    });

    it('sends the search once typing pauses', async () => {
        await renderScreen();

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'thorn');
        await advance(SEARCH_DEBOUNCE_MS - 1);

        expect(lastRequest().searchParams.has('q')).toBe(false);

        await advance(1);

        expect(lastRequest().searchParams.get('q')).toBe('thorn');
    });

    it('offers Create character', async () => {
        await renderScreen();

        expect(screen.getByRole('button', { name: 'Create character' })).toBeOnTheScreen();
    });
});
