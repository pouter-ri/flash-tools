import { pxPerCm, rulerPx, rulerTicks } from '../tools';

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
