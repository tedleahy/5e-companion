import { contrast, deriveColors, duskBlueDustyRose } from './colors';

describe('deriveColors', () => {
  const colors = deriveColors(duskBlueDustyRose);

  it('matches the derived tokens in the design system', () => {
    expect(colors).toEqual({
      ...duskBlueDustyRose,
      text: '#1f4477',
      dim: '#44618a',
      onStructural: '#f2f0eb',
      onAccent: '#412029',
      onOverprint: '#f2f0eb',
      accentText: '#914261',
      wash: 'rgba(255,255,255,0.5)',
      dot: 'rgba(37,96,176,0.13)',
      line: 'rgba(224,104,156,0.18)',
      track: 'rgba(224,104,156,0.26)',
      draftFill: 'rgba(224,104,156,0.11)',
      rule: 'rgba(37,96,176,0.28)',
      chipOnPlate: 'rgba(242,240,235,0.1)',
      chipOnPaper: 'rgba(31,68,119,0.08)',
      scrim: 'rgba(31,68,119,0.4)',
    });
  });

  it.each([
    ['text', 'paper'],
    ['dim', 'paper'],
    ['dim', 'card'],
    ['onStructural', 'structural'],
    ['onAccent', 'accent'],
    ['onOverprint', 'overprint'],
    ['accentText', 'card'],
  ] as const)('gives %s on %s at least 4.5:1 contrast', (text, surface) => {
    expect(contrast(colors[text], colors[surface])).toBeGreaterThanOrEqual(4.5);
  });
});
