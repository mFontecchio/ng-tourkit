import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { trapFocus } from '../a11y/focus-trap';
import { PopoverAlign, PopoverSide } from '../models/tour.models';
import { StageRect } from '../overlay/stage-path';
import { TK_THEME_CSS } from '../ui/theme';
import { getViewportRect } from '../viewport/visual-viewport';
import { PopoverPosition, computePopoverPosition } from './positioning';

let nextId = 0;

@Component({
  selector: 'tk-tour-popover',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    'aria-modal': 'true',
    '[attr.aria-labelledby]': 'titleId',
    '[attr.aria-describedby]': 'bodyId',
    '[style.top.px]': 'position().top',
    '[style.left.px]': 'position().left',
  },
  template: `
    <button
      class="tk-btn tk-btn--ghost tk-popover-close"
      type="button"
      [attr.aria-label]="closeLabel()"
      (click)="closed.emit()"
    >
      ×
    </button>

    <h2 [id]="titleId">{{ title() }}</h2>
    <p [id]="bodyId">{{ body() }}</p>
    <div class="tk-popover-progress">
      Step {{ stepIndex() + 1 }} of {{ stepCount() }}
    </div>

    <div class="tk-popover-actions">
      @if (showPrev()) {
        <button type="button" class="tk-btn" (click)="prev.emit()">{{ prevLabel() }}</button>
      }

      @if (showNext()) {
        <button type="button" class="tk-btn tk-btn--primary" (click)="next.emit()">
          {{ isLastStep() ? doneLabel() : nextLabel() }}
        </button>
      }
    </div>

    @if (position().arrow; as arrow) {
      <span
        class="tk-popover-arrow"
        [class.tk-arrow-top]="arrow.side === 'top'"
        [class.tk-arrow-right]="arrow.side === 'right'"
        [class.tk-arrow-bottom]="arrow.side === 'bottom'"
        [class.tk-arrow-left]="arrow.side === 'left'"
        [style.left.px]="arrow.side === 'top' || arrow.side === 'bottom' ? arrow.offset : null"
        [style.top.px]="arrow.side === 'left' || arrow.side === 'right' ? arrow.offset : null"
      ></span>
    }
  `,
  styles: [
    TK_THEME_CSS,
    `
      :host {
        --tk-popover-bg: var(--tk-color-surface);
        --tk-popover-color: var(--tk-color-text);
        --tk-popover-border: var(--tk-color-border);
        --tk-popover-shadow: 0 20px 50px rgb(0 0 0 / 24%);
        --tk-popover-radius: 12px;
        --tk-popover-muted: var(--tk-color-text-muted);
        position: fixed;
        z-index: 10001;
        box-sizing: border-box;
        width: min(360px, calc(100vw - 20px));
        max-height: min(70dvh, calc(100dvh - 20px));
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 20px;
        border: 1px solid var(--tk-popover-border);
        border-radius: var(--tk-popover-radius);
        background: var(--tk-popover-bg);
        color: var(--tk-popover-color);
        box-shadow: var(--tk-popover-shadow);
        transition: top 160ms ease, left 160ms ease;
      }

      h2 {
        margin: 0 32px 8px 0;
        font-size: 1.125rem;
        line-height: 1.3;
      }

      p {
        margin: 0 0 16px;
        line-height: 1.5;
      }

      .tk-popover-close {
        position: absolute;
        top: 10px;
        right: 10px;
        display: inline-flex;
        align-items: flex-start;
        justify-content: center;
        width: 32px;
        height: 32px;
        min-height: 32px;
        padding: 0;
        border-radius: 999px;
        font-size: 1.5rem;
        line-height: 1;
      }

      .tk-popover-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .tk-popover-progress {
        margin-bottom: 14px;
        color: var(--tk-popover-muted);
        font-size: 0.875rem;
      }

      .tk-popover-arrow {
        position: absolute;
        width: 0;
        height: 0;
      }

      .tk-arrow-top,
      .tk-arrow-bottom {
        transform: translateX(-8px);
      }

      .tk-arrow-left,
      .tk-arrow-right {
        transform: translateY(-8px);
      }

      .tk-arrow-top {
        top: -8px;
        border-right: 8px solid transparent;
        border-bottom: 8px solid var(--tk-popover-bg);
        border-left: 8px solid transparent;
      }

      .tk-arrow-bottom {
        bottom: -8px;
        border-top: 8px solid var(--tk-popover-bg);
        border-right: 8px solid transparent;
        border-left: 8px solid transparent;
      }

      .tk-arrow-left {
        left: -8px;
        border-top: 8px solid transparent;
        border-right: 8px solid var(--tk-popover-bg);
        border-bottom: 8px solid transparent;
      }

      .tk-arrow-right {
        right: -8px;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-left: 8px solid var(--tk-popover-bg);
      }

      @media (prefers-reduced-motion: reduce) {
        :host {
          transition: none;
        }
      }
    `,
  ],
})
export class TkTourPopoverComponent implements AfterViewInit, OnDestroy, OnInit {
  readonly title = input('');
  readonly body = input('');
  readonly stepIndex = input(0);
  readonly stepCount = input(1);
  readonly side = input<PopoverSide>('bottom');
  readonly align = input<PopoverAlign>('center');
  readonly targetRect = input<StageRect | null>(null);
  readonly showPrev = input(true);
  readonly showNext = input(true);
  readonly nextLabel = input('Next');
  readonly prevLabel = input('Prev');
  readonly doneLabel = input('Done');
  readonly closeLabel = input('Close tour');

  readonly next = output<void>();
  readonly prev = output<void>();
  readonly closed = output<void>();

  readonly titleId = `tk-tour-popover-title-${nextId}`;
  readonly bodyId = `tk-tour-popover-body-${nextId++}`;

  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly popoverSize = signal({ width: 320, height: 180 });
  private focusCleanup: (() => void) | null = null;
  private readonly keydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      this.closed.emit();
    } else if (event.key === 'ArrowRight' && this.showNext()) {
      this.next.emit();
    } else if (event.key === 'ArrowLeft' && this.showPrev()) {
      this.prev.emit();
    }
  };

  readonly isLastStep = computed(() => this.stepIndex() + 1 >= this.stepCount());
  readonly position = computed<PopoverPosition>(() => {
    const viewport = getViewportRect();
    return computePopoverPosition({
      targetRect: this.targetRect(),
      popoverSize: this.popoverSize(),
      viewport,
      side: this.side(),
      align: this.align(),
    });
  });

  private readonly measure = afterRenderEffect(() => {
    const rect = this.element.nativeElement.getBoundingClientRect();
    const width = Math.ceil(rect.width);
    const height = Math.ceil(rect.height);
    const current = this.popoverSize();

    if (width > 0 && height > 0 && (current.width !== width || current.height !== height)) {
      this.popoverSize.set({ width, height });
    }
  });

  ngOnInit(): void {
    document.addEventListener('keydown', this.keydown);
  }

  ngAfterViewInit(): void {
    this.focusCleanup = trapFocus(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.keydown);
    this.focusCleanup?.();
    this.measure.destroy();
  }
}

