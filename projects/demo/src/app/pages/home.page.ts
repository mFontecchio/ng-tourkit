import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TkTourEligibility, TkTourService, TourDefinition } from 'ng-tourkit';
import { IconComponent } from '../icon.component';

interface ActivityRow {
  user: string;
  tour: string;
  event: string;
  eventClass: string;
  when: string;
}

const MOCK_ACTIVITY: ActivityRow[] = [
  { user: 'alice', tour: 'Onboarding Flow',   event: 'completed',  eventClass: 'badge--green',  when: '2 min ago' },
  { user: 'bob',   tour: 'Settings Walkthrough', event: 'started', eventClass: 'badge--indigo', when: '14 min ago' },
  { user: 'alice', tour: 'Admin Overview',    event: 'dismissed',  eventClass: 'badge--amber',  when: '1 hr ago' },
  { user: 'carol', tour: 'Onboarding Flow',   event: 'completed',  eventClass: 'badge--green',  when: '2 hr ago' },
  { user: 'bob',   tour: 'Onboarding Flow',   event: 'started',    eventClass: 'badge--indigo', when: '3 hr ago' },
  { user: 'dave',  tour: 'Settings Walkthrough', event: 'step_viewed', eventClass: 'badge--slate', when: 'Yesterday' },
];

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="page-header">
      <h1 class="page-title" data-tour="home-title">Dashboard</h1>
      <p class="page-sub">Welcome back — here's what's happening with your tours.</p>
    </div>

    <!-- KPI cards -->
    <div class="kpi-grid" data-tour="stats-card">
      @for (kpi of kpis; track kpi.label) {
        <div class="card kpi-card">
          <div class="kpi-card__icon"><app-icon [name]="kpi.icon" size="2rem" /></div>
          <div class="kpi-card__body">
            <div class="kpi-card__value">{{ kpi.value }}</div>
            <div class="kpi-card__label">{{ kpi.label }}</div>
          </div>
          <span class="badge {{ kpi.deltaClass }}">{{ kpi.delta }}</span>
        </div>
      }
    </div>

    <!-- Activity + Tours row -->
    <div class="content-grid" style="margin-top:24px">

      <!-- Recent activity table -->
      <div class="card" style="overflow:hidden" data-tour="activity-card">
        <div class="card-header">
          <span class="card-title">Recent Activity</span>
          <span class="badge badge--slate">Last 24 h</span>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Tour</th>
              <th>Event</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            @for (row of activity; track $index) {
              <tr>
                <td><span class="user-chip">{{ row.user }}</span></td>
                <td>{{ row.tour }}</td>
                <td><span class="badge {{ row.eventClass }}">{{ row.event }}</span></td>
                <td style="color:var(--c-slate-400)">{{ row.when }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Published tours -->
      <div class="card" style="overflow:hidden">
        <div class="card-header">
          <span class="card-title">Available Tours</span>
          <button class="btn btn--ghost btn--sm" data-tour="refresh-btn" (click)="reload()">
            <app-icon name="arrow-path" size="1rem" /> Refresh
          </button>
        </div>

        @if (tours().length === 0) {
          <div class="empty-state">
            <div class="empty-state__icon"><app-icon name="map" size="2.5rem" /></div>
            <div class="empty-state__text">No published tours yet.</div>
            <div class="empty-state__text" style="margin-top:4px;font-size:.75rem">
              Use <strong>Record</strong> in the top bar to create one.
            </div>
          </div>
        } @else {
          <table class="data-table">
            <thead>
              <tr>
                <th>Tour</th>
                <th>Ver.</th>
                <th>Steps</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (tour of tours(); track tour.id) {
                <tr>
                  <td style="font-weight:500">{{ tour.name }}</td>
                  <td><span class="badge badge--slate">v{{ tour.version }}</span></td>
                  <td style="color:var(--c-slate-500)">{{ tour.steps.length }}</td>
                  <td>
                    <button class="btn btn--primary btn--sm" (click)="run(tour)">
                      <app-icon name="play" size="1rem" /> Run
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: `
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }
    .kpi-card {
      display: flex; align-items: center; gap: 14px;
      padding: 18px 20px;
    }
    .kpi-card__icon { display: flex; align-items: center; color: var(--c-primary); }
    .kpi-card__body { flex: 1; }
    .kpi-card__value { font-size: 1.75rem; font-weight: 700; color: var(--c-slate-900); line-height: 1.1; }
    .kpi-card__label { font-size: .75rem; font-weight: 500; color: var(--c-slate-500); margin-top: 2px; text-transform: uppercase; letter-spacing: .04em; }

    .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 900px) { .content-grid { grid-template-columns: 1fr; } }

    .user-chip {
      display: inline-flex; align-items: center;
      padding: 2px 8px; background: var(--c-primary-light);
      border-radius: 9999px; font-size: .75rem; font-weight: 600;
      color: var(--c-primary-text);
    }
  `,
})
export class HomePage {
  private readonly eligibility = inject(TkTourEligibility);
  private readonly player = inject(TkTourService);

  protected readonly tours = signal<TourDefinition[]>([]);
  protected readonly activity = MOCK_ACTIVITY;
  protected readonly kpis = [
    { icon: 'map',       label: 'Tours Created',  value: '12',  delta: '+2 this mo', deltaClass: 'badge--green'  },
    { icon: 'check',     label: 'Published',       value: '8',   delta: '4 drafts',   deltaClass: 'badge--slate'  },
    { icon: 'trophy',    label: 'Completions',     value: '247', delta: '+18 today',  deltaClass: 'badge--green'  },
    { icon: 'chart-bar', label: 'Avg Completion',  value: '73%', delta: '+5% wk',     deltaClass: 'badge--indigo' },
  ];

  constructor() {
    void this.reload();
  }

  protected async reload(): Promise<void> {
    this.tours.set(await this.eligibility.eligibleTours());
  }

  protected run(tour: TourDefinition): void {
    void this.player.start(tour);
  }
}
