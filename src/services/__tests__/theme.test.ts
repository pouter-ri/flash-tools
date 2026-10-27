import * as fs from 'fs';
import * as path from 'path';
import { COLORS, LIGHT, DARK, applyTheme } from '../../theme/colors';

afterEach(() => {
  applyTheme('dark');
});

describe('theme palette switching', () => {
  it("applyTheme('light') sets COLORS to LIGHT values and back", () => {
    applyTheme('light');
    expect(COLORS).toEqual(LIGHT);
    expect(COLORS.bg).toBe(LIGHT.bg);
    expect(COLORS.text).toBe(LIGHT.text);
    expect(COLORS.statusBar).toBe('dark');

    applyTheme('dark');
    expect(COLORS).toEqual(DARK);
    expect(COLORS.bg).toBe(DARK.bg);
    expect(COLORS.statusBar).toBe('light');
  });
});

describe('screens consume the live palette via a style factory', () => {
  // Note: styles are created at render (inside components, from useTheme().colors),
  // so they are not importable in this node test env (react-native components pull
  // in native modules). Assert on source text instead: every themed stylesheet must
  // be a `(c: Palette)` factory invoked during render, never a module-scope
  // StyleSheet.create reading the COLORS snapshot.
  const root = path.resolve(__dirname, '..', '..', '..');
  const read = (rel: string): string => fs.readFileSync(path.join(root, rel), 'utf8');

  const factoryFiles = [
    'src/components/ui.tsx',
    'src/screens/HomeScreen.tsx',
    'src/screens/CompassScreen.tsx',
    'src/screens/FlashlightScreen.tsx',
    'src/screens/LevelScreen.tsx',
    'src/screens/RulerScreen.tsx',
  ];

  it.each(factoryFiles)('%s builds styles from the live palette', (rel) => {
    const src = read(rel);
    expect(src).toMatch(/styles\(colors\)|cardStyles\(colors\)/);
    expect(src).toContain('useTheme()');
    expect(src).toContain('(c: Palette)');
    expect(src).not.toContain('COLORS.');
  });

  it('ErrorBoundary renders through the live palette via a hook wrapper', () => {
    const src = read('src/components/ErrorBoundary.tsx');
    expect(src).toContain('useTheme()');
    expect(src).toMatch(/styles\((colors|this\.props\.colors)\)/);
    expect(src).not.toContain('COLORS.');
  });

  it('App shell follows the live palette (background + StatusBar)', () => {
    const src = read('App.tsx');
    expect(src).toContain('colors.bg');
    expect(src).toContain('colors.statusBar');
    expect(src).not.toContain('COLORS.');
  });

  it('ThemeContext exposes the live palette', () => {
    const src = read('src/theme/ThemeContext.tsx');
    expect(src).toContain('colors: Palette');
    // Single source of truth, like unit-convert: context hands out the live
    // COLORS singleton instead of a LIGHT/DARK snapshot that can diverge.
    expect(src).toContain('colors: COLORS');
    expect(src).not.toContain('LIGHT');
    expect(src).not.toContain('DARK');
    expect(src).toContain('applyTheme(');
  });

  it('ThemeContext toggle is race-safe (functional updater)', () => {
    const src = read('src/theme/ThemeContext.tsx');
    expect(src).toMatch(/setModeState\(\(prev\)/);
    // A tap before the stored theme finishes loading must win.
    expect(src).toContain('userSet');
  });
});
