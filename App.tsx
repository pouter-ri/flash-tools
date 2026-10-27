import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen, { type ToolRoute } from './src/screens/HomeScreen';
import FlashlightScreen from './src/screens/FlashlightScreen';
import CompassScreen from './src/screens/CompassScreen';
import RulerScreen from './src/screens/RulerScreen';
import LevelScreen from './src/screens/LevelScreen';
import AdMobManager, { type AdHandle } from './src/components/AdMobManager';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { loadLocale } from './src/services/i18n';
import { recordToolOpen, shouldShowInterstitialNow, markInterstitialShown } from './src/services/ads';
import {
  ROUTES,
  screenForRoute,
  stackPush,
  stackReplace,
  stackPop,
  stackReset,
  type NavApi,
  type NavFrame,
  type NavParams,
  type Route,
} from './src/nav';

export type { NavApi, NavFrame, NavParams, Route };
export { ROUTES, screenForRoute };

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { colors } = useTheme();
  const adRef = useRef<AdHandle | null>(null);
  // Always start at the main menu — never deep-link into the last tool.
  const [stack, setStack] = useState<NavFrame[]>([{ name: 'Home', params: {} }]);
  const top = stack[stack.length - 1].name as Route;

  useEffect(() => {
    loadLocale();
  }, []);

  // App-open ad on launch (once, shortly after start).
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        adRef.current?.showAppOpen();
      } catch (e) {}
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const navigate: NavApi['navigate'] = useCallback((name, params = {}) => {
    const route = screenForRoute(name);
    if (!route) return;
    setStack((s) => stackPush(s, route, params));
    // Interstitial every 3rd tool open, frequency-capped. Fire-and-forget.
    (async () => {
      try {
        const count = await recordToolOpen();
        void count;
        const eligible = await shouldShowInterstitialNow();
        if (!eligible) return;
        const res = await adRef.current?.showInterstitial();
        if (res?.shown) await markInterstitialShown();
      } catch (e) {}
    })();
  }, []);

  const replace: NavApi['replace'] = useCallback((name, params = {}) => {
    const route = screenForRoute(name);
    if (!route) return;
    setStack((s) => stackReplace(s, route, params));
  }, []);

  const goBack: NavApi['goBack'] = useCallback(() => {
    setStack((s) => stackPop(s));
  }, []);

  const resetTo: NavApi['resetTo'] = useCallback((name, params = {}) => {
    const route = screenForRoute(name);
    if (!route) return;
    setStack(stackReset(route, params));
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) {
        goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, goBack]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={colors.statusBar} />
      <AdMobManager ref={adRef} />
      {top === 'Home' ? <HomeScreen navigate={navigate as (name: ToolRoute) => void} /> : null}
      {top === 'Flashlight' ? <FlashlightScreen goBack={goBack} /> : null}
      {top === 'Compass' ? <CompassScreen goBack={goBack} /> : null}
      {top === 'Ruler' ? <RulerScreen goBack={goBack} ads={adRef} /> : null}
      {top === 'Level' ? <LevelScreen goBack={goBack} /> : null}
    </SafeAreaView>
  );
}

const styles = {
  root: {
    flex: 1,
  },
} as const;
