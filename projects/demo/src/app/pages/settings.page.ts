import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 data-tour="settings-title">Settings</h1>
    <form>
      <label>
        Display name
        <input data-tour="display-name" name="displayName" [value]="name()" (input)="name.set(asValue($event))" />
      </label>
      <label>
        <input type="checkbox" data-tour="notifications-toggle" name="notifications" />
        Email notifications
      </label>
      <button type="button" data-tour="save-settings" (click)="saved.set(true)">Save</button>
      @if (saved()) {
        <p data-tour="saved-note">Saved!</p>
      }
    </form>
  `,
  styles: `
    form { display: grid; gap: 12px; max-width: 360px; }
    label { display: grid; gap: 4px; }
  `,
})
export class SettingsPage {
  protected readonly name = signal('Alice');
  protected readonly saved = signal(false);

  protected asValue(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
