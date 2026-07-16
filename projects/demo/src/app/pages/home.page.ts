import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TkTourEligibility, TkTourService, TourDefinition } from 'ng-tourkit';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 data-tour="home-title">Dashboard</h1>
    <p>This demo app exercises the ng-tourkit player, recorder and manager.</p>

    <section class="cards">
      <div class="card" data-tour="stats-card">
        <h3>Stats</h3>
        <p>42 widgets sold</p>
      </div>
      <div class="card" data-tour="activity-card">
        <h3>Activity</h3>
        <button data-tour="refresh-btn" (click)="refreshed.set(refreshed() + 1)">
          Refresh ({{ refreshed() }})
        </button>
      </div>
    </section>

    <section>
      <h2>Available tours</h2>
      @if (tours().length === 0) {
        <p class="muted">No published tours yet — record one via the Recorder button above.</p>
      }
      <ul>
        @for (tour of tours(); track tour.id) {
          <li>
            {{ tour.name }} (v{{ tour.version }})
            <button (click)="run(tour)">Run</button>
          </li>
        }
      </ul>
      <button (click)="reload()">Reload list</button>
    </section>
  `,
  styles: `
    .cards { display: flex; gap: 16px; margin: 16px 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 16px; min-width: 180px; }
    .muted { color: #777; }
  `,
})
export class HomePage {
  private readonly eligibility = inject(TkTourEligibility);
  private readonly player = inject(TkTourService);

  protected readonly refreshed = signal(0);
  protected readonly tours = signal<TourDefinition[]>([]);

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
