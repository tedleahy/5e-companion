import { onlineManager } from '@tanstack/react-query';
import { act, fireEvent, screen, within } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

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
/** The error status the mocked API answers with, or null to answer with `body`. */
let errorStatus: number | null;

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
    errorStatus = null;

    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
        requests.push(new URL(String(input)));
        if (errorStatus !== null) {
            return {
                ok: false,
                status: errorStatus,
                text: async () => JSON.stringify({ error: { code: 'error', message: 'Failed' } }),
            } as Response;
        }
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

        expect(screen.getByRole('link', { name: /^Thorn Grimsby\./ })).toBeOnTheScreen();

        expect(screen.getByRole('link', { name: /^Vesper Quill\./ })).toBeOnTheScreen();
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

    it.each([
        {
            label: '99 ASCII characters',
            typed: 'a'.repeat(99),
            field: 'a'.repeat(99),
            query: 'a'.repeat(99),
        },
        {
            label: '100 ASCII characters',
            typed: 'a'.repeat(100),
            field: 'a'.repeat(100),
            query: 'a'.repeat(100),
        },
        {
            label: '101 ASCII characters',
            typed: 'a'.repeat(101),
            field: 'a'.repeat(100),
            query: 'a'.repeat(100),
        },
        {
            label: '100 emoji',
            typed: '🐈'.repeat(100),
            field: '🐈'.repeat(100),
            query: '🐈'.repeat(100),
        },
        {
            label: '101 emoji',
            typed: '🐈'.repeat(101),
            field: '🐈'.repeat(100),
            query: '🐈'.repeat(100),
        },
        {
            label: 'surrounding spaces',
            typed: `  ${'a'.repeat(100)}  `,
            field: `  ${'a'.repeat(100)}  `,
            query: 'a'.repeat(100),
        },
        { label: 'only spaces', typed: ' '.repeat(101), field: ' '.repeat(101), query: null },
    ])(
        'keeps $label within the API search limit after trimming',
        async ({ typed, field, query }) => {
            await renderScreen();

            await fireEvent.changeText(screen.getByLabelText('Find a character'), typed);
            await advance(SEARCH_DEBOUNCE_MS);
            await advance(0);

            expect(screen.getByLabelText('Find a character')).toHaveDisplayValue(field);

            expect(lastRequest().searchParams.get('q')).toBe(query);
        },
    );

    it('allows a new shorter search after limiting a long paste', async () => {
        await renderScreen();

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'a'.repeat(101));
        await advance(SEARCH_DEBOUNCE_MS);
        await advance(0);
        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'thorn');
        await advance(SEARCH_DEBOUNCE_MS);
        await advance(0);

        expect(lastRequest().searchParams.get('q')).toBe('thorn');

        expect(screen.getByLabelText('Find a character')).toHaveDisplayValue('thorn');
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

        expect(screen.getByRole('link', { name: /^Thorn Grimsby\./ })).toBeOnTheScreen();

        expect(screen.getByRole('link', { name: /^Vesper Quill\./ })).toBeOnTheScreen();
    });
});

describe('Characters on tabletLandscape', () => {
    beforeEach(() => {
        setWindowWidth(WIDTHS.tabletLandscape);
    });

    /** The character name at the start of each native link's summary, in screen order. */
    function linkNames(): string[] {
        return screen
            .getAllByRole('link')
            .map((link) => link.props.accessibilityLabel.split('. ')[0]);
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

/** Makes every request from now on hang until the test ends, as a slow API would. */
function hangRequests() {
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
        requests.push(new URL(String(input)));
        return new Promise<Response>(() => {});
    });
}

describe('Characters while loading', () => {
    it('shows a status line in place of the list on first load, with the controls in place', async () => {
        hangRequests();
        await renderScreen();

        expect(screen.getByText('Loading characters…')).toBeOnTheScreen();

        expect(screen.getByLabelText('Find a character')).toBeOnTheScreen();

        expect(screen.getByRole('button', { name: 'Create character' })).toBeOnTheScreen();

        expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('keeps the list and turns a spinner in the search field while a search loads', async () => {
        await renderScreen();
        hangRequests();

        expect(screen.queryByText('Searching…')).toBeNull();

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'ves');
        await advance(SEARCH_DEBOUNCE_MS);

        expect(screen.getByText('Searching…')).toBeOnTheScreen();

        expect(screen.getByText('Thorn Grimsby')).toBeOnTheScreen();

        expect(screen.queryByText('Loading characters…')).toBeNull();
    });
});

describe('Characters with nothing to show', () => {
    it('says there are no characters yet, and hides search and sort', async () => {
        body = { characters: [], drafts: [] };
        await renderScreen();

        expect(screen.getByRole('heading', { name: 'No characters yet' })).toBeOnTheScreen();

        expect(screen.queryByLabelText('Find a character')).toBeNull();

        expect(screen.queryByRole('button', { name: 'Sort: level' })).toBeNull();

        expect(screen.getByRole('button', { name: 'Create character' })).toBeOnTheScreen();
    });

    it('keeps the search field when an empty first response arrives after typing starts', async () => {
        const responses: (() => void)[] = [];
        globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
            requests.push(new URL(String(input)));
            return new Promise<Response>((resolve) => {
                responses.push(() =>
                    resolve({
                        ok: true,
                        status: 200,
                        json: async () => ({ characters: [], drafts: [] }),
                    } as Response),
                );
            });
        });
        await renderScreen();

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'Zephyr');
        responses[0]();
        await advance(0);

        expect(screen.getByLabelText('Find a character')).toBeOnTheScreen();

        await advance(SEARCH_DEBOUNCE_MS);

        expect(lastRequest().searchParams.get('q')).toBe('Zephyr');

        expect(screen.getByText('Searching…')).toBeOnTheScreen();
    });

    it('shows the tray alone when there are only drafts', async () => {
        body = { characters: [], drafts: [creation] };
        await renderScreen();

        expect(screen.getByRole('heading', { name: 'Waiting to be finished' })).toBeOnTheScreen();

        expect(screen.getByText('Nyra Ashfall')).toBeOnTheScreen();

        expect(screen.queryByRole('heading', { name: 'No characters yet' })).toBeNull();

        expect(screen.queryByLabelText('Find a character')).toBeNull();
    });

    it('quotes a search that matched nothing, and keeps the tray', async () => {
        await renderScreen();
        body = { characters: [], drafts: [creation] };

        await fireEvent.changeText(screen.getByLabelText('Find a character'), ' Zephyr ');
        await advance(SEARCH_DEBOUNCE_MS);
        await advance(0);

        expect(
            screen.getByRole('heading', { name: 'No characters match "Zephyr"' }),
        ).toBeOnTheScreen();

        expect(screen.getByText(/Search only looks at names\./)).toBeOnTheScreen();

        expect(screen.getByText('Nyra Ashfall')).toBeOnTheScreen();

        expect(screen.getByLabelText('Find a character')).toBeOnTheScreen();
    });

    it('goes by the search the results came from while a cleared search waits to send', async () => {
        await renderScreen();
        body = { characters: [], drafts: [] };
        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'Zephyr');
        await advance(SEARCH_DEBOUNCE_MS);
        await advance(0);

        await fireEvent.changeText(screen.getByLabelText('Find a character'), '');
        await advance(SEARCH_DEBOUNCE_MS - 1);

        expect(
            screen.getByRole('heading', { name: 'No characters match "Zephyr"' }),
        ).toBeOnTheScreen();

        expect(screen.queryByRole('heading', { name: 'No characters yet' })).toBeNull();

        expect(screen.getByLabelText('Find a character')).toBeOnTheScreen();
    });
});

describe('Characters when the list fails to load', () => {
    it('shows a development notice on a 401, without the controls or Try again', async () => {
        errorStatus = 401;
        await renderScreen();

        expect(screen.getByRole('heading', { name: 'Not signed in' })).toBeOnTheScreen();

        expect(screen.getByText('Development only')).toBeOnTheScreen();

        expect(screen.queryByLabelText('Find a character')).toBeNull();

        expect(screen.queryByRole('button', { name: 'Create character' })).toBeNull();

        expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    });

    it.each(['EXPO_PUBLIC_API_URL', 'EXPO_PUBLIC_API_TOKEN'])(
        'names %s when it is missing, without the controls or Try again',
        async (variable) => {
            delete process.env[variable];
            await renderScreen();

            expect(screen.getByRole('heading', { name: 'API settings missing' })).toBeOnTheScreen();

            expect(screen.getByText(variable)).toBeOnTheScreen();

            expect(screen.getByText('Development only')).toBeOnTheScreen();

            expect(screen.queryByLabelText('Find a character')).toBeNull();

            expect(screen.queryByRole('button', { name: 'Create character' })).toBeNull();

            expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
        },
    );

    it('offers Try again on any other error, keeping the controls', async () => {
        errorStatus = 500;
        await renderScreen();

        expect(
            screen.getByRole('heading', { name: "Couldn't load your characters" }),
        ).toBeOnTheScreen();

        expect(screen.getByRole('button', { name: 'Try again' })).toBeOnTheScreen();

        expect(screen.getByLabelText('Find a character')).toBeOnTheScreen();

        expect(screen.getByRole('button', { name: 'Create character' })).toBeOnTheScreen();
    });

    it('shows the first-load spinner while Try again runs, then the list', async () => {
        errorStatus = 500;
        await renderScreen();
        errorStatus = null;
        let respond: () => void = () => {};
        globalThis.fetch = jest.fn(
            () =>
                new Promise<Response>((resolve) => {
                    respond = () =>
                        resolve({ ok: true, status: 200, json: async () => body } as Response);
                }),
        );

        await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

        expect(screen.getByText('Loading characters…')).toBeOnTheScreen();

        expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();

        respond();
        await advance(0);

        expect(screen.getByText('Thorn Grimsby')).toBeOnTheScreen();

        expect(screen.queryByText('Loading characters…')).toBeNull();
    });

    it('replaces the list when a search fails', async () => {
        await renderScreen();
        errorStatus = 500;

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'ves');
        await advance(SEARCH_DEBOUNCE_MS);
        await advance(0);

        expect(
            screen.getByRole('heading', { name: "Couldn't load your characters" }),
        ).toBeOnTheScreen();

        expect(screen.queryByText('Thorn Grimsby')).toBeNull();
    });
});

describe('Characters when the browser reports it is offline', () => {
    afterEach(() => {
        onlineManager.setOnline(true);
    });

    /** Makes every request fail as a dropped connection does. */
    function dropConnection() {
        globalThis.fetch = jest.fn(async () => {
            throw new TypeError('Network request failed');
        });
    }

    it('fails the first load instead of loading forever', async () => {
        onlineManager.setOnline(false);
        dropConnection();
        await renderScreen();

        expect(
            screen.getByRole('heading', { name: "Couldn't load your characters" }),
        ).toBeOnTheScreen();

        expect(screen.queryByText('Loading characters…')).toBeNull();
    });

    it('fails a search instead of leaving the earlier list showing', async () => {
        await renderScreen();
        onlineManager.setOnline(false);
        dropConnection();

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'ves');
        await advance(SEARCH_DEBOUNCE_MS);
        await advance(0);

        expect(
            screen.getByRole('heading', { name: "Couldn't load your characters" }),
        ).toBeOnTheScreen();

        expect(screen.queryByText('Thorn Grimsby')).toBeNull();
    });
});

describe.each(['tablet', 'tabletLandscape', 'desktop'] as const)(
    'Characters states on %s',
    (layout) => {
        beforeEach(() => {
            setWindowWidth(WIDTHS[layout]);
        });

        it('leaves out the toolbar when signed out', async () => {
            errorStatus = 401;
            await renderScreen();

            expect(screen.getByRole('heading', { name: 'Not signed in' })).toBeOnTheScreen();

            expect(screen.queryByTestId('toolbar')).toBeNull();
        });

        it('keeps only Create character in the toolbar when there are no characters', async () => {
            body = { characters: [], drafts: [] };
            await renderScreen();

            const toolbar = screen.getByTestId('toolbar');

            expect(
                within(toolbar).getByRole('button', { name: 'Create character' }),
            ).toBeOnTheScreen();

            expect(within(toolbar).queryByLabelText('Find a character')).toBeNull();
        });

        it('shows the first-load status line in place of the list', async () => {
            hangRequests();
            await renderScreen();

            expect(screen.getByText('Loading characters…')).toBeOnTheScreen();

            expect(
                within(screen.getByTestId('toolbar')).getByLabelText('Find a character'),
            ).toBeOnTheScreen();
        });
    },
);

describe('Characters with a native screen reader', () => {
    let announce: jest.SpyInstance;

    beforeEach(() => {
        announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation();
        // React Native's Jest setup already mocks this, so the spy is that mock, calls and all.
        announce.mockClear();
    });

    afterEach(() => {
        announce.mockRestore();
    });

    it('announces the first load', async () => {
        hangRequests();
        await renderScreen();

        expect(announce).toHaveBeenCalledWith('Loading characters…');
    });

    it('announces a search starting', async () => {
        await renderScreen();
        hangRequests();

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'ves');
        await advance(SEARCH_DEBOUNCE_MS);

        expect(announce).toHaveBeenLastCalledWith('Searching…');
    });

    it('announces a settled no-results search once, using the trimmed query', async () => {
        await renderScreen();
        body = { characters: [], drafts: [] };
        announce.mockClear();

        await fireEvent.changeText(screen.getByLabelText('Find a character'), ' Zephyr ');
        await advance(SEARCH_DEBOUNCE_MS - 1);

        expect(announce).not.toHaveBeenCalled();

        await advance(1);
        await advance(0);

        expect(announce).toHaveBeenLastCalledWith('No characters match "Zephyr"');

        await fireEvent.changeText(screen.getByLabelText('Find a character'), '  Zephyr  ');
        await advance(SEARCH_DEBOUNCE_MS);

        expect(
            announce.mock.calls.filter(([message]) => message === 'No characters match "Zephyr"'),
        ).toHaveLength(1);
    });

    it('does not announce earlier no-results data while another search debounces or loads', async () => {
        await renderScreen();
        body = { characters: [], drafts: [] };
        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'Zephyr');
        await advance(SEARCH_DEBOUNCE_MS);
        await advance(0);
        announce.mockClear();
        hangRequests();

        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'Sirocco');
        await advance(SEARCH_DEBOUNCE_MS - 1);

        expect(announce).not.toHaveBeenCalled();

        await advance(1);

        expect(
            screen.getByRole('heading', { name: 'No characters match "Zephyr"' }),
        ).toBeOnTheScreen();

        expect(announce).toHaveBeenLastCalledWith('Searching…');

        expect(announce).not.toHaveBeenCalledWith('No characters match "Zephyr"');

        expect(announce).not.toHaveBeenCalledWith('No characters match "Sirocco"');
    });

    it('clears the result announcement when the search is cleared', async () => {
        await renderScreen();
        body = { characters: [], drafts: [] };
        await fireEvent.changeText(screen.getByLabelText('Find a character'), 'Zephyr');
        await advance(SEARCH_DEBOUNCE_MS);
        await advance(0);
        announce.mockClear();
        body = { characters: [thorn], drafts: [] };

        await fireEvent.changeText(screen.getByLabelText('Find a character'), '');
        await advance(SEARCH_DEBOUNCE_MS - 1);

        expect(announce).not.toHaveBeenCalled();

        await advance(1);
        await advance(0);

        expect(screen.getByText('Thorn Grimsby')).toBeOnTheScreen();

        expect(announce).not.toHaveBeenCalledWith('No characters match "Zephyr"');
    });

    it('announces a failed load', async () => {
        errorStatus = 500;
        await renderScreen();

        expect(announce).toHaveBeenLastCalledWith("Couldn't load your characters");
    });

    it('announces a rejected token', async () => {
        errorStatus = 401;
        await renderScreen();

        expect(announce).toHaveBeenLastCalledWith('Not signed in');
    });

    it('announces a missing setting', async () => {
        delete process.env.EXPO_PUBLIC_API_TOKEN;
        await renderScreen();

        expect(announce).toHaveBeenLastCalledWith('API settings missing');
    });
});
