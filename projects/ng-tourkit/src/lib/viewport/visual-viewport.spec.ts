import { afterEach, describe, expect, it, vi } from 'vitest';
import { getViewportRect, listenToViewportChanges } from './visual-viewport';

describe('visual-viewport helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads visualViewport dimensions and offsets when available', () => {
    vi.stubGlobal('visualViewport', {
      width: 320,
      height: 480,
      offsetLeft: 12,
      offsetTop: 24,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    expect(getViewportRect()).toEqual({
      width: 320,
      height: 480,
      offsetLeft: 12,
      offsetTop: 24,
    });
  });

  it('falls back to innerWidth/innerHeight when visualViewport is missing', () => {
    vi.stubGlobal('visualViewport', undefined);
    vi.stubGlobal('innerWidth', 1024);
    vi.stubGlobal('innerHeight', 768);

    expect(getViewportRect()).toEqual({
      width: 1024,
      height: 768,
      offsetLeft: 0,
      offsetTop: 0,
    });
  });

  it('registers and removes listeners on window and visualViewport', () => {
    const vv = {
      width: 300,
      height: 500,
      offsetLeft: 0,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const addEventListener = vi.spyOn(globalThis, 'addEventListener');
    const removeEventListener = vi.spyOn(globalThis, 'removeEventListener');
    vi.stubGlobal('visualViewport', vv);

    const callback = vi.fn();
    const stop = listenToViewportChanges(callback);

    expect(addEventListener).toHaveBeenCalledWith('resize', callback, { passive: true });
    expect(addEventListener).toHaveBeenCalledWith('scroll', callback, { passive: true });
    expect(vv.addEventListener).toHaveBeenCalledWith('resize', callback, { passive: true });
    expect(vv.addEventListener).toHaveBeenCalledWith('scroll', callback, { passive: true });

    stop();

    expect(removeEventListener).toHaveBeenCalledWith('resize', callback);
    expect(removeEventListener).toHaveBeenCalledWith('scroll', callback);
    expect(vv.removeEventListener).toHaveBeenCalledWith('resize', callback);
    expect(vv.removeEventListener).toHaveBeenCalledWith('scroll', callback);
  });
});
