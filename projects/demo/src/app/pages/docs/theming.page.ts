import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlockComponent } from '../../shared/code-block.component';

@Component({
  selector: 'app-docs-theming',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent],
  template: `
    <h1>Theming</h1>
    <p>
      Player popover, recorder panel, and tour manager share a dependency-free control theme.
      Override look via <code>--tk-*</code> CSS variables on any host element.
    </p>

    <h2>Override tokens</h2>
    <app-code-block label="CSS" [code]="css" />

    <p>
      Common tokens include <code>--tk-color-surface</code>, <code>--tk-color-text</code>,
      <code>--tk-color-border</code>, <code>--tk-color-accent</code>, and
      <code>--tk-shadow-focus</code>. Surface-specific aliases (for example
      <code>--tk-popover-bg</code>) default to the shared tokens.
    </p>

    <h2>Building custom authoring UI</h2>
    <p>The core package also exports:</p>
    <ul>
      <li>
        <code>TK_THEME_CSS</code> — defaults and reusable classes
        (<code>tk-input</code>, <code>tk-btn</code>, …)
      </li>
      <li>
        <code>TkSelectComponent</code> — accessible custom listbox select
      </li>
    </ul>
    <app-code-block label="TypeScript" [code]="imports" />
  `,
})
export class ThemingPage {
  protected readonly css = `tk-tour-popover,
tk-tour-recorder-panel,
tk-tour-manager {
  --tk-color-accent: #0d9488;
  --tk-radius-control: 10px;
}`;

  protected readonly imports = `import { TK_THEME_CSS, TkSelectComponent } from '@mfontecchio/ng-tourkit';`;
}
