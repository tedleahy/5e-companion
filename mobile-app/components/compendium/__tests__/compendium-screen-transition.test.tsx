import { act } from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { getAnimatedStyle } from 'react-native-reanimated/lib/module/jestUtils';
import CompendiumScreenTransition from '@/components/compendium/compendium-screen-transition';
import { blurFocusedScreens, focusScreens } from '@/test-utils/screenFocus';

const mockRoute = { name: 'spells' };
const mockReducedMotion = { enabled: false };

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useRoute: () => ({ name: mockRoute.name, key: 'route-key', params: undefined }),
}));

jest.mock('react-native-reanimated', () => ({
    __esModule: true,
    ...jest.requireActual('react-native-reanimated'),
    useReducedMotion: () => mockReducedMotion.enabled,
}));

/** One 60fps frame, enough for the mapper to publish a mid-animation value. */
const ONE_FRAME_MS = 16;
/** Comfortably longer than any transition here, so animations have settled. */
const SETTLED_MS = 1000;

/** Current opacity and scale of the transition wrapper. */
function readTransition() {
    const style = getAnimatedStyle(screen.getByTestId('compendium-screen-transition'));
    const transform = style.transform as { scale: number }[] | undefined;
    return { opacity: style.opacity as number, scale: transform?.[0]?.scale ?? 1 };
}

function advance(ms: number) {
    act(() => { jest.advanceTimersByTime(ms); });
}

/** Blurs then refocuses the screen, as popping back to it does. */
function popBackToScreen() {
    act(() => { blurFocusedScreens(); });
    act(() => { focusScreens(); });
}

function renderTransition() {
    return render(
        <CompendiumScreenTransition>
            <Text>Screen body</Text>
        </CompendiumScreenTransition>,
    );
}

describe('CompendiumScreenTransition', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockRoute.name = 'spells';
        mockReducedMotion.enabled = false;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders the screen it wraps', () => {
        renderTransition();

        expect(screen.getByText('Screen body')).toBeTruthy();
    });

    it('grows a pushed category screen in from below full size', () => {
        renderTransition();

        // A category mounts exactly when it is pushed, so it starts mid-transition
        // rather than showing a frame of settled content first.
        const start = readTransition();
        expect(start.opacity).toBe(0);
        expect(start.scale).toBeLessThan(1);

        advance(SETTLED_MS);

        expect(readTransition()).toEqual({ opacity: 1, scale: 1 });
    });

    it('leaves the hub settled on first mount, since the drawer covers that arrival', () => {
        mockRoute.name = 'index';
        renderTransition();

        expect(readTransition()).toEqual({ opacity: 1, scale: 1 });

        advance(SETTLED_MS);

        expect(readTransition()).toEqual({ opacity: 1, scale: 1 });
    });

    it('settles the hub down from above full size when popping back to it', () => {
        mockRoute.name = 'index';
        renderTransition();

        popBackToScreen();
        advance(ONE_FRAME_MS);

        // Opposite direction to a push: the hub shrinks back to rest rather than growing.
        expect(readTransition().scale).toBeGreaterThan(1);

        advance(SETTLED_MS);

        expect(readTransition()).toEqual({ opacity: 1, scale: 1 });
    });

    it('never fades the hub, so the night background cannot flash through it', () => {
        mockRoute.name = 'index';
        renderTransition();

        popBackToScreen();

        expect(readTransition().opacity).toBe(1);
        advance(ONE_FRAME_MS);
        expect(readTransition().opacity).toBe(1);
        advance(SETTLED_MS);
        expect(readTransition().opacity).toBe(1);
    });

    it('mounts settled and skips the transition under reduced motion', () => {
        mockReducedMotion.enabled = true;
        renderTransition();

        expect(readTransition()).toEqual({ opacity: 1, scale: 1 });

        advance(SETTLED_MS);

        expect(readTransition()).toEqual({ opacity: 1, scale: 1 });
    });
});
