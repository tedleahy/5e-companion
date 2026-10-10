import type { TextStyle } from 'react-native';

import { useBreakpoint } from '@/hooks/use-breakpoint';
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

/** Compact cards on phones, and wide ones from tablet up. */
export function useCardScale(): CardScale {
    return useBreakpoint() === 'phone' ? COMPACT : WIDE;
}
