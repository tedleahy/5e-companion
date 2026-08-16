import {
    createContext,
    useContext,
    useMemo,
    useRef,
} from 'react';
import type { ScrollView } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

export type CompendiumDetailScrollApi = {
    registerContentOffset: (y: number) => void;
    registerSection: (id: string, y: number) => void;
    scrollToSection: (id: string) => void;
};

/** Detail-scroll API for in-page jump links; null when no detail is open. */
export const CompendiumDetailScrollContext = createContext<CompendiumDetailScrollApi | null>(null);

/** Reads the in-page jump API for the open Compendium detail, if any. */
export function useCompendiumDetailScroll() {
    return useContext(CompendiumDetailScrollContext);
}

/** Owns the detail ScrollView ref and section offsets used by jump links. */
export function useCompendiumDetailScrollController() {
    const scrollRef = useRef<ScrollView>(null);
    const contentOffsetY = useRef(0);
    const sectionOffsets = useRef<Record<string, number>>({});
    const reducedMotion = useReducedMotion();
    const reducedMotionRef = useRef(reducedMotion);
    reducedMotionRef.current = reducedMotion;

    const api = useMemo<CompendiumDetailScrollApi>(() => ({
        registerContentOffset(y: number) {
            contentOffsetY.current = y;
        },
        registerSection(id: string, y: number) {
            sectionOffsets.current[id] = y;
        },
        scrollToSection(id: string) {
            const y = sectionOffsets.current[id];
            if (y == null) return;
            scrollRef.current?.scrollTo({
                y: contentOffsetY.current + y,
                animated: !reducedMotionRef.current,
            });
        },
    }), []);

    return { scrollRef, api };
}
