export interface ViewportRect {
  readonly width: number;
  readonly height: number;
  readonly offsetLeft: number;
  readonly offsetTop: number;
}

type VisualViewportLike = {
  readonly width: number;
  readonly height: number;
  readonly offsetLeft: number;
  readonly offsetTop: number;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
};

function visualViewport(): VisualViewportLike | null {
  return (globalThis as { visualViewport?: VisualViewportLike | null }).visualViewport ?? null;
}

/** Returns the current visual viewport when available, else the layout viewport. */
export function getViewportRect(): ViewportRect {
  const vv = visualViewport();
  if (vv) {
    return {
      width: vv.width || globalThis.innerWidth || 0,
      height: vv.height || globalThis.innerHeight || 0,
      offsetLeft: vv.offsetLeft || 0,
      offsetTop: vv.offsetTop || 0,
    };
  }

  return {
    width: globalThis.innerWidth || 0,
    height: globalThis.innerHeight || 0,
    offsetLeft: 0,
    offsetTop: 0,
  };
}

/** Subscribe to layout and visual viewport changes. Returns an unsubscribe function. */
export function listenToViewportChanges(callback: () => void): () => void {
  const options = { passive: true } as const;
  globalThis.addEventListener?.('resize', callback, options);
  globalThis.addEventListener?.('scroll', callback, options);

  const vv = visualViewport();
  vv?.addEventListener('resize', callback, options);
  vv?.addEventListener('scroll', callback, options);

  return () => {
    globalThis.removeEventListener?.('resize', callback);
    globalThis.removeEventListener?.('scroll', callback);
    vv?.removeEventListener('resize', callback);
    vv?.removeEventListener('scroll', callback);
  };
}
