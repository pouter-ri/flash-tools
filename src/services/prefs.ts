import {
  PREMIUM_KEY,
  RULER_UNIT_KEY,
  isSteelUnlocked as storeIsSteelUnlocked,
  unlockSteel as storeUnlockSteel,
  loadRulerUnit as storeLoadRulerUnit,
  saveRulerUnit as storeSaveRulerUnit,
  type RulerUnit,
} from './storage';

// Premium: the steel-ruler theme is unlocked by watching a rewarded ad.
// Backed by services/storage.ts (same keys as before).

export { PREMIUM_KEY, RULER_UNIT_KEY };
export type { RulerUnit };

export async function isSteelUnlocked(): Promise<boolean> {
  return storeIsSteelUnlocked();
}

export async function unlockSteel(): Promise<void> {
  return storeUnlockSteel();
}

export async function getRulerUnit(): Promise<RulerUnit> {
  return storeLoadRulerUnit();
}

export async function setRulerUnit(unit: RulerUnit): Promise<void> {
  return storeSaveRulerUnit(unit);
}
