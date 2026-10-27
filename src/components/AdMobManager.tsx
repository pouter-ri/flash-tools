import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Platform } from 'react-native';
import mobileAds, {
  AppOpenAd,
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
  AdsConsent,
} from 'react-native-google-mobile-ads';

const ANDROID_APP_OPEN = process.env.EXPO_PUBLIC_ADMOB_APPOPEN_ANDROID || TestIds.APP_OPEN;
const ANDROID_INTERSTITIAL = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID || TestIds.INTERSTITIAL;
const ANDROID_REWARDED = process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID || TestIds.REWARDED;

const APP_OPEN_UNIT_ID = Platform.OS === 'ios' ? TestIds.APP_OPEN : ANDROID_APP_OPEN;
const INTERSTITIAL_UNIT_ID = Platform.OS === 'ios' ? TestIds.INTERSTITIAL : ANDROID_INTERSTITIAL;
const REWARDED_UNIT_ID = Platform.OS === 'ios' ? TestIds.REWARDED : ANDROID_REWARDED;

export interface AdHandle {
  showAppOpen: () => Promise<{ shown: boolean; reason?: string }>;
  showInterstitial: () => Promise<{ shown: boolean; reason?: string }>;
  /** Shared-contract alias for the interstitial show. */
  showIfLoaded: () => Promise<{ shown: boolean; reason?: string }>;
  showRewarded: () => Promise<{ shown: boolean; earned: boolean; reason?: string }>;
  getStatus: () => string;
  isConsentBlocked: () => boolean;
}

function buildLoader(create: () => any, statusRef: React.MutableRefObject<string>, extra?: (ad: any, slots: any) => void) {
  let slots: any = null;
  const cleanup = () => {
    try {
      slots?.unsubLoaded?.();
      slots?.unsubClosed?.();
      slots?.unsubError?.();
      slots?.unsubOpened?.();
      slots?.unsubEarned?.();
    } catch (e) {}
    slots = null;
  };
  const build = () => {
    cleanup();
    try {
      const ad = create();
      const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
        statusRef.current = 'loaded';
      });
      const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
        statusRef.current = 'idle';
        try {
          ad.load();
        } catch (e) {}
      });
      const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
        statusRef.current = 'error';
        setTimeout(() => {
          try {
            ad.load();
          } catch (e) {}
        }, 30000);
      });
      const unsubOpened = ad.addAdEventListener(AdEventType.OPENED, () => {
        statusRef.current = 'showing';
      });
      slots = { ad, unsubLoaded, unsubClosed, unsubError, unsubOpened };
      extra?.(ad, slots);
      statusRef.current = 'loading';
      ad.load();
    } catch (e) {
      statusRef.current = 'error';
    }
  };
  return {
    build,
    cleanup,
    getAd: () => slots?.ad ?? null,
    setSlots: (s: any) => {
      slots = s;
    },
  };
}

const AdMobManager = forwardRef(function AdMobManager(_props: any, ref) {
  const statusRef = useRef('init');
  const consentBlockedRef = useRef(false);
  const presentedRef = useRef(false);

  const appOpenRef = useRef<ReturnType<typeof buildLoader> | null>(null);
  const interstitialRef = useRef<ReturnType<typeof buildLoader> | null>(null);
  const rewardedRef = useRef<ReturnType<typeof buildLoader> | null>(null);
  const rewardedEarnedRef = useRef(false);

  useEffect(() => {
    appOpenRef.current = buildLoader(
      () => AppOpenAd.createForAdRequest(APP_OPEN_UNIT_ID),
      statusRef,
    );
    interstitialRef.current = buildLoader(
      () => InterstitialAd.createForAdRequest(INTERSTITIAL_UNIT_ID, { requestNonPersonalizedAdsOnly: false }),
      statusRef,
    );
    rewardedRef.current = buildLoader(
      () => RewardedAd.createForAdRequest(REWARDED_UNIT_ID),
      statusRef,
      (ad, slots) => {
        try {
          const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
            rewardedEarnedRef.current = true;
          });
          slots.unsubEarned = unsubEarned;
        } catch (e) {}
      },
    );
    let mounted = true;
    (async () => {
      try {
        await mobileAds().initialize();
      } catch (e) {}
      try {
        await AdsConsent.gatherConsent();
        const info: any = await AdsConsent.getConsentInfo();
        consentBlockedRef.current = info?.status === 'REQUIRED' || info?.canRequestAds === false;
      } catch (e) {
        consentBlockedRef.current = false;
      }
      if (!mounted) return;
      try {
        appOpenRef.current?.build();
        interstitialRef.current?.build();
        rewardedRef.current?.build();
      } catch (e) {}
    })();
    return () => {
      mounted = false;
      appOpenRef.current?.cleanup();
      interstitialRef.current?.cleanup();
      rewardedRef.current?.cleanup();
    };
  }, []);

  const guard = useCallback((): { ok: boolean; reason?: string } => {
    if (consentBlockedRef.current) return { ok: false, reason: 'consent_required' };
    if (presentedRef.current) return { ok: false, reason: 'already_showing' };
    return { ok: true };
  }, []);

  const showAppOpen = useCallback(async () => {
    const g = guard();
    if (!g.ok) return { shown: false, reason: g.reason };
    const ad = appOpenRef.current?.getAd();
    if (!ad) return { shown: false, reason: 'not_ready' };
    try {
      presentedRef.current = true;
      ad.show();
      return { shown: true };
    } catch (e) {
      return { shown: false, reason: 'show_failed' };
    } finally {
      setTimeout(() => {
        presentedRef.current = false;
      }, 1000);
    }
  }, [guard]);

  const showInterstitial = useCallback(async () => {
    const g = guard();
    if (!g.ok) return { shown: false, reason: g.reason };
    const ad = interstitialRef.current?.getAd();
    if (!ad) return { shown: false, reason: 'not_ready' };
    try {
      presentedRef.current = true;
      ad.show();
      return { shown: true };
    } catch (e) {
      return { shown: false, reason: 'show_failed' };
    } finally {
      setTimeout(() => {
        presentedRef.current = false;
      }, 1000);
    }
  }, [guard]);

  const showRewarded = useCallback(async () => {
    const g = guard();
    if (!g.ok) return { shown: false, earned: false, reason: g.reason };
    const ad = rewardedRef.current?.getAd();
    if (!ad) return { shown: false, earned: false, reason: 'not_ready' };
    rewardedEarnedRef.current = false;
    try {
      presentedRef.current = true;
      ad.show();
      // The EARNED_REWARD event fires before CLOSED; poll briefly so the
      // caller learns whether the user completed the ad.
      const earned = await new Promise<boolean>((resolve) => {
        const deadline = Date.now() + 120000;
        const tick = () => {
          if (rewardedEarnedRef.current) return resolve(true);
          if (Date.now() > deadline) return resolve(false);
          setTimeout(tick, 500);
        };
        tick();
      });
      return { shown: true, earned };
    } catch (e) {
      return { shown: false, earned: false, reason: 'show_failed' };
    } finally {
      setTimeout(() => {
        presentedRef.current = false;
      }, 1000);
    }
  }, [guard]);

  useImperativeHandle(
    ref,
    (): AdHandle => ({
      showAppOpen,
      showInterstitial,
      showIfLoaded: showInterstitial,
      showRewarded,
      getStatus: () => statusRef.current,
      isConsentBlocked: () => consentBlockedRef.current,
    }),
    [showAppOpen, showInterstitial, showRewarded],
  );

  return null;
});

export default AdMobManager;
