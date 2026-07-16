import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="page-header">
      <h1 class="page-title" data-tour="settings-title">Settings</h1>
      <p class="page-sub">Manage your account preferences and notification settings.</p>
    </div>

    <!-- Profile section -->
    <div class="form-section" style="max-width:600px">
      <div class="form-section__header">
        <div class="form-section__title">Profile</div>
        <div class="form-section__sub">Your personal details visible to other team members.</div>
      </div>

      <div class="form-section__body">
        <div class="field">
          <label class="field__label" for="displayName" data-tour="display-name">Display name</label>
          <input
            id="displayName"
            type="text"
            name="displayName"
            [value]="name()"
            (input)="name.set(asValue($event))"
          />
        </div>

        <div class="field">
          <label class="field__label" for="emailAddr">Email address</label>
          <input
            id="emailAddr"
            type="email"
            name="email"
            [value]="email()"
            (input)="email.set(asValue($event))"
          />
          <span class="field__help">Used for audit notifications and tour completion reports.</span>
        </div>
      </div>

      <div class="form-section__header" style="border-top:1px solid var(--c-slate-100);border-bottom:none;margin-top:0">
        <div class="form-section__title">Notifications</div>
        <div class="form-section__sub">Control when and how you receive alerts.</div>
      </div>

      <div class="form-section__body" style="padding-top:8px">
        <div class="toggle-row" data-tour="notifications-toggle">
          <div class="toggle-row__info">
            <span class="toggle-row__label">Email notifications</span>
            <span class="toggle-row__desc">Receive a summary when users complete or dismiss tours.</span>
          </div>
          <input type="checkbox" [checked]="notifications()" (change)="notifications.set(!notifications())" />
        </div>

        <div class="toggle-row">
          <div class="toggle-row__info">
            <span class="toggle-row__label">Auto-launch new tours</span>
            <span class="toggle-row__desc">Show eligible tours automatically on first visit.</span>
          </div>
          <input type="checkbox" [checked]="autoLaunch()" (change)="autoLaunch.set(!autoLaunch())" />
        </div>
      </div>

      <div class="form-section__footer">
        @if (saved()) {
          <div class="alert alert--success" data-tour="saved-note" style="padding:6px 12px;border-radius:6px">
            <app-icon name="check" size="1rem" /> Settings saved successfully.
          </div>
        } @else {
          <span style="font-size:.8125rem;color:var(--c-slate-400)">Unsaved changes</span>
        }
        <button class="btn btn--primary" type="button" data-tour="save-settings" (click)="save()">
          Save changes
        </button>
      </div>
    </div>
  `,
  styles: ``,
})
export class SettingsPage {
  protected readonly name          = signal('Alice');
  protected readonly email         = signal('alice@example.com');
  protected readonly notifications = signal(true);
  protected readonly autoLaunch    = signal(true);
  protected readonly saved         = signal(false);

  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  protected save(): void {
    this.saved.set(true);
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saved.set(false), 3000);
  }

  protected asValue(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
