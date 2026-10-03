/**
 * Colour tokens, ported from `derive()` in `mockups/character-sheet.html`.
 *
 * Five source inks are picked by hand and every other token is computed from
 * them, so a new palette only needs five values. Text tokens are
 * contrast-targeted: the derivation steps through mix ratios and keeps the
 * first one that reaches WCAG AA on every surface the text sits on. See
 * "Inks and tokens" in `docs/design-system.html` for what each token is for.
 */

/** The five hand-picked inks that a palette is derived from. */
export type Inks = {
    /** Page background. */
    paper: string;
    /** Card, field and ring surface, one step lighter than paper. */
    card: string;
    /** Plates, borders, primary numbers. */
    structural: string;
    /** Offset shadows, hurt state, primary actions. */
    accent: string;
    /** Concentration marks. */
    overprint: string;
};

/** Every colour token: the five inks plus the tokens derived from them. */
export type Colors = Inks & {
    text: string;
    dim: string;
    onStructural: string;
    onAccent: string;
    onOverprint: string;
    accentText: string;
    wash: string;
    dot: string;
    line: string;
    track: string;
    draftFill: string;
    rule: string;
    chipOnPlate: string;
    chipOnPaper: string;
    scrim: string;
};

/** The current pairing, "Dusk blue / dusty rose". */
export const duskBlueDustyRose: Inks = {
    paper: '#eae6de',
    card: '#f0ece4',
    structural: '#2560b0',
    accent: '#e0689c',
    overprint: '#5c3d88',
};

/** The WCAG AA contrast minimum for body text. */
const AA = 4.5;

/** Parses `#rrggbb` or the short `#rgb` form. */
function hexToRgb(hex: string): [number, number, number] {
    let digits = hex.replace('#', '');
    if (digits.length === 3) {
        digits = digits[0] + digits[0] + digits[1] + digits[1] + digits[2] + digits[2];
    }
    return [
        parseInt(digits.slice(0, 2), 16),
        parseInt(digits.slice(2, 4), 16),
        parseInt(digits.slice(4, 6), 16),
    ];
}

/** Formats channels as `#rrggbb`, rounding and clamping each to 0–255. */
function rgbToHex(r: number, g: number, b: number): string {
    return (
        '#' +
        [r, g, b]
            .map((x) => ('0' + Math.round(Math.max(0, Math.min(255, x))).toString(16)).slice(-2))
            .join('')
    );
}

/** Mixes hex colour `a` toward `b` by `t`, from 0 (all `a`) to 1 (all `b`). */
function mix(a: string, b: string, t: number): string {
    const [ar, ag, ab] = hexToRgb(a);
    const [br, bg, bb] = hexToRgb(b);
    return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

function rgba(hex: string, alpha: number): string {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${alpha})`;
}

/** WCAG relative luminance, from 0 for black to 1 for white. */
function luminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex).map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two opaque hex colours. */
export function contrast(x: string, y: string): number {
    const p = luminance(x) + 0.05;
    const q = luminance(y) + 0.05;
    return p > q ? p / q : q / p;
}

/**
 * Numbers from `from` to `to` inclusive, `by` apart. Each is rounded to two decimals so that
 * floating point drift doesn't miss the end. `by` is negative to count down.
 */
function steps(from: number, to: number, by: number): number[] {
    const out: number[] = [];
    const n = Math.round((to - from) / by);
    for (let i = 0; i <= n; i++) out.push(+(from + by * i).toFixed(2));
    return out;
}

/** First candidate that reaches AA against every background, else the last candidate. */
function ensure(fn: (t: number) => string, ts: number[], backgrounds: string[]): string {
    for (const t of ts) {
        const candidate = fn(t);
        if (backgrounds.every((bg) => contrast(candidate, bg) >= AA)) return candidate;
    }
    return fn(ts[ts.length - 1]);
}

/** Light text if it passes AA on the ink, otherwise the lightest darkened ink that does. */
function onInk(bg: string, paper: string): string {
    const light = luminance(paper) > 0.65 ? mix(paper, '#ffffff', 0.4) : '#ffffff';
    if (contrast(light, bg) >= AA) return light;
    const dark = ensure((t) => mix(bg, '#140c08', t), steps(0.6, 1, 0.02), [bg]);
    return contrast(dark, bg) >= contrast(light, bg) ? dark : light;
}

/** Derives every colour token from the five source inks. */
export function deriveColors({ paper, card, structural, accent, overprint }: Inks): Colors {
    let text = mix(structural, '#14110e', luminance(structural) > 0.2 ? 0.72 : 0.35);
    if (luminance(text) > 0.22) text = mix(text, '#14110e', 0.55);
    const onStructural = onInk(structural, paper);
    // A draft's tint is see-through and sits on paper, so text is checked
    // against the tint over paper as well as over the card colour.
    const draftSolid = mix(card, accent, 0.11);
    const draftOnPaper = mix(paper, accent, 0.11);
    const chipAlpha =
        steps(0.16, 0, -0.02).find(
            (alpha) => contrast(onStructural, mix(structural, onStructural, alpha)) >= AA,
        ) ?? 0;

    return {
        paper,
        card,
        structural,
        accent,
        overprint,
        text,
        dim: ensure((t) => mix(text, paper, t), steps(0.42, 0, -0.02), [
            paper,
            card,
            draftSolid,
            draftOnPaper,
        ]),
        onStructural,
        onAccent: onInk(accent, paper),
        onOverprint: onInk(overprint, paper),
        accentText: ensure((t) => mix(accent, '#1a0a08', t), steps(0.15, 0.9, 0.05), [
            card,
            draftSolid,
            draftOnPaper,
        ]),
        wash: rgba('#ffffff', 0.5),
        dot: rgba(structural, 0.13),
        line: rgba(accent, luminance(accent) > 0.6 ? 0.28 : 0.18),
        track: rgba(luminance(accent) > 0.55 ? mix(accent, '#3a3010', 0.35) : accent, 0.26),
        draftFill: rgba(accent, 0.11),
        rule: rgba(structural, 0.28),
        chipOnPlate: rgba(onStructural, chipAlpha),
        chipOnPaper: rgba(text, 0.08),
        scrim: rgba(text, 0.4),
    };
}
