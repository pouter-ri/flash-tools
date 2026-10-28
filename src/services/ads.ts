import type React from 'react';
import {
  TOOL_OPEN_COUNT_KEY,
  LAST_INTERSTITIAL_KEY,
  getInt,
  setInt,
  getItem,
} from './storage';

// Interstitial policy: show at most every 3rd tool open, and no more than
// once per cooldown window (frequency cap).

export { TOOL_OPEN_COUNT_KEY, LAST_INTERSTITIAL_KEY };

export const INTERSTITIAL_EVERY_N_OPENS = 3;
export const INTERSTITIAL_COOLDOWN_MS = 90 * 1000;

/** Pure policy: is this tool-open count an interstitial trigger? */
export function shouldTriggerInterstitial(openCount: number, everyN: number = INTERSTITIAL_EVERY_N_OPENS): boolean {
  if (!Number.isFinite(openCount) || openCount <= 0) return false;
  if (!Number.isFinite(everyN) || everyN <= 0) return false;
  return openCount % everyN === 0;
}

/** Pure policy: has the frequency-cap cooldown elapsed? */
export function cooldownElapsed(lastShownAtMs: number, nowMs: number, cooldownMs: number = INTERSTITIAL_COOLDOWN_MS): boolean {
  if (!Number.isFinite(lastShownAtMs) || lastShownAtMs <= 0) return true;
  if (!Number.isFinite(nowMs)) return false;
  return nowMs - lastShownAtMs >= cooldownMs;
}

export async function recordToolOpen(): Promise<number> {
  const next = (await getInt(TOOL_OPEN_COUNT_KEY, 0)) + 1;
  const safe = Number.isFinite(next) && next > 0 ? next : 1;
  await setInt(TOOL_OPEN_COUNT_KEY, safe);
  return safe;
}

export async function getLastInterstitialAt(): Promise<number> {
  return getInt(LAST_INTERSTITIAL_KEY, 0);
}

export async function markInterstitialShown(nowMs: number = Date.now()): Promise<void> {
  await setInt(LAST_INTERSTITIAL_KEY, nowMs);
}

/** Combined gate used by App.tsx after each tool open. */
export async function shouldShowInterstitialNow(nowMs: number = Date.now()): Promise<boolean> {
  const raw = await getItem(TOOL_OPEN_COUNT_KEY);
  const count = raw ? parseInt(raw, 10) : 0;
  if (!shouldTriggerInterstitial(count)) return false;
  const last = await getLastInterstitialAt();
  return cooldownElapsed(last, nowMs);
}

export interface AdShowResult {
  shown: boolean;
  reason?: string;
}

// Shared-contract interstitial helper: fires ONLY at natural breaks (tool
// open cadence above), never on first paint, never mid-task. No-op while an
// ad is already showing; 90s cooldown between shows.
export const tryShowAd = async (
  adRef: React.MutableRefObject<any>,
): Promise<AdShowResult> => {
  const ref = adRef?.current;
  if (!ref || !ref.showInterstitial) return { shown: false, reason: 'no_ref' };
  if (ref.getStatus && ref.getStatus() === 'showing') return { shown: false, reason: 'already_showing' };
  if (ref.isConsentBlocked && ref.isConsentBlocked()) return { shown: false, reason: 'consent_required' };
  const now = Date.now();
  const last = await getLastInterstitialAt();
  if (!cooldownElapsed(last, now)) return { shown: false, reason: 'cooldown' };
  const show = ref.showIfLoaded ?? ref.showInterstitial;
  const result = await show.call(ref);
  if (result && result.shown) {
    await markInterstitialShown(now);
    return { shown: true };
  }
  return { shown: false, reason: result?.reason || 'not_loaded' };
};

export const RANDOM_MIN_DELAY_MS = 45000;
export const RANDOM_MAX_DELAY_MS = 120000;

/**
 * Resolve a banner unit id: real id from .env when set, Google test id
 * otherwise (dev builds keep showing test ads instead of crashing).
 */
export function resolveAdUnitId(envValue: string | undefined, testId: string): string {
  const id = (envValue ?? '').trim();
  return id.length > 0 ? id : testId;
}
