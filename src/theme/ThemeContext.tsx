import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { loadTheme as storeLoadTheme, saveTheme as storeSaveTheme } from '../services/storage';
import { COLORS, applyTheme, type Palette } from './colors';

type Mode = 'dark' | 'light';

interface ThemeCtx {
  mode: Mode;
  isDark: boolean;
  colors: Palette;
  setMode: (m: Mode) => void;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({
  mode: 'dark',
  isDark: true,
  colors: { ...COLORS },
  setMode: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>('dark');
  // A toggle tapped before the stored theme finishes loading must win;
  // the late load must not clobber the user's choice back.
  const userSet = useRef(false);

  useEffect(() => {
    let active = true;
    storeLoadTheme()
      .then((m) => {
        if (!active || userSet.current) return;
        applyTheme(m);
        setModeState(m);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setMode = useCallback((m: Mode) => {
    userSet.current = true;
    applyTheme(m);
    setModeState(m);
    storeSaveTheme(m).catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next: Mode = prev === 'dark' ? 'light' : 'dark';
      userSet.current = true;
      applyTheme(next);
      storeSaveTheme(next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<ThemeCtx>(
    () => ({ mode, isDark: mode === 'dark', colors: COLORS, setMode, toggle }),
    [mode, setMode, toggle],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeCtx {
  return useContext(Ctx);
}
