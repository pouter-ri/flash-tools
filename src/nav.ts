// Pure navigation model for flash-tools (no RN imports — safe for node jest).
// App.tsx drives its stack state through these helpers so the wiring test can
// assert every route mounts without a renderer.

export type Route = 'Home' | 'Flashlight' | 'Compass' | 'Ruler' | 'Level';

export interface NavFrame {
  name: string;
  params: NavParams;
}

export interface NavParams {
  [key: string]: string | number | boolean | undefined;
}

export interface NavApi {
  navigate: (name: string, params?: NavParams) => void;
  replace: (name: string, params?: NavParams) => void;
  goBack: () => void;
  resetTo: (name: string, params?: NavParams) => void;
}

/** Every route the stack switch in App.tsx must mount. */
export const ROUTES: Route[] = ['Home', 'Flashlight', 'Compass', 'Ruler', 'Level'];

export const TOOL_ROUTES: Route[] = ['Flashlight', 'Compass', 'Ruler', 'Level'];

/**
 * Maps a route to the screen it mounts. Returns null for unknown routes.
 * Keep in sync with the stack switch in App.tsx — the navigation test fails
 * if a ROUTES entry is missing here.
 */
export function screenForRoute(name: string): Route | null {
  return (ROUTES as string[]).includes(name) ? (name as Route) : null;
}

export function stackPush(stack: NavFrame[], name: string, params: NavParams = {}): NavFrame[] {
  return [...stack, { name, params }];
}

export function stackReplace(stack: NavFrame[], name: string, params: NavParams = {}): NavFrame[] {
  if (stack.length === 0) return [{ name, params }];
  return [...stack.slice(0, -1), { name, params }];
}

export function stackPop(stack: NavFrame[]): NavFrame[] {
  return stack.length > 1 ? stack.slice(0, -1) : stack;
}

export function stackReset(name: string, params: NavParams = {}): NavFrame[] {
  return [{ name, params }];
}
