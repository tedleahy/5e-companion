import { act, render, screen } from '@testing-library/react-native';
import { getAnimatedStyle, useReducedMotion } from 'react-native-reanimated';

import { Spinner } from './spinner';

jest.mock('react-native-reanimated', () => ({
  // The spread drops the non-enumerable ES module flag, which the default import needs.
  __esModule: true,
  ...jest.requireActual('react-native-reanimated'),
  useReducedMotion: jest.fn(),
}));

function spinner() {
  return screen.getByTestId('spinner', { includeHiddenElements: true });
}

/** Moves the fake clock on, letting Reanimated run the frames in between. */
async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(useReducedMotion).mockReturnValue(false);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('Spinner', () => {
  it('is hidden from screen readers', async () => {
    await render(<Spinner size={36} />);

    expect(screen.queryByTestId('spinner')).toBeNull();

    expect(spinner()).toHaveStyle({ width: 36, height: 36 });
  });

  it('keeps turning, once every 0.9 seconds', async () => {
    await render(<Spinner size={36} />);

    await advance(450);

    expect(getAnimatedStyle(spinner())).toMatchObject({ transform: [{ rotate: '180deg' }] });

    // Halfway through the second turn, so a spinner that stopped after one turn would sit at 360.
    await advance(900);

    expect(getAnimatedStyle(spinner())).toMatchObject({ transform: [{ rotate: '180deg' }] });
  });

  it('holds still when reduced motion is on', async () => {
    jest.mocked(useReducedMotion).mockReturnValue(true);
    await render(<Spinner size={36} />);

    // Longer than a full turn, so an animation that starts late would still show.
    await advance(1350);

    expect(getAnimatedStyle(spinner())).toMatchObject({ transform: [{ rotate: '0deg' }] });
  });
});
