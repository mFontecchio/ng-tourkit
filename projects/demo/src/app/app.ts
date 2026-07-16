import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TkTourAutoLauncher } from 'ng-tourkit';
import { TkRecorderLauncher } from 'ng-tourkit/recorder';
import { DemoUser } from './demo-user.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header>
      <nav>
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Home</a>
        <a routerLink="/settings" routerLinkActive="active">Settings</a>
        <a routerLink="/admin" routerLinkActive="active">Admin</a>
        <a routerLink="/manage" routerLinkActive="active">Manage tours</a>
      </nav>
      <div class="controls">
        <label>
          User
          <select [value]="user.userId()" (change)="switchUser($event)">
            <option value="alice">alice</option>
            <option value="bob">bob</option>
          </select>
        </label>
        <label>
          Role
          <select [value]="user.roles()[0] || 'user'" (change)="switchRole($event)">
            <option value="admin">admin</option>
            <option value="pm">pm</option>
            <option value="user">user</option>
          </select>
        </label>
        <button (click)="recorder.open()">🎬 Recorder</button>
      </div>
    </header>
    <main>
      <router-outlet />
    </main>
  `,
  styles: `
    header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 24px; border-bottom: 1px solid #e5e7eb; gap: 16px; flex-wrap: wrap;
    }
    nav { display: flex; gap: 16px; }
    nav a { text-decoration: none; color: #374151; }
    nav a.active { font-weight: 700; color: #111827; }
    .controls { display: flex; gap: 12px; align-items: center; }
    main { padding: 24px; }
  `,
})
export class App {
  protected readonly user = inject(DemoUser);
  protected readonly recorder = inject(TkRecorderLauncher);
  private readonly autoLauncher = inject(TkTourAutoLauncher);
  private readonly router = inject(Router);

  constructor() {
    // Check for pending auto-launch tours after each navigation.
    this.router.events.subscribe(e => {
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
