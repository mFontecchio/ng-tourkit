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
        border-radius: 6px;
        background: rgba(29, 78, 216, 0.07);
        box-shadow: 0 0 0 1.5px #fff, 0 0 0 3.5px #1d4ed8;
        animation: highlight-in 0.1s ease-out;
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
        background: #1e3a8a;
      }
      .badge.stable { background: var(--tk-recorder-stable, #15803d); }
      .badge.ok { background: var(--tk-recorder-ok, #1e3a8a); }
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
