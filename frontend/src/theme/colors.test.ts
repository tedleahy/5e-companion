import { contrast, deriveColors, duskBlueDustyRose } from './colors';

describe('deriveColors', () => {
  const colors = deriveColors(duskBlueDustyRose);

  it('matches the derived tokens in the design system', () => {
    expect(colors).toEqual({
      ...duskBlueDustyRose,
      ink: '#1f4477',
      dim: '#44618a',
      onA: '#f2f0eb',
      onB: '#412029',
      onMix: '#f2f0eb',
      bText: '#914261',
      wash: 'rgba(255,255,255,0.5)',
      dot: 'rgba(37,96,176,0.13)',
      line: 'rgba(224,104,156,0.18)',
      empty: 'rgba(224,104,156,0.26)',
      draftBg: 'rgba(224,104,156,0.11)',
      rule: 'rgba(37,96,176,0.28)',
      chip: 'rgba(242,240,235,0.1)',
      chip2: 'rgba(31,68,119,0.08)',
      scrim: 'rgba(31,68,119,0.4)',
    });
  });

  it.each([
    ['ink', 'paper'],
    ['dim', 'paper'],
    ['dim', 'sheet'],
    ['onA', 'a'],
    ['onB', 'b'],
    ['onMix', 'mix'],
    ['bText', 'sheet'],
  ] as const)('gives %s on %s at least 4.5:1 contrast', (text, surface) => {
    expect(contrast(colors[text], colors[surface])).toBeGreaterThanOrEqual(4.5);
  });
});
