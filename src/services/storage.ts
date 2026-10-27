import AsyncStorage from '@react-native-async-storage/async-storage';

// Central AsyncStorage gateway for flash-tools. Every persisted feature goes
// through these helpers; no other module touches AsyncStorage directly.

export const THEME_KEY = '@flashtools:theme';
export const LAST_TAB_KEY = '@flashtools:last_tab';
export const RULER_UNIT_KEY = '@flashtools:ruler_unit';
export const RULER_CALIBRATION_KEY = '@flashtools:ruler_calibration';
export const PREMIUM_KEY = '@flashtools:premium_steel';
export const TOOL_OPEN_COUNT_KEY = '@flashtools:tool_opens';
export const LAST_INTERSTITIAL_KEY = '@flashtools:last_interstitial_at';
export const LOCALE_KEY = '@flashtools:locale';

export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {}
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {}
}

export async function getInt(key: string, fallback: number): Promise<number> {
  const raw = await getItem(key);
  const n = raw === null ? NaN : parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function setInt(key: string, value: number): Promise<void> {
  await setItem(key, String(value));
}

export async function getJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    return fallback;
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

export type ThemeMode = 'dark' | 'light';

export async function loadTheme(): Promise<ThemeMode> {
  const raw = await getItem(THEME_KEY);
  return raw === 'light' ? 'light' : 'dark';
}

export async function saveTheme(mode: ThemeMode): Promise<void> {
  await setItem(THEME_KEY, mode);
}

export type ToolTab = 'Flashlight' | 'Compass' | 'Ruler' | 'Level';

const TABS: ToolTab[] = ['Flashlight', 'Compass', 'Ruler', 'Level'];

export function isToolTab(v: string | null): v is ToolTab {
  return v !== null && (TABS as string[]).includes(v);
}

export async function loadLastTab(): Promise<ToolTab | null> {
  const raw = await getItem(LAST_TAB_KEY);
  return isToolTab(raw) ? raw : null;
}

export async function saveLastTab(tab: ToolTab): Promise<void> {
  await setItem(LAST_TAB_KEY, tab);
}

export type RulerUnit = 'cm' | 'inch';

export async function loadRulerUnit(): Promise<RulerUnit> {
  const raw = await getItem(RULER_UNIT_KEY);
  return raw === 'inch' ? 'inch' : 'cm';
}

export async function saveRulerUnit(unit: RulerUnit): Promise<void> {
  await setItem(RULER_UNIT_KEY, unit);
}

/** Ruler DPI calibration offset in px per inch, clamped to [-40, 40]. */
export const CALIBRATION_MIN = -40;
export const CALIBRATION_MAX = 40;

export function clampCalibration(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(CALIBRATION_MAX, Math.max(CALIBRATION_MIN, Math.round(v)));
}

export async function loadCalibration(): Promise<number> {
  return clampCalibration(await getInt(RULER_CALIBRATION_KEY, 0));
}

export async function saveCalibration(offsetPxPerInch: number): Promise<void> {
  await setInt(RULER_CALIBRATION_KEY, clampCalibration(offsetPxPerInch));
}

export async function isSteelUnlocked(): Promise<boolean> {
  return (await getItem(PREMIUM_KEY)) === '1';
}

export async function unlockSteel(): Promise<void> {
  await setItem(PREMIUM_KEY, '1');
}
