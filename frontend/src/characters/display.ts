import { splitGraphemes } from 'unicode-segmenter/grapheme';

import type { CharacterSummary, CreationDraft, Draft, LevelUpDraft } from '@/api/characters';

/** The meter and text a hit point component renders, including the unavailable state. */
export type HitPointDisplay = {
    meter: { filled: number; hurt: boolean } | null; // Null when current or max hit points are missing, or the max is zero
    line: {
        current: string | null;
        rest: string; // Text following the current, or the complete fallback when current is null
    };
};

/** Approved title, progress text and button label for a draft at one layout size. */
export type DraftCopy = {
    title: string;
    detail: string;
    resumeLabel: string;
};

/** Shared progress and next-step sentences prepared for either draft kind. */
type DraftSentences = {
    progress: string;
    nextSentence: string; // Empty when the next step has no approved phrase
};

/** Formats ancestry, ordered classes and subclasses, leaving out missing parts. */
export function subtitle(character: CharacterSummary): string {
    const { ancestry, classes } = character;
    const race = ancestry.subrace_name || ancestry.race_name;

    const classText = classes
        .map(({ name, level }) =>
            classes.length > 1 ? `${name.toLowerCase()} ${level}` : name.toLowerCase(),
        )
        .join(' / ');
    const subclasses = classes.map(({ subclass_name }) => subclass_name).filter(Boolean);
    const summary = [race, classText].filter(Boolean).join(' ');

    if (!summary) return 'Race and class not set';

    const text = race ? summary : capitalise(summary);
    return subclasses.length ? `${text}, ${subclasses.join(', ')}` : text;
}

/**
 * Uppercases the first grapheme (normal char or unicode char) without changing the rest of the text.
 */
function capitalise(text: string): string {
    const firstChar = splitGraphemes(text).next().value ?? '';
    // Slice by the original length because uppercasing can expand a grapheme, such as ß to SS.
    return firstChar.toUpperCase() + text.slice(firstChar.length);
}
/**
 * Returns the the uppercased first character in a name, allowing for unicode chars.
 *
 * @param name - The character or draft name, or null for an empty token.
 */
export function initial(name: string | null): string {
    const firstChar = splitGraphemes(name?.trim() ?? '').next().value ?? '';
    return firstChar.toUpperCase();
}

/**
 * Formats actual hit points and a ten-segment meter; temporary points only affect the text.
 *
 * @param points.current - The remaining hit points, or null when they are not set.
 * @param points.maximum - The hit point maximum, or null when it is not set. A nonpositive maximum hides the meter.
 * @param points.temporary - The temporary hit points to append to the text without filling the meter.
 */
export function hitPoints({
    current,
    maximum,
    temporary,
}: CharacterSummary['hit_points']): HitPointDisplay {
    if (current === null || maximum === null || maximum <= 0) {
        return { meter: null, line: { current: null, rest: 'Hit points not set' } };
    }

    const filled = filledSegments(current, maximum);

    return {
        meter: { filled, hurt: current * 2 < maximum },
        line: {
            current: String(current),
            rest: `/${maximum} hit points${temporary > 0 ? `, ${temporary} temporary` : ''}`,
        },
    };
}

/** Counts filled segments in the ten-segment meter. The maximum must be positive. */
function filledSegments(current: number, maximum: number): number {
    if (current <= 0) return 0;
    if (current >= maximum) return 10;

    const hpFraction = current / maximum;
    // Scale the remaining HP to ten segments and round to the nearest whole segment.
    const roundedSegments = Math.round(hpFraction * 10);

    // Partial health stays between one and nine, even if rounding gives zero or ten.
    return Math.max(1, Math.min(9, roundedSegments));
}

const NUMBER_WORDS = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
];

const NEXT_STEP_PHRASES = new Map([
    ['choose_class', 'choosing a class'],
    ['ability_score_or_feat', 'an ability increase or a feat'],
]);

/**
 * Formats either draft kind; compact phone copy omits the next step and uses a short button label.
 *
 * @param draft - The unfinished creation or level-up whose title and progress to format.
 * @param compact - Whether to use the shorter phone title, detail, and Resume label.
 */
export function draftCopy(draft: Draft, compact: boolean): DraftCopy {
    const completed = getNumberWord(draft.completed_choices);
    const total = getNumberWord(draft.total_choices);

    const choiceNoun = draft.total_choices === 1 ? 'choice' : 'choices';
    const progress = `${completed} of ${total} ${choiceNoun} made.`;

    const nextStep = NEXT_STEP_PHRASES.get(draft.next_step);
    const nextSentence = nextStep ? `Next up is ${nextStep}.` : '';

    return draft.kind === 'creation'
        ? creationDraftCopy(draft, compact, { progress, nextSentence })
        : levelUpDraftCopy(draft, compact, { progress, nextSentence });
}

/**
 * Spells out small choice counts, using digits above ten.
 *
 * @param n - The choice count to spell out when it is between zero and ten.
 */
function getNumberWord(n: number): string {
    return NUMBER_WORDS[n] ?? n.toString();
}

/**
 * Formats creation copy for phone or wide layouts, including the unnamed title fallback.
 *
 * @param draft - The unfinished creation draft whose name supplies the title.
 * @param compact - Whether to use the shorter phone copy.
 * @param sentences.progress - The completed and total choice counts already formatted as a sentence.
 * @param sentences.nextSentence - The approved next-step sentence, or an empty string to omit it.
 */
function creationDraftCopy(
    draft: CreationDraft,
    compact: boolean,
    { progress, nextSentence }: DraftSentences,
): DraftCopy {
    const confirmation = 'Nothing is added to your list until you confirm.';
    const sentences = compact
        ? [`Creation, ${progress}`, confirmation]
        : [capitalise(progress), nextSentence, confirmation];

    return {
        title: creationDraftTitle(draft.name, compact),
        detail: sentences.filter(Boolean).join(' '),
        resumeLabel: compact ? 'Resume' : 'Resume creation',
    };
}

/**
 * Formats a creation title, keeping unnamed drafts as "New character".
 *
 * @param name - The creation draft name, or null to use New character.
 * @param compact - Whether to omit the new-character suffix from a named draft.
 */
function creationDraftTitle(name: string | null, compact: boolean): string {
    const trimmedName = name?.trim();

    if (!trimmedName) return 'New character';
    if (compact) return trimmedName;

    return `${trimmedName}, new character`;
}

/**
 * Formats level-up copy, placing levels in the phone detail or the wide title.
 *
 * @param draft - The level-up draft supplying the character name and starting and target levels.
 * @param compact - Whether to use the shorter phone copy.
 * @param sentences.progress - The completed and total choice counts already formatted as a sentence.
 * @param sentences.nextSentence - The approved next-step sentence, or an empty string to omit it.
 */
function levelUpDraftCopy(
    draft: LevelUpDraft,
    compact: boolean,
    { progress, nextSentence }: DraftSentences,
): DraftCopy {
    const confirmation = 'Nothing changes on the sheet until you confirm.';
    const levels = `level ${draft.from_level} to ${draft.to_level}`;
    const sentences = compact
        ? [`${capitalise(levels)}, ${progress}`, confirmation]
        : [capitalise(progress), nextSentence, confirmation];

    return {
        title: compact ? draft.character_name : `${draft.character_name}, ${levels}`,
        detail: sentences.filter(Boolean).join(' '),
        resumeLabel: compact ? 'Resume' : 'Resume level-up',
    };
}
