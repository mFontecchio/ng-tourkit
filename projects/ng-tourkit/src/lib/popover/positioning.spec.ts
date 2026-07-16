import { describe, expect, it } from 'vitest';

import { computePopoverPosition } from './positioning';

const viewport = { width: 500, height: 400 };
const popoverSize = { width: 120, height: 80 };

describe('computePopoverPosition', () => {
  it('honors the preferred side when it fits', () => {
    const result = computePopoverPosition({
      targetRect: { x: 200, y: 200, width: 50, height: 30 },
      popoverSize,
      viewport,
      side: 'top',
      align: 'center',
      gap: 10,
    });

    expect(result).toEqual({
      top: 110,
      left: 165,
      actualSide: 'top',
      arrow: { side: 'bottom', offset: 60 },
    });
  });

  it('flips to the opposite side when preferred side has no room', () => {
    const result = computePopoverPosition({
      targetRect: { x: 200, y: 12, width: 50, height: 30 },
      popoverSize,
      viewport,
      side: 'top',
      align: 'center',
      gap: 10,
    });

    expect(result.actualSide).toBe('bottom');
    expect(result.top).toBe(52);
    expect(result.arrow).toEqual({ side: 'top', offset: 60 });
  });

  it('chooses the side with maximum space when neither preferred nor opposite fit', () => {
    const result = computePopoverPosition({
      targetRect: { x: 210, y: 170, width: 80, height: 60 },
      popoverSize: { width: 300, height: 260 },
      viewport,
      side: 'left',
      align: 'center',
    });

    expect(result.actualSide).toBe('right');
  });

  it('clamps positions at viewport edges', () => {
    const result = computePopoverPosition({
      targetRect: { x: 0, y: 220, width: 20, height: 20 },
      popoverSize,
      viewport,
      side: 'bottom',
      align: 'start',
      padding: 10,
    });

    expect(result.left).toBe(10);
    expect(result.top).toBe(250);
  });

  it('centers modal popovers when target is null', () => {
    expect(computePopoverPosition({
      targetRect: null,
      popoverSize: { width: 100, height: 50 },
      viewport,
      side: 'bottom',
      align: 'center',
    })).toEqual({
      top: 175,
      left: 200,
      actualSide: 'over',
      arrow: null,
    });
  });

  it('centers popovers when side is over even with a target', () => {
    expect(computePopoverPosition({
      targetRect: { x: 10, y: 10, width: 20, height: 20 },
      popoverSize: { width: 100, height: 50 },
      viewport,
      side: 'over',
      align: 'start',
    }).arrow).toBeNull();
  });

  it('supports start and end alignment on the secondary axis', () => {
    const targetRect = { x: 200, y: 180, width: 50, height: 30 };

    expect(computePopoverPosition({
      targetRect,
      popoverSize,
      viewport,
      side: 'bottom',
      align: 'start',
    }).left).toBe(200);

    expect(computePopoverPosition({
      targetRect,
      popoverSize,
      viewport,
      side: 'bottom',
      align: 'end',
    }).left).toBe(130);
  });

  it('clamps horizontal arrow offset inside popover bounds', () => {
    const result = computePopoverPosition({
      targetRect: { x: 0, y: 100, width: 20, height: 20 },
      popoverSize,
      viewport,
      side: 'bottom',
      align: 'end',
      padding: 10,
    });

    expect(result.left).toBe(10);
    expect(result.arrow).toEqual({ side: 'top', offset: 12 });
  });

  it('clamps vertical arrow offset inside popover bounds', () => {
    const result = computePopoverPosition({
      targetRect: { x: 180, y: 0, width: 20, height: 20 },
      popoverSize,
      viewport,
      side: 'right',
      align: 'end',
      padding: 10,
    });

    expect(result.arrow).toEqual({ side: 'left', offset: 12 });
  });
});

