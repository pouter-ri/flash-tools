jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

import {
  shouldTriggerInterstitial,
  cooldownElapsed,
  tryShowAd,
  RANDOM_MIN_DELAY_MS,
  RANDOM_MAX_DELAY_MS,
} from '../ads';

describe('shouldTriggerInterstitial', () => {
  it('fires on every 3rd tool open', () => {
    expect(shouldTriggerInterstitial(1)).toBe(false);
    expect(shouldTriggerInterstitial(2)).toBe(false);
    expect(shouldTriggerInterstitial(3)).toBe(true);
    expect(shouldTriggerInterstitial(6)).toBe(true);
    expect(shouldTriggerInterstitial(7)).toBe(false);
  });

  it('rejects non-positive or invalid counts', () => {
    expect(shouldTriggerInterstitial(0)).toBe(false);
    expect(shouldTriggerInterstitial(-3)).toBe(false);
    expect(shouldTriggerInterstitial(NaN)).toBe(false);
  });
});

describe('cooldownElapsed', () => {
  it('allows the first-ever ad (no previous show)', () => {
    expect(cooldownElapsed(0, Date.now())).toBe(true);
  });

  it('blocks inside the cooldown window and allows after it', () => {
    const now = 1_000_000;
    expect(cooldownElapsed(now - 10_000, now, 90_000)).toBe(false);
    expect(cooldownElapsed(now - 90_000, now, 90_000)).toBe(true);
    expect(cooldownElapsed(now - 200_000, now, 90_000)).toBe(true);
  });
});

describe('tryShowAd (shared-contract shape)', () => {
  it('exposes the random-delay constants', () => {
    expect(RANDOM_MIN_DELAY_MS).toBe(45000);
    expect(RANDOM_MAX_DELAY_MS).toBe(120000);
  });

  it('no-ops without a loaded ad ref', async () => {
    expect(await tryShowAd({ current: null } as any)).toEqual({ shown: false, reason: 'no_ref' });
    expect(await tryShowAd({ current: {} } as any)).toEqual({ shown: false, reason: 'no_ref' });
  });

  it('no-ops while an ad is already showing', async () => {
    const ref = { current: { showInterstitial: jest.fn(), getStatus: () => 'showing' } };
    expect(await tryShowAd(ref as any)).toEqual({ shown: false, reason: 'already_showing' });
    expect(ref.current.showInterstitial).not.toHaveBeenCalled();
  });

  it('prefers the showIfLoaded alias when present', async () => {
    const showIfLoaded = jest.fn().mockResolvedValue({ shown: true });
    const ref = { current: { showIfLoaded, showInterstitial: jest.fn(), getStatus: () => 'idle' } };
    const res = await tryShowAd(ref as any);
    expect(res.shown).toBe(true);
    expect(showIfLoaded).toHaveBeenCalled();
  });
});
