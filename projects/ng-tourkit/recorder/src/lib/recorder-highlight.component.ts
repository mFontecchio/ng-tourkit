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
        class="box"
        [style.left.px]="r.x"
        [style.top.px]="r.y"
        [style.width.px]="r.width"
        [style.height.px]="r.height"
      ></div>
      @if (quality(); as q) {
        <div class="badge" [class]="q" [style.left.px]="r.x" [style.top.px]="r.y">
          {{ q }}{{ q === 'fragile' ? ': add data-tour attr' : '' }}
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
        font-family: system-ui, sans-serif;
      }
      .box {
        position: fixed;
        box-sizing: border-box;
        border: 2px dashed var(--tk-recorder-outline, #2563eb);
        border-radius: 4px;
      }
      .badge {
        position: fixed;
        transform: translateY(calc(-100% - 4px));
        padding: 2px 6px;
        border-radius: 999px;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
      }
      .stable {
        background: var(--tk-recorder-stable, #15803d);
      }
      .ok {
        background: var(--tk-recorder-ok, #b45309);
      }
      .fragile {
        background: var(--tk-recorder-fragile, #b91c1c);
      }
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
