import { Injectable, Signal, signal } from '@angular/core';

import { listenToViewportChanges } from '../viewport/visual-viewport';
import { StageRect } from './stage-path';

export function easeInOutQuad(
  elapsed: number,
  start: number,
  delta: number,
  duration: number,
): number {
  const halfDuration = duration / 2;
  let time = elapsed;

  if (time < halfDuration) {
    return (delta / 2) * time * time / (halfDuration * halfDuration) + start;
  }

  time -= halfDuration;
  return -delta / 2 * (time * (time - 2 * halfDuration) - halfDuration * halfDuration) / (halfDuration * halfDuration) + start;
}

/** ponytail: easeOut feels snappier than easeInOut for highlight movement — hits target fast, settles gently */
export function easeOutQuad(
  elapsed: number,
  start: number,
  delta: number,
  duration: number,
): number {
  const t = elapsed / duration;
  return -delta * t * (t - 2) + start;
}

@Injectable({ providedIn: 'root' })
export class TkStageTracker {
  private readonly rect = signal<StageRect>({ x: 0, y: 0, width: 0, height: 0 });
  private resizeObserver: ResizeObserver | null = null;
  private trackedElement: HTMLElement | null = null;
  private frameId: number | null = null;
  private stopViewportListen: (() => void) | null = null;
  private readonly scheduleUpdate = (): void => {
    if (this.frameId !== null) {
      return;
    }

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.update();
    });
  };

  track(el: HTMLElement): Signal<StageRect> {
    this.stop();
    this.trackedElement = el;
    this.update();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(this.scheduleUpdate);
      this.resizeObserver.observe(el);
    }

    window.addEventListener('scroll', this.scheduleUpdate, {
      capture: true,
      passive: true,
    });
    this.stopViewportListen = listenToViewportChanges(this.scheduleUpdate);

    return this.rect.asReadonly();
  }

  stop(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.trackedElement = null;

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    window.removeEventListener('scroll', this.scheduleUpdate, true);
    this.stopViewportListen?.();
    this.stopViewportListen = null;
  }

  private update(): void {
    if (!this.trackedElement) {
      return;
    }

    const rect = this.trackedElement.getBoundingClientRect();
    this.rect.set({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  }
}
