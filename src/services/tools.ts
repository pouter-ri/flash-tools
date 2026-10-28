// Pure, UI-free math for the four tools. Every function here is deterministic
// and covered by jest tests in __tests__/.

export interface MagnetometerReading {
  x: number;
  y: number;
  z: number;
}

/** Heading in degrees, 0..360, where 0 = magnetic north. */
export function headingFromMagnetometer(reading: MagnetometerReading): number {
  const { x, y } = reading;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  if (x === 0 && y === 0) return 0;
  // Standard compass mapping: heading = atan2(east, north), where the -y
  // magnetometer axis reads as north when the phone is held portrait.
  const deg = (Math.atan2(x, -y) * 180) / Math.PI;
  const normalized = ((deg % 360) + 360) % 360;
  return Math.round(normalized * 10) / 10;
}

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export type Cardinal = (typeof CARDINALS)[number];

/** 8-wind compass point for a heading in degrees. */
export function cardinalFromHeading(heading: number): Cardinal {
  const normalized = ((heading % 360) + 360) % 360;
  const index = Math.round(normalized / 45) % 8;
  return CARDINALS[index];
}

export interface AccelerometerReading {
  x: number;
  y: number;
  z: number;
}

export interface Tilt {
  /** Left-right tilt in degrees, -90..90. 0 = flat. */
  pitch: number;
  /** Forward-back tilt in degrees, -90..90. 0 = flat. */
  roll: number;
  /** Total deviation from perfectly flat, in degrees, 0..90. */
  deviation: number;
}

/** Pitch/roll/deviation from an accelerometer reading (units of g). */
export function tiltFromAccelerometer(reading: AccelerometerReading): Tilt {
  const { x, y, z } = reading;
  if (![x, y, z].every(Number.isFinite)) return { pitch: 0, roll: 0, deviation: 0 };
  const norm = Math.sqrt(x * x + y * y + z * z);
  if (norm === 0) return { pitch: 0, roll: 0, deviation: 0 };
  const nx = x / norm;
  const ny = y / norm;
  const nz = z / norm;
  const pitch = (Math.asin(clamp(nx, -1, 1)) * 180) / Math.PI;
  const roll = (Math.asin(clamp(ny, -1, 1)) * 180) / Math.PI;
  const deviation = (Math.acos(clamp(Math.abs(nz), -1, 1)) * 180) / Math.PI;
  return {
    pitch: round1(pitch),
    roll: round1(roll),
    deviation: round1(deviation),
  };
}

/** True when the surface counts as flat within the given tolerance. */
export function isLevel(tilt: Tilt, toleranceDeg: number = 1.5): boolean {
  return tilt.deviation <= toleranceDeg;
}

/** Pixels per centimeter for the current screen. dpi defaults to ~160 mdpi. */
export function pxPerCm(dpi: number | null | undefined): number {
  const safe = typeof dpi === 'number' && Number.isFinite(dpi) && dpi > 0 ? dpi : 160;
  return safe / 2.54;
}

/** Pixel length of a ruler of `units` (cm or inches) on this screen. */
export function rulerPx(units: number, unit: 'cm' | 'inch', dpi?: number | null): number {
  const cm = unit === 'cm' ? units : units * 2.54;
  return cm * pxPerCm(dpi);
}

/**
 * Layout length (density-independent pixels) for a ruler of `units`.
 * rulerPx() is physical pixels — React Native styles need dp, so divide by
 * the PixelRatio density. Passing raw physical px into styles inflates the
 * blade by density× (2.6× on a 2.625 device).
 */
export function rulerDp(
  units: number,
  unit: 'cm' | 'inch',
  dpi?: number | null,
  density?: number | null,
): number {
  const d = typeof density === 'number' && Number.isFinite(density) && density > 0 ? density : 1;
  return rulerPx(units, unit, dpi) / d;
}

/** Tick marks for a ruler: every `minorStep` units, labeled every `majorStep`. */
export interface RulerTick {
  value: number;
  major: boolean;
}

export function rulerTicks(lengthUnits: number, minorStep: number, majorStep: number): RulerTick[] {
  if (lengthUnits <= 0 || minorStep <= 0 || majorStep <= 0) return [];
  const ticks: RulerTick[] = [];
  const count = Math.floor(lengthUnits / minorStep);
  for (let i = 0; i <= count; i += 1) {
    const value = round1(i * minorStep);
    const major = Math.abs(value / majorStep - Math.round(value / majorStep)) < 1e-9;
    ticks.push({ value, major });
  }
  return ticks;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
