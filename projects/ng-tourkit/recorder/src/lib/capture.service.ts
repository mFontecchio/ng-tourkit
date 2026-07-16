import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { ElementLocator, generateLocator, scoreQuality } from 'ng-tourkit';

export type RecorderMode = 'pick' | 'passthrough';
export type LocatorQuality = 'stable' | 'ok' | 'fragile';
export interface HoverRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface PickedElement {
  readonly element: HTMLElement;
  readonly locator: ElementLocator;
  readonly quality: LocatorQuality;
}

@Injectable({ providedIn: 'root' })
export class TkCaptureService {
  private readonly document = inject(DOCUMENT);
  private readonly activeState = signal(false);
  private readonly hoveredState = signal<HTMLElement | null>(null);
  private readonly hoverRectState = signal<HoverRect | null>(null);
  private readonly lastPickedState = signal<PickedElement | null>(null);
  private frame = 0;

  readonly active: Signal<boolean> = this.activeState.asReadonly();
  readonly hovered: Signal<HTMLElement | null> = this.hoveredState.asReadonly();
  readonly hoverRect: Signal<HoverRect | null> = this.hoverRectState.asReadonly();
  readonly lastPicked: Signal<PickedElement | null> = this.lastPickedState.asReadonly();
  readonly mode = signal<RecorderMode>('passthrough');

  start(): void {
    if (this.activeState()) return;
    this.activeState.set(true);
    this.document.addEventListener('pointermove', this.onPointerMove, { capture: true });
    this.document.addEventListener('click', this.onClick, { capture: true });
  }

  stop(): void {
    if (!this.activeState()) return;
    this.document.removeEventListener('pointermove', this.onPointerMove, { capture: true });
    this.document.removeEventListener('click', this.onClick, { capture: true });
    this.activeState.set(false);
    this.mode.set('passthrough');
    this.hoveredState.set(null);
    this.hoverRectState.set(null);
    this.cancelFrame();
  }

  clearPicked(): void {
    this.lastPickedState.set(null);
  }

  pick(element: HTMLElement): PickedElement {
    const locator = generateLocator(element);
    return { element, locator, quality: scoreQuality(locator) };
  }

  private readonly onPointerMove = (event: Event): void => {
    const element = this.capturableElement(event.target);
    if (element === this.hoveredState()) return;
    this.hoveredState.set(element);
    this.scheduleRect(element);
  };

  private readonly onClick = (event: MouseEvent): void => {
    if (this.mode() !== 'pick') return;
    const element = this.capturableElement(event.target);
    if (!element) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.lastPickedState.set(this.pick(element));
  };

  private capturableElement(target: EventTarget | null): HTMLElement | null {
    if (!(target instanceof HTMLElement)) return null;
    return target.closest('[data-tk-recorder]') ? null : target;
  }

  private scheduleRect(element: HTMLElement | null): void {
    this.cancelFrame();
    if (!element) {
      this.hoverRectState.set(null);
      return;
    }
    const request = globalThis.requestAnimationFrame ?? ((cb: FrameRequestCallback) => window.setTimeout(cb, 0));
    this.frame = request(() => {
      this.frame = 0;
      if (this.hoveredState() !== element) return;
      const rect = element.getBoundingClientRect();
      this.hoverRectState.set({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    });
  }

  private cancelFrame(): void {
    if (!this.frame) return;
    const cancel = globalThis.cancelAnimationFrame ?? window.clearTimeout;
    cancel(this.frame);
    this.frame = 0;
  }
}
