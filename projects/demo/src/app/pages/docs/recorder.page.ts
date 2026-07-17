import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DocCalloutComponent } from '../../shared/doc-callout.component';

@Component({
  selector: 'app-docs-recorder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, DocCalloutComponent, RouterLink],
  template: `
    <h1>Visual recorder</h1>
    <p>
      The recorder lets non-developers author tours by clicking the real application UI. It lives in
      <code>&#64;mfontecchio/ng-tourkit/recorder</code> so you can lazy-load it for authors only.
    </p>

    <h2>Open the recorder</h2>
    <app-code-block label="TypeScript" [code]="open" />

    <h2>What authors can do</h2>
    <ul>
      <li>Enter pick mode — hover highlights elements, click captures them</li>
      <li>Add element steps or modal steps</li>
      <li>Edit title, body, side, wait timeout, and click actions</li>
      <li>Reorder, delete, or retarget steps</li>
      <li>Validate issues, preview, save draft, or publish (version bumps on republish)</li>
    </ul>

    <h2>Quality badges</h2>
    <p>
      While hovering, the recorder scores locator quality as <strong>stable</strong>,
      <strong>ok</strong>, or <strong>fragile</strong>, and suggests adding a
      <code>data-tour</code> attribute when targeting would be brittle.
    </p>

    <app-doc-callout title="Demo tip" tone="tip">
      In the <a routerLink="/playground">playground</a>, use the Record button in the top bar. The
      recorder UI is excluded from capture via <code>data-tk-recorder</code>.
    </app-doc-callout>
  `,
})
export class RecorderPage {
  protected readonly open = `import { inject } from '@angular/core';
import { TkRecorderLauncher } from '@mfontecchio/ng-tourkit/recorder';

// gate behind your own role check
inject(TkRecorderLauncher).open();        // create
inject(TkRecorderLauncher).open(tourId);  // edit`;
}
