import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TkTourAutoLauncher } from 'ng-tourkit';
import { TkRecorderLauncher } from 'ng-tourkit/recorder';
import { DemoUser } from './demo-user.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="shell">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar__brand">
          <app-icon name="beaker" size="1.5rem" class="sidebar__logo" />
          <span class="sidebar__name">ng-tourkit</span>
        </div>

        <nav class="sidebar__nav">
          <span class="sidebar__section-label">Workspace</span>

          <a
            class="sidebar__item"
            routerLink="/"
            routerLinkActive="sidebar__item--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <app-icon name="home" class="sidebar__icon" /> Dashboard
          </a>

          <a class="sidebar__item" routerLink="/settings" routerLinkActive="sidebar__item--active">
            <app-icon name="cog" class="sidebar__icon" /> Settings
          </a>

          <a class="sidebar__item" routerLink="/admin" routerLinkActive="sidebar__item--active">
            <app-icon name="shield" class="sidebar__icon" /> Admin
          </a>

          <span class="sidebar__section-label">Tours</span>

          <a class="sidebar__item" routerLink="/manage" routerLinkActive="sidebar__item--active">
            <app-icon name="folder" class="sidebar__icon" /> Manage Tours
          </a>
        </nav>

        <div class="sidebar__footer">
          <app-icon name="beaker" size=".875rem" class="sidebar__logo" />
          <span class="sidebar__footer-text">Demo environment</span>
        </div>
      </aside>

      <!-- Main area -->
      <div class="main-area">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar__left">
            <!--  breadcrumb TBD; title injected by each page -->
          </div>

          <div class="topbar__right">
            <!-- Demo user/role switcher -->
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

            <button class="btn btn--primary btn--sm" (click)="recorder.open()">
              <app-icon name="video" size="1rem" /> Record
            </button>

            <div class="topbar__user">
              <div class="user-avatar">{{ user.userId().charAt(0).toUpperCase() }}</div>
              <span class="user-name">{{ user.userId() }}</span>
              <span class="badge badge--slate">{{ user.roles()[0] }}</span>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: ``,
})
export class App {
  protected readonly user = inject(DemoUser);
  protected readonly recorder = inject(TkRecorderLauncher);
  private readonly autoLauncher = inject(TkTourAutoLauncher);
  private readonly router = inject(Router);

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) void this.autoLauncher.checkAndLaunch();
    });
  }

  protected switchUser(e: Event): void {
    this.user.userId.set((e.target as HTMLSelectElement).value);
  }

  protected switchRole(e: Event): void {
    this.user.roles.set([(e.target as HTMLSelectElement).value]);
  }
}
