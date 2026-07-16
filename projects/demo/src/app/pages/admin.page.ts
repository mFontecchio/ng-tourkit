import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 data-tour="admin-title">Admin</h1>
    <p>Only users with the <code>admin</code> role should be targeted by admin tours.</p>
    <button data-tour="danger-btn">Dangerous admin action</button>
  `,
})
export class AdminPage {}
