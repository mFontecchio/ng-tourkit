import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="code-block">
      @if (label()) {
        <div class="code-block__bar">
          <span class="code-block__label">{{ label() }}</span>
          <button type="button" class="code-block__copy" (click)="copy()">
            {{ copied() ? 'Copied' : 'Copy' }}
          </button>
        </div>
      } @else {
        <button type="button" class="code-block__copy code-block__copy--float" (click)="copy()">
          {{ copied() ? 'Copied' : 'Copy' }}
        </button>
      }
      <pre class="code-block__pre"><code>{{ code() }}</code></pre>
    </div>
  `,
})
export class CodeBlockComponent {
  readonly code = input.required<string>();
  readonly label = input<string>('');
  protected readonly copied = signal(false);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1600);
    } catch {
      /* clipboard may be unavailable in tests */
    }
  }
}
