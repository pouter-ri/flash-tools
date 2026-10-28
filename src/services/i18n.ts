import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { LOCALE_KEY, getItem, setItem } from './storage';

import en from '../i18n/en.json';

export const KEY = {
  appName: 'appName',
  tagline: 'tagline',
  flashlight: 'flashlight',
  flashlightDesc: 'flashlightDesc',
  compass: 'compass',
  compassDesc: 'compassDesc',
  ruler: 'ruler',
  rulerDesc: 'rulerDesc',
  level: 'level',
  levelDesc: 'levelDesc',
  back: 'back',
  tapToTurnOn: 'tapToTurnOn',
  tapToTurnOff: 'tapToTurnOff',
  torchOn: 'torchOn',
  torchOff: 'torchOff',
  screenLightNote: 'screenLightNote',
  cameraPermissionNeeded: 'cameraPermissionNeeded',
  allowCamera: 'allowCamera',
  heading: 'heading',
  calibrating: 'calibrating',
  sensorUnavailable: 'sensorUnavailable',
  cm: 'cm',
  inch: 'inch',
  steelTheme: 'steelTheme',
  steelLocked: 'steelLocked',
  unlock: 'unlock',
  unlocked: 'unlocked',
  levelHint: 'levelHint',
  levelFlat: 'levelFlat',
  theme: 'theme',
  darkMode: 'darkMode',
  lightMode: 'lightMode',
  loading: 'loading',
  adLoading: 'adLoading',
  adNotReady: 'adNotReady',
  premiumThanks: 'premiumThanks',
} as const;

export type TranslationKey = (typeof KEY)[keyof typeof KEY];

const i18n = new I18n({ en } as unknown as Record<string, Record<string, string>>);
i18n.locale = 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export const setLocale = (code: string): void => {
  i18n.locale = code || 'en';
  setItem(LOCALE_KEY, i18n.locale).catch(() => {});
};

export const loadLocale = async (): Promise<string> => {
  try {
    const stored = await getItem(LOCALE_KEY);
    if (stored) {
      i18n.locale = stored;
      return stored;
    }
  } catch (e) {}
  try {
    const locales = Localization.getLocales();
    const tag = locales?.[0]?.languageTag || locales?.[0]?.languageCode || 'en';
    void tag;
  } catch (e) {}
  i18n.locale = 'en';
  return 'en';
};

export const getLocale = (): string => i18n.locale as string;

export const t = (key: TranslationKey): string => i18n.t(key);

export default i18n;
