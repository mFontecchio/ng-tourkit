import { describe, expect, it } from 'vitest';

import { stageSvgPath } from './stage-path';

describe('stageSvgPath', () => {
  it('builds one outer viewport path and one rounded cutout subpath', () => {
    expect(stageSvgPath(800, 600, { x: 100, y: 80, width: 200, height: 120 }, 10, 12))
      .toBe('M0,0H800V600H0ZM102,70H298Q310,70 310,82V198Q310,210 298,210H102Q90,210 90,198V82Q90,70 102,70Z');
  });

  it('clamps radius to half the padded stage and floors it', () => {
    expect(stageSvgPath(100, 100, { x: 20, y: 20, width: 10, height: 6 }, 0, 99.8))
      .toBe('M0,0H100V100H0ZM23,20H27Q30,20 30,23V23Q30,26 27,26H23Q20,26 20,23V23Q20,20 23,20Z');
  });

  it('uses a square cutout when radius is negative', () => {
    expect(stageSvgPath(100, 100, { x: 10, y: 20, width: 30, height: 40 }, 5, -1))
      .toBe('M0,0H100V100H0ZM5,15H45V65H5Z');
  });

  it('returns only the full cover when stage is null', () => {
    expect(stageSvgPath(320, 240, null, 8, 8)).toBe('M0,0H320V240H0Z');
  });
});
