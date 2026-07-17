import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-marketing-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="mkt" [class.mkt--nav-open]="navOpen()">
      <header class="mkt-nav">
        <div class="mkt-nav__inner">
          <a class="mkt-nav__brand" routerLink="/" (click)="closeNav()">
            <img src="logo.svg" alt="" width="28" height="28" />
            <span class="mkt-nav__name">ng-tourkit</span>
          </a>

          <nav class="mkt-nav__links" aria-label="Primary">
            <a
              class="mkt-nav__link"
              routerLink="/"
              routerLinkActive="mkt-nav__link--active"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeNav()"
              >Product</a
            >
            <a
              class="mkt-nav__link"
              routerLink="/features"
              routerLinkActive="mkt-nav__link--active"
              (click)="closeNav()"
              >Features</a
            >
            <a
              class="mkt-nav__link"
              routerLink="/docs"
              routerLinkActive="mkt-nav__link--active"
              (click)="closeNav()"
              >Docs</a
            >
            <a
              class="mkt-nav__link"
              routerLink="/examples"
              routerLinkActive="mkt-nav__link--active"
              (click)="closeNav()"
              >Examples</a
            >
            <a
              class="mkt-nav__link"
              routerLink="/playground"
              routerLinkActive="mkt-nav__link--active"
              (click)="closeNav()"
              >Playground</a
            >
            <a
              class="mkt-nav__link mkt-nav__link--mobile-only"
              href="https://github.com/mFontecchio/ng-tourkit"
              target="_blank"
              rel="noopener noreferrer"
              (click)="closeNav()"
              >GitHub</a
            >
            <a
              class="btn btn--primary btn--sm mkt-nav__drawer-cta"
              routerLink="/playground"
              (click)="closeNav()"
            >
              Open playground
            </a>
          </nav>

          <div class="mkt-nav__actions">
            <a
              class="mkt-nav__ghost"
              href="https://github.com/mFontecchio/ng-tourkit"
              target="_blank"
              rel="noopener noreferrer"
              >GitHub</a
            >
            <a class="btn btn--primary btn--sm mkt-nav__cta" routerLink="/playground" (click)="closeNav()">
              Open playground
            </a>
            <button
              type="button"
              class="mkt-nav__menu btn btn--ghost btn--sm"
              aria-label="Open menu"
              [attr.aria-expanded]="navOpen()"
              (click)="toggleNav()"
            >
              <app-icon [name]="navOpen() ? 'x-mark' : 'bars'" size="1.25rem" />
            </button>
          </div>
        </div>
      </header>

      <main class="mkt-main">
        <router-outlet />
      </main>

      <footer class="mkt-footer">
        <div class="mkt-footer__inner">
          <div class="mkt-footer__brand">
            <img src="logo.svg" alt="" width="20" height="20" />
            <span>ng-tourkit</span>
          </div>
          <p class="mkt-footer__copy">
            Guided tours for Angular — source-available, free for commercial use with attribution.
          </p>
          <div class="mkt-footer__links">
            <a routerLink="/docs">Documentation</a>
            <a routerLink="/playground">Playground</a>
            <a href="https://github.com/mFontecchio/ng-tourkit" target="_blank" rel="noopener noreferrer"
              >GitHub</a
            >
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class MarketingLayout {
  protected readonly navOpen = signal(false);

  protected toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }
}
