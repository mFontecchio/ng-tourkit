import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

import { prefersReducedMotion } from '../a11y/reduced-motion';
import { easeOutQuad } from './stage-tracker';
import { StageRect, stageSvgPath } from './stage-path';

@Component({
  selector: 'tk-tour-overlay',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="tk-overlay" aria-hidden="true">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        [attr.d]="path()"
        [attr.fill]="overlayColor()"
        (click)="overlayClick.emit()"
      />
    </svg>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .tk-overlay {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        pointer-events: none;
      }

      path {
        pointer-events: auto;
        cursor: pointer;
      }
    `,
  ],
})
export class TkTourOverlayComponent implements OnDestroy {
  readonly stage = input<StageRect | null>(null);
  readonly padding = input(8);
  readonly radius = input(8);
  readonly overlayColor = input('rgba(0,0,0,0.7)');
  readonly animate = input(true);
  readonly animationDurationMs = input(300);
  readonly overlayClick = output<void>();

  private readonly viewport = signal({
    width: globalThis.innerWidth || 0,
    height: globalThis.innerHeight || 0,
  });
  private readonly renderedStage = signal<StageRect | null>(null);
  private animationFrame: number | null = null;
  private readonly updateViewport = (): void => {
    this.viewport.set({
      width: globalThis.innerWidth || 0,
      height: globalThis.innerHeight || 0,
    });
  };

  readonly path = computed(() => {
    const viewport = this.viewport();
    return stageSvgPath(
      viewport.width,
      viewport.height,
      this.renderedStage(),
      this.padding(),
      this.radius(),
    );
  });

  private readonly stageEffect = effect(() => {
    this.moveStage(this.stage());
  });

  constructor() {
    globalThis.addEventListener?.('resize', this.updateViewport, { passive: true });
    this.updateViewport();
  }

  ngOnDestroy(): void {
    globalThis.removeEventListener?.('resize', this.updateViewport);
    this.cancelAnimation();
    this.stageEffect.destroy();
  }

  private moveStage(next: StageRect | null): void {
    this.cancelAnimation();

    const previous = this.renderedStage();
    const duration = this.animationDurationMs();

    if (
      !this.animate() ||
      prefersReducedMotion() ||
      !previous ||
      !next ||
      duration <= 0
    ) {
      this.renderedStage.set(next);
      return;
    }

    const startedAt = performance.now();
    const tick = (now: number): void => {
      const elapsed = Math.min(now - startedAt, duration);
      this.renderedStage.set({
        x: easeOutQuad(elapsed, previous.x, next.x - previous.x, duration),
        y: easeOutQuad(elapsed, previous.y, next.y - previous.y, duration),
        width: easeOutQuad(elapsed, previous.width, next.width - previous.width, duration),
        height: easeOutQuad(elapsed, previous.height, next.height - previous.height, duration),
      });

      if (elapsed < duration) {
        this.animationFrame = requestAnimationFrame(tick);
      } else {
        this.animationFrame = null;
        this.renderedStage.set(next);
      }
    };

    this.animationFrame = requestAnimationFrame(tick);
  }

  private cancelAnimation(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

