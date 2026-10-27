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

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { LIGHT, DARK, applyTheme } from '../colors';
import { THEME_KEY, getItem } from '../../services/storage';

let seen: { mode: string; colors: typeof DARK; toggle: () => void } | null = null;

function Probe() {
  const ctx = useTheme();
  seen = { mode: ctx.mode, colors: ctx.colors, toggle: ctx.toggle };
  return null;
}

async function mount(): Promise<TestRenderer.ReactTestRenderer> {
  seen = null;
  let root!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    root = TestRenderer.create(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    await Promise.resolve();
  });
  return root;
}

beforeEach(async () => {
  await (AsyncStorage as any).clear();
  applyTheme('dark');
});

afterEach(() => {
  applyTheme('dark');
});

describe('ThemeProvider toggle (light mode switcher)', () => {
  it('starts dark and flips to the LIGHT palette on one toggle', async () => {
    await mount();
    expect(seen!.mode).toBe('dark');
    expect(seen!.colors.bg).toBe(DARK.bg);

    await act(async () => {
      seen!.toggle();
      await Promise.resolve();
    });

    expect(seen!.mode).toBe('light');
    expect(seen!.colors.bg).toBe(LIGHT.bg);
    expect(seen!.colors.text).toBe(LIGHT.text);
  });

  it('persists the choice so a relaunch restores light mode', async () => {
    await mount();
    await act(async () => {
      seen!.toggle();
      await Promise.resolve();
    });
    expect(await getItem(THEME_KEY)).toBe('light');
  });

  it('two rapid toggles end back where they started (no swallowed tap)', async () => {
    await mount();
    expect(seen!.mode).toBe('dark');

    // Two taps in the same tick: a stale-closure toggle would apply
    // "dark -> light" twice and get stuck on light.
    await act(async () => {
      seen!.toggle();
      seen!.toggle();
      await Promise.resolve();
    });

    expect(seen!.mode).toBe('dark');
    expect(seen!.colors.bg).toBe(DARK.bg);
  });
});
