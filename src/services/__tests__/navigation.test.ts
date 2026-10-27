import * as fs from 'fs';
import * as path from 'path';
import {
  ROUTES,
  TOOL_ROUTES,
  screenForRoute,
  stackPush,
  stackReplace,
  stackPop,
  stackReset,
} from '../../nav';

describe('navigation stack wiring', () => {
  it('mounts a screen for every route', () => {
    expect(ROUTES).toEqual(['Home', 'Flashlight', 'Compass', 'Ruler', 'Level']);
    for (const route of ROUTES) {
      // Fails when a new tool route is added but never wired into App.tsx.
      expect(screenForRoute(route)).toBe(route);
    }
  });

  it('rejects unknown routes', () => {
    expect(screenForRoute('Nope')).toBeNull();
    expect(screenForRoute('')).toBeNull();
  });

  it('covers every tool from the home hub', () => {
    expect(TOOL_ROUTES).toEqual(['Flashlight', 'Compass', 'Ruler', 'Level']);
    for (const tool of TOOL_ROUTES) {
      expect(ROUTES).toContain(tool);
      expect(screenForRoute(tool)).not.toBeNull();
    }
  });

  it('push / replace / pop / reset follow stack semantics', () => {
    const home = [{ name: 'Home', params: {} }];
    const pushed = stackPush(home, 'Ruler');
    expect(pushed).toHaveLength(2);
    expect(pushed[1]).toEqual({ name: 'Ruler', params: {} });
    // Original stack untouched.
    expect(home).toHaveLength(1);

    expect(stackReplace(pushed, 'Level')).toEqual([
      { name: 'Home', params: {} },
      { name: 'Level', params: {} },
    ]);
    expect(stackReplace([], 'Home')).toEqual([{ name: 'Home', params: {} }]);

    expect(stackPop(pushed)).toEqual(home);
    // Popping the root is a no-op (matches Android back behavior).
    expect(stackPop(home)).toEqual(home);

    expect(stackReset('Compass')).toEqual([{ name: 'Compass', params: {} }]);
  });
});

describe('app launch always lands on the main menu', () => {
  const root = path.resolve(__dirname, '..', '..', '..');
  const appSrc = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');

  it('seeds the stack with Home only', () => {
    expect(appSrc).toContain("useState<NavFrame[]>([{ name: 'Home', params: {} }])");
  });

  it('never restores the last tool tab on launch', () => {
    expect(appSrc).not.toContain('loadLastTab');
    expect(appSrc).not.toContain('saveLastTab');
  });
});
