import { act, fireEvent, screen, within } from '@testing-library/react-native';

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

const alarra: CharacterSummary = {
    id: '3',
    name: 'Alarra Vane',
    ancestry: { race_name: 'Human', subrace_name: null },
    classes: [{ name: 'Cleric', level: 7, subclass_name: 'Life domain' }],
    total_level: 7,
    hit_points: { current: 38, maximum: 52, temporary: 0 },
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

/** Window widths that land in each layout: the mockup's phone, tablet and desktop frames. */
const WIDTHS = { phone: 390, tablet: 820, tabletLandscape: 1180, desktop: 1440 } as const;

/** The window width the screen sees. Each test starts at phone width. */
const mockWindow = { width: 390 };

// The test renderer's own window is 750 wide, which would put every test on the tablet layout.
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: () => ({ width: mockWindow.width, height: 900, scale: 2, fontScale: 1 }),
}));

/** Makes the window `width` points wide for the rest of the test. */
function setWindowWidth(width: number) {
    mockWindow.width = width;
}

/** Renders the screen and waits for the first response. */
async function renderScreen() {
    const view = await renderWithQuery(<Characters />);
    await advance(0);
    return view;
}

beforeEach(() => {
    setWindowWidth(WIDTHS.phone);
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

describe.each(['tablet', 'tabletLandscape', 'desktop'] as const)('Characters on %s', (layout) => {
    beforeEach(() => {
        setWindowWidth(WIDTHS[layout]);
    });

    it('puts Create character in the toolbar instead of a footer', async () => {
        await renderScreen();

        expect(
            within(screen.getByTestId('toolbar')).getByRole('button', {
                name: 'Create character',
            }),
        ).toBeOnTheScreen();

        expect(screen.getAllByRole('button', { name: 'Create character' })).toHaveLength(1);

        expect(screen.queryByTestId('create-footer')).toBeNull();
    });

    it('labels Resume by the kind of draft', async () => {
        await renderScreen();

        expect(screen.getByText('Resume level-up')).toBeOnTheScreen();

        expect(screen.getByText('Resume creation')).toBeOnTheScreen();
    });

    it('uses the longer draft copy', async () => {
        await renderScreen();

        expect(screen.getByText('Kethra Ironsong, level 3 to 4')).toBeOnTheScreen();

        expect(screen.getByText('Nyra Ashfall, new character')).toBeOnTheScreen();

        expect(screen.getByText(/Next up is an ability increase or a feat\./)).toBeOnTheScreen();

        expect(screen.getByText(/Next up is choosing a class\./)).toBeOnTheScreen();
    });

    it('still shows every character', async () => {
        await renderScreen();

        expect(screen.getByText('Thorn Grimsby')).toBeOnTheScreen();

        expect(screen.getByText('Vesper Quill')).toBeOnTheScreen();
    });

    it('flips the sort from the toolbar', async () => {
        await renderScreen();

        await fireEvent.press(screen.getByRole('button', { name: 'Sort: level' }));
        await advance(0);

        expect(lastRequest().searchParams.get('sort')).toBe('name');
    });
});

describe('Characters on a phone', () => {
    beforeEach(() => {
        setWindowWidth(WIDTHS.phone);
    });

    it('pins Create character in a footer', async () => {
        await renderScreen();

        expect(
            within(screen.getByTestId('create-footer')).getByRole('button', {
                name: 'Create character',
            }),
        ).toBeOnTheScreen();
    });

    it('labels every Resume button the same', async () => {
        await renderScreen();

        expect(screen.getAllByText('Resume')).toHaveLength(2);
    });

    it('uses the short draft copy, without the next step', async () => {
        await renderScreen();

        expect(screen.getByText('Kethra Ironsong')).toBeOnTheScreen();

        expect(screen.queryByText(/Next up/)).toBeNull();
    });
});

describe.each(['tablet', 'tabletLandscape'] as const)('Characters on %s', (layout) => {
    beforeEach(() => {
        setWindowWidth(WIDTHS[layout]);
    });

    it('makes each card a link named by its character', async () => {
        await renderScreen();

        expect(screen.getByRole('link', { name: 'Thorn Grimsby' })).toBeOnTheScreen();

        expect(screen.getByRole('link', { name: 'Vesper Quill' })).toBeOnTheScreen();
    });
});

describe('Characters on tabletLandscape', () => {
    beforeEach(() => {
        setWindowWidth(WIDTHS.tabletLandscape);
    });

    /** The accessible name of every link, in screen order. */
    function linkNames(): string[] {
        return screen.getAllByRole('link').map((link) => link.props.accessibilityLabel);
    }

    it('keeps an odd last card in one column, beside an empty one', async () => {
        body = { characters: [thorn, vesper, alarra], drafts: [] };
        await renderScreen();

        expect(linkNames()).toEqual(['Thorn Grimsby', 'Vesper Quill', 'Alarra Vane']);

        expect(screen.getAllByTestId('empty-column')).toHaveLength(1);
    });

    it('fills every row when the count is even', async () => {
        await renderScreen();

        expect(linkNames()).toEqual(['Thorn Grimsby', 'Vesper Quill']);

        expect(screen.queryByTestId('empty-column')).toBeNull();
    });
});

describe('Characters on desktop', () => {
    beforeEach(() => {
        setWindowWidth(WIDTHS.desktop);
    });

    it('gives each row an Open sheet link named for its character', async () => {
        await renderScreen();

        expect(screen.getByRole('link', { name: "Open Thorn Grimsby's sheet" })).toBeOnTheScreen();

        expect(screen.getByRole('link', { name: "Open Vesper Quill's sheet" })).toBeOnTheScreen();
    });

    it('leaves the rows themselves unpressable', async () => {
        await renderScreen();

        expect(screen.getAllByRole('link')).toHaveLength(2);

        expect(screen.queryByRole('link', { name: 'Thorn Grimsby' })).toBeNull();
    });
});
