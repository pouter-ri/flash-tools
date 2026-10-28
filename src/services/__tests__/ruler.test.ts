import * as fs from 'fs';
import * as path from 'path';
import { pxPerCm, rulerDp, rulerPx, rulerTicks } from '../tools';

describe('pxPerCm', () => {
  it('converts mdpi (160dpi) to ~63px per cm', () => {
    expect(pxPerCm(160)).toBeCloseTo(160 / 2.54, 5);
  });

  it('falls back to mdpi for bad input', () => {
    expect(pxPerCm(null)).toBeCloseTo(160 / 2.54, 5);
    expect(pxPerCm(0)).toBeCloseTo(160 / 2.54, 5);
    expect(pxPerCm(NaN)).toBeCloseTo(160 / 2.54, 5);
  });
});

describe('rulerPx', () => {
  it('scales cm linearly at fixed dpi', () => {
    expect(rulerPx(2, 'cm', 160)).toBeCloseTo(2 * rulerPx(1, 'cm', 160), 5);
  });

  it('converts inches to 2.54x the cm length', () => {
    expect(rulerPx(1, 'inch', 160)).toBeCloseTo(2.54 * rulerPx(1, 'cm', 160), 5);
  });

  it('produces a screen-filling 12cm blade from a density ratio (ratio * 160 = dpi)', () => {
    // Regression: RulerScreen must pass ratio-converted DPI, not the raw
    // PixelRatio.get() value (~2.6), which rendered a ~12px sliver.
    const dpiFromRatio = 2.625 * 160;
    expect(rulerPx(12, 'cm', dpiFromRatio)).toBeGreaterThan(1000);
    expect(rulerPx(12, 'cm', 2.625)).toBeLessThan(50);
  });
});

describe('rulerDp', () => {
  it('converts physical px to layout dp by dividing out the density', () => {
    // Regression: feeding rulerPx() (physical px) straight into styles
    // inflated the blade ~2.6x on a 2.625-density phone.
    expect(rulerDp(1, 'cm', 420, 2.625)).toBeCloseTo(rulerPx(1, 'cm', 160), 5);
    expect(rulerDp(1, 'inch', 420, 2.625)).toBeCloseTo(160, 5);
  });

  it('scales linearly and falls back to density 1 for bad input', () => {
    expect(rulerDp(2, 'cm', 420, 2.625)).toBeCloseTo(2 * rulerDp(1, 'cm', 420, 2.625), 5);
    expect(rulerDp(1, 'cm', 420, 0)).toBeCloseTo(rulerPx(1, 'cm', 420), 5);
    expect(rulerDp(1, 'cm', 420, null)).toBeCloseTo(rulerPx(1, 'cm', 420), 5);
  });
});

describe('ruler uses exact panel DPI, no manual calibration', () => {
  const root = path.resolve(__dirname, '..', '..', '..');
  const read = (rel: string): string => fs.readFileSync(path.join(root, rel), 'utf8');

  it('RulerScreen reads the true physical DPI from the native module', () => {
    const src = read('src/screens/RulerScreen.tsx');
    expect(src).toContain('getExactDpi');
    expect(src).toContain('exactDpi');
    expect(src).toContain('rulerDp(1, unit, dpi, density)');
  });

  it('RulerScreen has no calibration UI or calibration offset left', () => {
    const src = read('src/screens/RulerScreen.tsx');
    expect(src).not.toContain('calib');
    expect(src).not.toContain('Calibration');
  });

  it('native module exposes DisplayMetrics xdpi/ydpi', () => {
    const src = read('android/app/src/main/java/com/pouter/flashtools/ScreenMetricsModule.kt');
    expect(src).toContain('displayMetrics');
    expect(src).toContain('"xdpi"');
    expect(src).toContain('"ydpi"');
  });
});

describe('rulerTicks', () => {
  it('emits labeled majors every 1cm with 1mm minors', () => {
    const ticks = rulerTicks(3, 0.1, 1);
    expect(ticks).toHaveLength(31);
    expect(ticks.filter((t) => t.major)).toHaveLength(4);
    expect(ticks[0]).toEqual({ value: 0, major: true });
    expect(ticks[10]).toEqual({ value: 1, major: true });
    expect(ticks[1]).toEqual({ value: 0.1, major: false });
  });

  it('returns [] for invalid input', () => {
    expect(rulerTicks(0, 0.1, 1)).toEqual([]);
    expect(rulerTicks(5, 0, 1)).toEqual([]);
    expect(rulerTicks(5, 0.1, 0)).toEqual([]);
  });
});
