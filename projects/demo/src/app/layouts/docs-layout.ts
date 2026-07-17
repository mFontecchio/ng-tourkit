import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const DOC_NAV = [
  { path: '/docs/getting-started', label: 'Getting started' },
  { path: '/docs/concepts', label: 'Concepts' },
  { path: '/docs/recorder', label: 'Recorder' },
  { path: '/docs/manage', label: 'Manage' },
  { path: '/docs/targeting', label: 'Targeting' },
  { path: '/docs/audience', label: 'Audience & auto-launch' },
  { path: '/docs/theming', label: 'Theming' },
  { path: '/docs/accessibility', label: 'Accessibility' },
  { path: '/docs/api', label: 'API overview' },
] as const;

@Component({
  selector: 'app-docs-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="docs">
      <aside class="docs-sidebar">
        <div class="docs-sidebar__label">Documentation</div>
        <nav class="docs-sidebar__nav" aria-label="Docs">
          @for (item of nav; track item.path) {
            <a
              class="docs-sidebar__link"
              [routerLink]="item.path"
              routerLinkActive="docs-sidebar__link--active"
              >{{ item.label }}</a
            >
          }
        </nav>
        <a class="docs-sidebar__cta btn btn--primary btn--sm" routerLink="/playground">
          Open playground
        </a>
      </aside>

      <article class="docs-content prose">
        <router-outlet />
      </article>
    </div>
  `,
})
export class DocsLayout {
  protected readonly nav = DOC_NAV;
}
