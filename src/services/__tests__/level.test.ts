import { tiltFromAccelerometer, isLevel } from '../tools';

describe('tiltFromAccelerometer', () => {
  it('reports zero deviation when flat (gravity straight down +z)', () => {
    const tilt = tiltFromAccelerometer({ x: 0, y: 0, z: 1 });
    expect(tilt.pitch).toBe(0);
    expect(tilt.roll).toBe(0);
    expect(tilt.deviation).toBe(0);
  });

  it('reports ~90° deviation when held vertical', () => {
    const tilt = tiltFromAccelerometer({ x: 0, y: 1, z: 0 });
    expect(tilt.deviation).toBeCloseTo(90, 0);
    expect(tilt.roll).toBeCloseTo(90, 0);
  });

  it('normalizes readings so magnitude does not matter', () => {
    const a = tiltFromAccelerometer({ x: 0, y: 0, z: 1 });
    const b = tiltFromAccelerometer({ x: 0, y: 0, z: 9.81 });
    expect(a).toEqual(b);
  });

  it('returns zeros for zero / non-finite input', () => {
    expect(tiltFromAccelerometer({ x: 0, y: 0, z: 0 })).toEqual({ pitch: 0, roll: 0, deviation: 0 });
    expect(tiltFromAccelerometer({ x: NaN, y: 0, z: 1 })).toEqual({ pitch: 0, roll: 0, deviation: 0 });
  });
});

describe('isLevel', () => {
  it('is level within the default 1.5° tolerance', () => {
    expect(isLevel({ pitch: 0.5, roll: -0.5, deviation: 1 })).toBe(true);
    expect(isLevel({ pitch: 3, roll: 0, deviation: 3 })).toBe(false);
  });

  it('respects a custom tolerance', () => {
    const tilt = { pitch: 4, roll: 0, deviation: 4 };
    expect(isLevel(tilt, 5)).toBe(true);
    expect(isLevel(tilt, 3)).toBe(false);
  });
});
