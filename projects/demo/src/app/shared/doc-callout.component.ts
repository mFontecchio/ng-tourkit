import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-doc-callout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="doc-callout" [attr.data-tone]="tone()">
      @if (title()) {
        <div class="doc-callout__title">{{ title() }}</div>
      }
      <div class="doc-callout__body"><ng-content /></div>
    </aside>
  `,
})
export class DocCalloutComponent {
  readonly title = input<string>('');
  readonly tone = input<'note' | 'tip' | 'warning'>('note');
}
