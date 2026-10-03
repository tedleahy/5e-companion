import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { hitPoints } from '@/characters/display';
import { colors } from '@/theme';

import { HitPoints } from './hit-points';

function segmentColors() {
  return screen
    .getAllByTestId('hit-point-segment', { includeHiddenElements: true })
    .map((segment) => StyleSheet.flatten(segment.props.style).backgroundColor);
}

describe('HitPoints', () => {
  it('fills the meter in structural ink and reads out the line', async () => {
    await render(<HitPoints display={hitPoints({ current: 38, maximum: 52, temporary: 0 })} />);

    expect(segmentColors()).toEqual([
      ...Array(7).fill(colors.structural),
      ...Array(3).fill(colors.track),
    ]);

    expect(screen.getByText('38/52 hit points')).toBeOnTheScreen();
  });

  it('switches to accent ink when hurt', async () => {
    await render(<HitPoints display={hitPoints({ current: 30, maximum: 64, temporary: 5 })} />);

    expect(segmentColors()).toEqual([
      ...Array(5).fill(colors.accent),
      ...Array(5).fill(colors.track),
    ]);

    expect(screen.getByText('30')).toHaveStyle({ color: colors.accentText });

    expect(screen.getByText('30/64 hit points, 5 temporary')).toBeOnTheScreen();
  });

  it('hides the meter from screen readers', async () => {
    await render(<HitPoints display={hitPoints({ current: 68, maximum: 72, temporary: 0 })} />);

    expect(screen.queryAllByTestId('hit-point-segment')).toHaveLength(0);

    expect(
      screen.getAllByTestId('hit-point-segment', { includeHiddenElements: true }),
    ).toHaveLength(10);
  });

  it('shows only the line when hit points are not set', async () => {
    await render(<HitPoints display={hitPoints({ current: null, maximum: null, temporary: 0 })} />);

    expect(
      screen.queryAllByTestId('hit-point-segment', { includeHiddenElements: true }),
    ).toHaveLength(0);

    expect(screen.getByText('Hit points not set')).toBeOnTheScreen();
  });
});
