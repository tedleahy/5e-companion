import { createContext, useContext, type ReactNode } from 'react';
import type { TextStyle } from 'react-native';

import { typography } from '@/theme';

/** The sizes the list's cards, rows and drafts share at one width. */
export type CardScale = {
    /** False on phones, where cards are compact and drafts use the short copy. */
    wide: boolean;
    tokenSize: 56 | 64;
    name: TextStyle;
    subtitle: TextStyle;
    /** Whether the level block uses its larger label. */
    largeLevelLabel: boolean;
};

const COMPACT: CardScale = {
    wide: false,
    tokenSize: 56,
    name: typography.namePhone,
    subtitle: typography.subtitle,
    largeLevelLabel: false,
};

const WIDE: CardScale = {
    wide: true,
    tokenSize: 64,
    name: typography.nameDesktop,
    subtitle: typography.subtitleDesktop,
    largeLevelLabel: true,
};

/** Compact unless a `CardScaleProvider` says otherwise, such as for a part rendered on its own. */
const CardScaleContext = createContext<CardScale>(COMPACT);

/**
 * Sets the card scale for everything inside it. The screen sets it from the layout it chose, so
 * cards can't disagree with their layout about the width.
 *
 * @param props.wide - Whether to use the wide scale, from tablet up.
 * @param props.children - The layout whose cards, rows, drafts and messages use the scale.
 */
export function CardScaleProvider({ wide, children }: { wide: boolean; children: ReactNode }) {
    return (
        <CardScaleContext.Provider value={wide ? WIDE : COMPACT}>
            {children}
        </CardScaleContext.Provider>
    );
}

/** The card scale the enclosing layout set: compact on phones, and wide from tablet up. */
export function useCardScale(): CardScale {
    return useContext(CardScaleContext);
}
