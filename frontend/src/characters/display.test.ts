import type { CharacterSummary, CreationDraft, LevelUpDraft } from '@/api/characters';

import { draftCopy, hitPoints, initial, subtitle, type HitPointDisplay } from './display';

/** Builds an API character with overrides for one display example. */
function character(overrides: Partial<CharacterSummary> = {}): CharacterSummary {
    return {
        id: 'character-1',
        name: 'Thorn Grimsby',
        ancestry: { race_name: 'Dwarf', subrace_name: 'Mountain dwarf' },
        classes: [{ name: 'Fighter', level: 8, subclass_name: 'Champion' }],
        total_level: 8,
        hit_points: { current: 68, maximum: 72, temporary: 0 },
        ...overrides,
    };
}

const creation: CreationDraft = {
    id: 'creation-1',
    kind: 'creation',
    name: 'Nyra Ashfall',
    completed_choices: 2,
    total_choices: 5,
    next_step: 'choose_class',
};

const levelUp: LevelUpDraft = {
    id: 'level-up-1',
    kind: 'level_up',
    character_id: 'kethra',
    character_name: 'Kethra Ironsong',
    from_level: 3,
    to_level: 4,
    completed_choices: 3,
    total_choices: 5,
    next_step: 'ability_score_or_feat',
};

/** Expected display values transcribed from the regular, long and incomplete mockup rows. */
type MockupRow = {
    character: CharacterSummary;
    token: string;
    subtitle: string;
    hp: HitPointDisplay;
};

const mockupRows: MockupRow[] = [
    {
        character: character(),
        token: 'T',
        subtitle: 'Mountain dwarf fighter, Champion',
        hp: { meter: { filled: 9, hurt: false }, line: { current: '68', rest: '/72 hit points' } },
    },
    {
        character: character({
            name: 'Alarra Vane',
            ancestry: { race_name: 'Human', subrace_name: null },
            classes: [{ name: 'Cleric', level: 7, subclass_name: 'Life domain' }],
            total_level: 7,
            hit_points: { current: 38, maximum: 52, temporary: 0 },
        }),
        token: 'A',
        subtitle: 'Human cleric, Life domain',
        hp: { meter: { filled: 7, hurt: false }, line: { current: '38', rest: '/52 hit points' } },
    },
    {
        character: character({
            name: 'Vesper Quill',
            ancestry: { race_name: 'Gnome', subrace_name: 'Rock gnome' },
            classes: [
                { name: 'Wizard', level: 5, subclass_name: 'Divination' },
                { name: 'Rogue', level: 2, subclass_name: null },
            ],
            total_level: 7,
            hit_points: { current: 12, maximum: 26, temporary: 0 },
        }),
        token: 'V',
        subtitle: 'Rock gnome wizard 5 / rogue 2, Divination',
        hp: { meter: { filled: 5, hurt: true }, line: { current: '12', rest: '/26 hit points' } },
    },
    {
        character: character({
            name: 'Brenna Duskhollow',
            ancestry: { race_name: 'Half-elf', subrace_name: null },
            classes: [{ name: 'Warlock', level: 6, subclass_name: 'the Fiend' }],
            total_level: 6,
            hit_points: { current: 31, maximum: 44, temporary: 5 },
        }),
        token: 'B',
        subtitle: 'Half-elf warlock, the Fiend',
        hp: {
            meter: { filled: 7, hurt: false },
            line: { current: '31', rest: '/44 hit points, 5 temporary' },
        },
    },
    {
        character: character({
            name: 'Mudge Tealeaf',
            ancestry: { race_name: 'Halfling', subrace_name: 'Lightfoot halfling' },
            classes: [{ name: 'Rogue', level: 4, subclass_name: 'Arcane trickster' }],
            total_level: 4,
            hit_points: { current: 9, maximum: 27, temporary: 0 },
        }),
        token: 'M',
        subtitle: 'Lightfoot halfling rogue, Arcane trickster',
        hp: { meter: { filled: 3, hurt: true }, line: { current: '9', rest: '/27 hit points' } },
    },
    {
        character: character({
            name: 'Kethra Ironsong',
            ancestry: { race_name: 'Dwarf', subrace_name: 'Hill dwarf' },
            classes: [{ name: 'Paladin', level: 3, subclass_name: 'Oath of devotion' }],
            total_level: 3,
            hit_points: { current: 28, maximum: 28, temporary: 0 },
        }),
        token: 'K',
        subtitle: 'Hill dwarf paladin, Oath of devotion',
        hp: { meter: { filled: 10, hurt: false }, line: { current: '28', rest: '/28 hit points' } },
    },
    {
        character: character({
            name: 'Wilhelmina Thistlewood-Ashgrove of Brackenfell',
            ancestry: { race_name: 'Half-elf', subrace_name: null },
            classes: [
                { name: 'Paladin', level: 6, subclass_name: 'Oath of devotion' },
                { name: 'Warlock', level: 3, subclass_name: 'the Fiend' },
                { name: 'Sorcerer', level: 2, subclass_name: 'Draconic bloodline' },
            ],
            total_level: 11,
            hit_points: { current: 88, maximum: 94, temporary: 0 },
        }),
        token: 'W',
        subtitle:
            'Half-elf paladin 6 / warlock 3 / sorcerer 2, Oath of devotion, the Fiend, Draconic bloodline',
        hp: { meter: { filled: 9, hurt: false }, line: { current: '88', rest: '/94 hit points' } },
    },
    {
        character: character({
            name: 'Corwin Hale',
            ancestry: { race_name: null, subrace_name: null },
            classes: [{ name: 'Fighter', level: 3, subclass_name: 'Champion' }],
            total_level: 3,
            hit_points: { current: 24, maximum: 28, temporary: 0 },
        }),
        token: 'C',
        subtitle: 'Fighter, Champion',
        hp: { meter: { filled: 9, hurt: false }, line: { current: '24', rest: '/28 hit points' } },
    },
    {
        character: character({
            name: 'Orin Blackwater',
            ancestry: { race_name: 'Dwarf', subrace_name: 'Hill dwarf' },
            classes: [{ name: 'Cleric', level: 2, subclass_name: 'Life domain' }],
            total_level: 2,
            hit_points: { current: null, maximum: null, temporary: 0 },
        }),
        token: 'O',
        subtitle: 'Hill dwarf cleric, Life domain',
        hp: { meter: null, line: { current: null, rest: 'Hit points not set' } },
    },
    {
        character: character({
            name: 'Pell Marsh',
            ancestry: { race_name: 'Halfling', subrace_name: 'Stout halfling' },
            classes: [{ name: 'Rogue', level: 2, subclass_name: null }],
            total_level: 2,
            hit_points: { current: 0, maximum: 15, temporary: 0 },
        }),
        token: 'P',
        subtitle: 'Stout halfling rogue',
        hp: { meter: { filled: 0, hurt: true }, line: { current: '0', rest: '/15 hit points' } },
    },
    {
        character: character({
            name: 'Dorian Vale',
            ancestry: { race_name: null, subrace_name: null },
            classes: [],
            total_level: 0,
            hit_points: { current: null, maximum: null, temporary: 0 },
        }),
        token: 'D',
        subtitle: 'Race and class not set',
        hp: { meter: null, line: { current: null, rest: 'Hit points not set' } },
    },
    {
        character: character({
            name: 'Sable Wren',
            ancestry: { race_name: 'Tiefling', subrace_name: null },
            classes: [],
            total_level: 0,
            hit_points: { current: null, maximum: null, temporary: 0 },
        }),
        token: 'S',
        subtitle: 'Tiefling',
        hp: { meter: null, line: { current: null, rest: 'Hit points not set' } },
    },
];

describe('approved character rows', () => {
    it.each(mockupRows)('$character.name matches the mockup', (row) => {
        expect(initial(row.character.name)).toBe(row.token);

        expect(subtitle(row.character)).toBe(row.subtitle);

        expect(hitPoints(row.character.hit_points)).toEqual(row.hp);
    });
});

describe('initial', () => {
    it.each([
        ['  thorn Grimsby  ', 'T'],
        ['éowyn', 'É'],
        ['e\u0301owyn', 'E\u0301'],
        ['🧙 Wizard', '🧙'],
        ['🧙🏽 Wizard', '🧙🏽'],
        ['👩🏽‍🚀 Astronaut', '👩🏽‍🚀'],
        ['🇺🇸 Hero', '🇺🇸'],
        ['', ''],
        [' \t\n ', ''],
        [null, ''],
    ])('keeps the first visible character of %p intact', (name, expected) => {
        expect(initial(name)).toBe(expected);
    });
});

describe('subtitle', () => {
    it('preserves the rest of a class name when uppercasing expands the first grapheme', () => {
        const value = character({
            ancestry: { race_name: null, subrace_name: null },
            classes: [{ name: 'ßorcerer', level: 1, subclass_name: null }],
        });

        expect(subtitle(value)).toBe('SSorcerer');
    });

    it('capitalizes a multiclass summary with no ancestry and preserves class order', () => {
        const value = character({
            ancestry: { race_name: null, subrace_name: null },
            classes: [
                { name: 'Rogue', level: 2, subclass_name: null },
                { name: 'Wizard', level: 5, subclass_name: 'Divination' },
            ],
        });

        expect(subtitle(value)).toBe('Rogue 2 / wizard 5, Divination');
    });

    it('falls back to the race when the subrace is empty', () => {
        const value = character({ ancestry: { race_name: 'Dwarf', subrace_name: '' } });

        expect(subtitle(value)).toBe('Dwarf fighter, Champion');
    });
});

describe('hitPoints', () => {
    it.each([
        [null, 20],
        [10, null],
        [null, null],
        [0, 0],
        [10, 0],
    ])('returns fallback copy for current %p and maximum %p', (current, maximum) => {
        expect(hitPoints({ current, maximum, temporary: 5 })).toEqual({
            meter: null,
            line: { current: null, rest: 'Hit points not set' },
        });
    });

    it.each([
        [1, 100, 1, true],
        [99, 100, 9, false],
        [100, 100, 10, false],
        [150, 100, 10, false],
        [1, 1, 10, false],
        [5, 20, 3, true],
        [9, 20, 5, true],
        [10, 20, 5, false],
    ])('shows %i/%i as %i filled segments with hurt=%p', (current, maximum, filled, hurt) => {
        expect(hitPoints({ current, maximum, temporary: 0 }).meter).toEqual({ filled, hurt });
    });

    it('preserves the current value above maximum in the text', () => {
        expect(hitPoints({ current: 150, maximum: 100, temporary: 0 }).line).toEqual({
            current: '150',
            rest: '/100 hit points',
        });
    });

    it('keeps temporary points out of the meter and hurt state, including at zero current', () => {
        expect(hitPoints({ current: 0, maximum: 20, temporary: 30 })).toEqual({
            meter: { filled: 0, hurt: true },
            line: { current: '0', rest: '/20 hit points, 30 temporary' },
        });
    });
});

describe('draftCopy', () => {
    it('matches the named creation draft on phone', () => {
        expect(draftCopy(creation, true)).toEqual({
            title: 'Nyra Ashfall',
            detail: 'Creation, two of five choices made. Nothing is added to your list until you confirm.',
            resumeLabel: 'Resume',
            resumeAccessibilityLabel: 'Resume creating Nyra Ashfall',
        });
    });

    it('matches the named creation draft on tablet and desktop', () => {
        expect(draftCopy(creation, false)).toEqual({
            title: 'Nyra Ashfall, new character',
            detail: 'Two of five choices made. Next up is choosing a class. Nothing is added to your list until you confirm.',
            resumeLabel: 'Resume creation',
            resumeAccessibilityLabel: 'Resume creating Nyra Ashfall',
        });
    });

    it('matches the unnamed creation draft on phone', () => {
        expect(draftCopy({ ...creation, name: null, completed_choices: 1 }, true)).toEqual({
            title: 'New character',
            detail: 'Creation, one of five choices made. Nothing is added to your list until you confirm.',
            resumeLabel: 'Resume',
            resumeAccessibilityLabel: 'Resume creating a new character',
        });
    });

    it('matches the unnamed creation draft on tablet and desktop', () => {
        expect(draftCopy({ ...creation, name: null, completed_choices: 1 }, false)).toEqual({
            title: 'New character',
            detail: 'One of five choices made. Next up is choosing a class. Nothing is added to your list until you confirm.',
            resumeLabel: 'Resume creation',
            resumeAccessibilityLabel: 'Resume creating a new character',
        });
    });

    it('matches the level-up draft on phone', () => {
        expect(draftCopy(levelUp, true)).toEqual({
            title: 'Kethra Ironsong',
            detail: 'Level 3 to 4, three of five choices made. Nothing changes on the sheet until you confirm.',
            resumeLabel: 'Resume',
            resumeAccessibilityLabel: "Resume Kethra Ironsong's level-up",
        });
    });

    it('matches the level-up draft on tablet and desktop', () => {
        expect(draftCopy(levelUp, false)).toEqual({
            title: 'Kethra Ironsong, level 3 to 4',
            detail: 'Three of five choices made. Next up is an ability increase or a feat. Nothing changes on the sheet until you confirm.',
            resumeLabel: 'Resume level-up',
            resumeAccessibilityLabel: "Resume Kethra Ironsong's level-up",
        });
    });

    it.each(['', ' \t '])('treats a blank creation name %p as unnamed', (name) => {
        expect(draftCopy({ ...creation, name }, false).title).toBe('New character');

        expect(draftCopy({ ...creation, name }, false).resumeAccessibilityLabel).toBe(
            'Resume creating a new character',
        );

        expect(initial(name)).toBe('');
    });

    it('trims a named creation title and Resume label', () => {
        const copy = draftCopy({ ...creation, name: '  Nyra Ashfall  ' }, false);

        expect(copy.title).toBe('Nyra Ashfall, new character');

        expect(copy.resumeAccessibilityLabel).toBe('Resume creating Nyra Ashfall');
    });

    it.each(['choose_background', '', 'toString', '__proto__'])(
        'omits the sentence for unknown next step %p',
        (next_step) => {
            expect(draftCopy({ ...creation, next_step }, false).detail).toBe(
                'Two of five choices made. Nothing is added to your list until you confirm.',
            );

            expect(draftCopy({ ...levelUp, next_step }, false).detail).toBe(
                'Three of five choices made. Nothing changes on the sheet until you confirm.',
            );
        },
    );

    it.each([
        [0, 'zero'],
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
        [4, 'four'],
        [5, 'five'],
        [6, 'six'],
        [7, 'seven'],
        [8, 'eight'],
        [9, 'nine'],
        [10, 'ten'],
    ])('uses the word %s as %s in progress copy', (completed_choices, word) => {
        expect(draftCopy({ ...creation, completed_choices, total_choices: 10 }, true).detail).toBe(
            `Creation, ${word} of ten choices made. Nothing is added to your list until you confirm.`,
        );
    });

    it('uses digits above ten', () => {
        expect(
            draftCopy({ ...levelUp, completed_choices: 12, total_choices: 15 }, false).detail,
        ).toBe(
            '12 of 15 choices made. Next up is an ability increase or a feat. Nothing changes on the sheet until you confirm.',
        );
    });

    it.each([true, false])('uses singular choice when total is one, compact=%p', (compact) => {
        const detail = draftCopy(
            { ...creation, completed_choices: 1, total_choices: 1, next_step: 'unknown' },
            compact,
        ).detail;

        expect(detail).toBe(
            `${compact ? 'Creation, one' : 'One'} of one choice made. Nothing is added to your list until you confirm.`,
        );
    });
});
