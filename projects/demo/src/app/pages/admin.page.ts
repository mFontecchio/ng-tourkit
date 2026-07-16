import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-admin',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="page-header">
      <h1 class="page-title" data-tour="admin-title">Admin</h1>
      <p class="page-sub">Restricted to users with the <strong>admin</strong> role.</p>
    </div>

    <div class="alert alert--warning" style="margin-bottom:20px;max-width:600px">
      <app-icon name="warning" size="1.25rem" />
      <div>
        <strong>Admin zone</strong> — tour audience targeting is set to
        <code style="font-size:.8125rem">roles: ["admin"]</code>. Switch the role dropdown in the
        top bar to see how audience filtering behaves.
      </div>
    </div>

    <!-- Admin action cards -->
    <div class="admin-grid" style="max-width:700px">
      <div class="card" style="padding:20px">
        <div style="color:var(--c-slate-500);margin-bottom:10px">
          <app-icon name="trash" size="1.5rem" />
        </div>
        <div style="font-weight:600;margin-bottom:4px">Purge audit log</div>
        <div style="font-size:.8125rem;color:var(--c-slate-500);margin-bottom:16px">
          Permanently remove all audit events older than 90 days.
        </div>
        @if (!confirmPurge()) {
          <button
            class="btn btn--ghost btn--sm"
            data-tour="danger-btn"
            (click)="confirmPurge.set(true)"
          >
            Purge old events…
          </button>
        } @else {
          <div style="display:flex;align-items:center;gap:8px">
            <button class="btn btn--danger btn--sm" (click)="purge()">Confirm purge</button>
            <button class="btn btn--ghost btn--sm" (click)="confirmPurge.set(false)">Cancel</button>
          </div>
        }
      </div>

      <div class="card" style="padding:20px">
        <div style="color:var(--c-slate-500);margin-bottom:10px">
          <app-icon name="arrow-up-tray" size="1.5rem" />
        </div>
        <div style="font-weight:600;margin-bottom:4px">Export all tours</div>
        <div style="font-size:.8125rem;color:var(--c-slate-500);margin-bottom:16px">
          Download the full tour library as a JSON backup.
        </div>
        <button class="btn btn--ghost btn--sm" (click)="exportNote.set(true)">Export JSON</button>
        @if (exportNote()) {
          <div class="alert alert--success" style="margin-top:10px;padding:8px 12px">
            <app-icon name="check" size="1rem" />
            Use the Manage Tours page for full export — this is a UI demo.
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .admin-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .admin-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class AdminPage {
  protected readonly confirmPurge = signal(false);
  protected readonly exportNote = signal(false);

  protected purge(): void {
    this.confirmPurge.set(false);
    //  demo only — no real purge
  }
}
