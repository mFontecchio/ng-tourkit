import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { generateLocator, scoreQuality } from 'ng-tourkit';
import { LocatorQuality, TkCaptureService } from './capture.service';

@Component({
  selector: 'tk-recorder-highlight',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rect(); as r) {
      <div
        [class]="'box' + (quality() ? ' ' + quality() : '')"
        [style.left.px]="r.x"
        [style.top.px]="r.y"
        [style.width.px]="r.width"
        [style.height.px]="r.height"
      ></div>
      @if (quality(); as q) {
        <div class="badge" [class]="q" [style.left.px]="r.x" [style.top.px]="r.y">
          {{ q }}{{ q === 'fragile' ? ' — add data-tour attr' : '' }}
        </div>
      }
    }
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 10002;
        pointer-events: none;
        font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      }

      .box {
        position: fixed;
        box-sizing: border-box;
        border: 2px solid var(--tk-recorder-outline, #3b82f6);
        border-radius: 6px;
        background: rgba(59, 130, 246, 0.06);
        animation: highlight-in 0.1s ease-out;
      }
      .box.stable {
        border-color: var(--tk-recorder-stable, #15803d);
        background: rgba(21, 128, 61, 0.06);
      }
      .box.ok {
        border-color: var(--tk-recorder-ok, #b45309);
        background: rgba(180, 83, 9, 0.06);
      }
      .box.fragile {
        border-color: var(--tk-recorder-fragile, #b91c1c);
        background: rgba(185, 28, 28, 0.06);
      }

      @keyframes highlight-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .badge {
        position: fixed;
        transform: translateY(calc(-100% - 6px));
        padding: 3px 8px;
        border-radius: 6px;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.03em;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.22);
      }
      .badge.stable { background: var(--tk-recorder-stable, #15803d); }
      .badge.ok { background: var(--tk-recorder-ok, #b45309); }
      .badge.fragile { background: var(--tk-recorder-fragile, #b91c1c); }
    `,
  ],
})
export class TkRecorderHighlightComponent {
  private readonly capture = inject(TkCaptureService);

  readonly rect = this.capture.hoverRect;
  readonly quality = computed<LocatorQuality | null>(() => {
    const element = this.capture.hovered();
    return element ? scoreQuality(generateLocator(element)) : null;
  });
}
