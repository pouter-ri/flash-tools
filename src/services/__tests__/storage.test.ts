jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: async (k: string): Promise<string | null> => (store.has(k) ? store.get(k)! : null),
      setItem: async (k: string, v: string): Promise<void> => {
        store.set(k, v);
      },
      removeItem: async (k: string): Promise<void> => {
        store.delete(k);
      },
      clear: async (): Promise<void> => {
        store.clear();
      },
    },
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadLastTab,
  saveLastTab,
  loadCalibration,
  saveCalibration,
  clampCalibration,
  loadRulerUnit,
  saveRulerUnit,
  isSteelUnlocked,
  unlockSteel,
  loadTheme,
  saveTheme,
} from '../storage';

beforeEach(async () => {
  await (AsyncStorage as any).clear();
});

describe('persisted app state round-trip', () => {
  it('remembers the last tool tab across restarts', async () => {
    expect(await loadLastTab()).toBeNull();
    await saveLastTab('Ruler');
    expect(await loadLastTab()).toBe('Ruler');
    await saveLastTab('Level');
    expect(await loadLastTab()).toBe('Level');
  });

  it('persists the ruler calibration offset, clamped', async () => {
    expect(await loadCalibration()).toBe(0);
    await saveCalibration(12);
    expect(await loadCalibration()).toBe(12);
    await saveCalibration(-7);
    expect(await loadCalibration()).toBe(-7);
    await saveCalibration(999);
    expect(await loadCalibration()).toBe(40);
    expect(clampCalibration(NaN)).toBe(0);
  });

  it('persists ruler unit, steel unlock, and theme mode', async () => {
    expect(await loadRulerUnit()).toBe('cm');
    await saveRulerUnit('inch');
    expect(await loadRulerUnit()).toBe('inch');

    expect(await isSteelUnlocked()).toBe(false);
    await unlockSteel();
    expect(await isSteelUnlocked()).toBe(true);

    expect(await loadTheme()).toBe('dark');
    await saveTheme('light');
    expect(await loadTheme()).toBe('light');
  });
});
