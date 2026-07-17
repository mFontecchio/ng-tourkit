import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { TkTourAutoLauncher } from '@mfontecchio/ng-tourkit';
import { TkRecorderLauncher } from '@mfontecchio/ng-tourkit/recorder';
import { DemoUser } from '../demo-user.service';
import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-playground-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="shell" [class.shell--nav-open]="navOpen()">
      <aside class="sidebar" id="demo-sidebar">
        <div class="sidebar__brand">
          <img src="logo.svg" alt="" width="24" height="24" class="sidebar__logo" />
          <span class="sidebar__name">ng-tourkit</span>
        </div>

        <nav class="sidebar__nav">
          <span class="sidebar__section-label">Workspace</span>

          <a
            class="sidebar__item"
            routerLink="/playground"
            routerLinkActive="sidebar__item--active"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="closeNav()"
          >
            <app-icon name="home" class="sidebar__icon" /> Dashboard
          </a>

          <a
            class="sidebar__item"
            routerLink="/playground/settings"
            routerLinkActive="sidebar__item--active"
            (click)="closeNav()"
          >
            <app-icon name="cog" class="sidebar__icon" /> Settings
          </a>

          <a
            class="sidebar__item"
            routerLink="/playground/admin"
            routerLinkActive="sidebar__item--active"
            (click)="closeNav()"
          >
            <app-icon name="shield" class="sidebar__icon" /> Admin
          </a>

          <span class="sidebar__section-label">Tours</span>

          <a
            class="sidebar__item"
            routerLink="/playground/manage"
            routerLinkActive="sidebar__item--active"
            data-tour="manage-tours-link"
            (click)="closeNav()"
          >
            <app-icon name="folder" class="sidebar__icon" /> Manage Tours
          </a>
        </nav>

        <div class="sidebar__footer">
          <a class="sidebar__leave" routerLink="/" (click)="closeNav()">
            <app-icon name="arrow-left" size="0.875rem" />
            Leave playground
          </a>
        </div>
      </aside>

      <button
        type="button"
        class="nav-backdrop"
        aria-label="Close navigation"
        (click)="closeNav()"
      ></button>

      <div class="main-area">
        <header class="topbar">
          <div class="topbar__left">
            <button
              type="button"
              class="btn btn--ghost btn--sm topbar__menu"
              aria-label="Open navigation"
              [attr.aria-expanded]="navOpen()"
              aria-controls="demo-sidebar"
              (click)="toggleNav()"
            >
              <app-icon name="bars" size="1.25rem" />
            </button>
            <span class="topbar__env">Playground</span>
          </div>

          <div class="topbar__right">
            <div class="demo-pill">
              <span class="demo-pill__label">Demo</span>
              <select [value]="user.userId()" (change)="switchUser($event)" title="Switch user">
                <option value="alice">alice</option>
                <option value="bob">bob</option>
              </select>
              <select
                [value]="user.roles()[0] || 'user'"
                (change)="switchRole($event)"
                title="Switch role"
              >
                <option value="admin">admin</option>
                <option value="pm">pm</option>
                <option value="user">user</option>
              </select>
            </div>

            <div class="topbar__divider"></div>

            <button
              class="btn btn--primary btn--sm topbar__record"
              type="button"
              data-tour="record-button"
              (click)="recorder.open()"
            >
              <app-icon name="video" size="1rem" />
              <span class="topbar__record-label">Record</span>
            </button>

            <div class="topbar__user">
              <div class="user-avatar">{{ user.userId().charAt(0).toUpperCase() }}</div>
              <span class="user-name">{{ user.userId() }}</span>
              <span class="badge badge--slate">{{ user.roles()[0] }}</span>
            </div>
          </div>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class PlaygroundLayout {
  protected readonly user = inject(DemoUser);
  protected readonly recorder = inject(TkRecorderLauncher);
  protected readonly navOpen = signal(false);
  private readonly autoLauncher = inject(TkTourAutoLauncher);
  private readonly router = inject(Router);

  constructor() {
    // Scope auto-launch to the playground only. Using takeUntilDestroyed prevents
    // the subscription from leaking and firing checkAndLaunch on marketing routes
    // after the user leaves the playground.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closeNav();
        void this.autoLauncher.checkAndLaunch();
      });
  }

  protected toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }

  protected switchUser(e: Event): void {
    this.user.userId.set((e.target as HTMLSelectElement).value);
  }

  protected switchRole(e: Event): void {
    this.user.roles.set([(e.target as HTMLSelectElement).value]);
  }
}
