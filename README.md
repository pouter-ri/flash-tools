# Flash Tools

Everyday toolbox: flashlight (camera torch + screen-light fallback), compass
(magnetometer), on-screen ruler (cm/inch, premium steel theme via rewarded ad),
and bubble level (accelerometer). Expo SDK 57, TypeScript, custom stack nav,
dark/light theme tokens, AdMob TestIds, AsyncStorage, EN i18n, jest.

## Run

```sh
npm install
npx expo start
```

## Verify

```sh
npx tsc --noEmit
npx jest
npx expo export --platform android
```

See [RELEASE.md](./RELEASE.md) for release blockers.
