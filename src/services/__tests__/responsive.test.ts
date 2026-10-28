import * as fs from 'fs';
import * as path from 'path';

// Regression tests for the landscape/responsive pass: every screen must fit
// short (landscape) heights and respect horizontal safe-area insets.

const root = path.resolve(__dirname, '..', '..', '..');
const read = (rel: string): string => fs.readFileSync(path.join(root, rel), 'utf8');

describe('responsive layout (portrait + landscape)', () => {
  it('App shell pads horizontal safe-area insets (no content under the nav bar)', () => {
    const src = read('App.tsx');
    expect(src).toContain("'left'");
    expect(src).toContain("'right'");
  });

  it.each([
    'src/screens/RulerScreen.tsx',
    'src/screens/CompassScreen.tsx',
    'src/screens/LevelScreen.tsx',
  ])('%s re-renders on rotation via useWindowDimensions', (rel) => {
    expect(read(rel)).toContain('useWindowDimensions');
  });

  it('compass dial shrinks on short screens instead of clipping', () => {
    const src = read('src/screens/CompassScreen.tsx');
    expect(src).toContain('windowHeight');
    expect(src).toContain('dialSize');
    expect(src).toMatch(/Math\.min\(260/);
  });

  it('level pad shrinks on short screens instead of clipping', () => {
    const src = read('src/screens/LevelScreen.tsx');
    expect(src).toContain('windowHeight');
    expect(src).toContain('padSize');
    expect(src).toMatch(/Math\.min\(240/);
  });

  it('ruler body scrolls vertically when height is short', () => {
    const src = read('src/screens/RulerScreen.tsx');
    expect(src).toContain('contentContainerStyle={s.body}');
    expect(src).toMatch(/body:\s*\{\s*flexGrow: 1/s);
  });
});
