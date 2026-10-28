import { requireNativeModule } from 'expo-modules-core';

export interface ExactDpi {
  xdpi: number;
  ydpi: number;
  density: number;
}

function isSaneDpi(v: unknown): v is number {
  // Real phone panels live roughly between 120 and 800 dpi.
  return typeof v === 'number' && Number.isFinite(v) && v >= 120 && v <= 800;
}

/**
 * The panel's true physical DPI from DisplayMetrics.xdpi/ydpi (Android).
 * This is exact — unlike the PixelRatio density bucket — so the ruler needs
 * no manual calibration. Returns null when the native module is unavailable
 * (Expo Go, iOS, bad values); callers fall back to density * 160.
 */
export async function getExactDpi(): Promise<ExactDpi | null> {
  try {
    const mod = requireNativeModule('ScreenMetrics');
    const raw = await mod.getExactDpi();
    const xdpi = Number(raw?.xdpi);
    const ydpi = Number(raw?.ydpi);
    const density = Number(raw?.density);
    if (!isSaneDpi(xdpi) || !isSaneDpi(ydpi)) return null;
    return {
      xdpi,
      ydpi,
      density: typeof density === 'number' && Number.isFinite(density) && density > 0 ? density : 1,
    };
  } catch (e) {
    return null;
  }
}
