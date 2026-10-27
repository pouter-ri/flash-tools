# RELEASE.md — Flash Tools

## What this is

FLASH-TOOLS v1.0.0: a toolbox app (Home hub + Flashlight, Compass, Ruler,
Bubble Level). New directory `flash-tools/`; no other app was touched.

## Needs you (cannot ship without these)

1. **AdMob — replace sample IDs.** `app.json` uses Google's *sample* app IDs
   (`ca-app-pub-3940256099942544~…` on both platforms) and all three formats
   (app-open, interstitial, rewarded) fall back to `TestIds` unless these env
   vars are set. Before release: create real AdMob app + ad units, put the
   Android app ID in `app.json`, and set:
   - `EXPO_PUBLIC_ADMOB_APPOPEN_ANDROID`
   - `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID`
   - `EXPO_PUBLIC_ADMOB_REWARDED_ANDROID`
   Add + wire an iOS unit in `src/components/AdMobManager.tsx` (iOS always
   uses `TestIds` today). Until then the app only ever shows test ads.
2. **Release build.** Run `eas build` and smoke-test on a real device:
   Home → open each tool (interstitial fires on every 3rd tool open) →
   flashlight torch toggles → compass heading moves → ruler cm/inch toggle →
   watch rewarded ad → steel theme unlocks and persists after restart.
   Ruler scale is DPI-based and approximate — verify against a physical ruler
   on your target device before advertising accuracy.
3. **Camera permission copy.** The flashlight requests camera access for the
   torch (falls back to white-screen light when denied). Confirm the Play
   listing declares flashlight use.

## Verification (this machine)

- `npx tsc --noEmit` — clean.
- `npx jest` — 6 suites, 42 tests pass (compass, level, ruler,
  adsFrequency incl. `tryShowAd` shape, navigation stack wiring, storage
  round-trip incl. last tab + ruler calibration).
- `npx expo export --platform android` — Hermes bundle builds clean
  (`dist/_expo/static/js/android/*.hbc`).
- QA fixes applied: `LIGHT.textMuted` darkened `#9aa0b2` → `#6b7280`
  (2.48:1 → 4.59:1 on bg); `ELEVATION` token added to
  `src/theme/colors.ts`; `services/ads.ts` exposes `tryShowAd` +
  `RANDOM_MIN/MAX_DELAY_MS` and the ad handle exposes `showIfLoaded`;
  `src/nav.ts` + navigation wiring test (every route mounts, stack
  semantics); last tool tab + ruler calibration offset (±40 px/in stepper)
  persist via `services/storage.ts` (all AsyncStorage routed through it);
  back button / unit toggle / calibration steppers ≥ 44dp touch targets.
  `expo-font` unused → not installed. Ads on `TestIds`; `.env` holds empty
  contract keys and is gitignored.

## Device re-verify (2026-10-16, emulator-5554)

- Fixed ruler rendering a ~12px sliver: RulerScreen passed raw PixelRatio.get() (~2.6) as DPI; now ratio x 160. Regression test in ruler.test.ts. Verified full-width cm blade on device.
- Drove on device: home, flashlight ON with screen-light fallback, compass, ruler, bubble level (live 85.3-degree reading). Gates: tsc clean, 43/43 jest.

