import { headingFromMagnetometer, cardinalFromHeading } from '../tools';

describe('headingFromMagnetometer', () => {
  it('maps +x axis to 90°', () => {
    expect(headingFromMagnetometer({ x: 1, y: 0, z: 0 })).toBe(90);
  });

  it('maps -y axis to north (0°)', () => {
    expect(headingFromMagnetometer({ x: 0, y: -1, z: 0 })).toBe(0);
  });

  it('returns 0 for a zero vector instead of NaN', () => {
    expect(headingFromMagnetometer({ x: 0, y: 0, z: 0 })).toBe(0);
  });

  it('returns 0 for non-finite input', () => {
    expect(headingFromMagnetometer({ x: NaN, y: 0, z: 0 })).toBe(0);
  });

  it('always normalizes into [0, 360)', () => {
    for (const [x, y] of [[1, 1], [-1, 1], [-1, -1], [1, -1], [0.3, -0.9]] as const) {
      const h = headingFromMagnetometer({ x, y, z: 0 });
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(360);
    }
  });
});

describe('cardinalFromHeading', () => {
  it.each([
    [0, 'N'],
    [20, 'N'],
    [45, 'NE'],
    [90, 'E'],
    [135, 'SE'],
    [180, 'S'],
    [225, 'SW'],
    [270, 'W'],
    [315, 'NW'],
    [359, 'N'],
  ])('maps %i° to %s', (heading, expected) => {
    expect(cardinalFromHeading(heading)).toBe(expected);
  });
});
