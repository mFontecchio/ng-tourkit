import { Injectable, inject } from '@angular/core';
import { TkTourEligibility } from '../audience/eligibility.service';
import { TkTourService } from './tour.service';

/**
 * Launches the first pending auto-launch tour for the current user.
 * Call from your app (e.g. after login or on NavigationEnd) — the library
 * doesn't guess when your app is "ready".
 */
@Injectable({ providedIn: 'root' })
export class TkTourAutoLauncher {
  private readonly eligibility = inject(TkTourEligibility);
  private readonly player = inject(TkTourService);

  /** Returns the launched tour id, or null when nothing was pending. */
  async checkAndLaunch(): Promise<string | null> {
    if (this.player.activeTour()) return null;
    for (const tour of await this.eligibility.eligibleTours()) {
      if (await this.eligibility.shouldAutoLaunch(tour)) {
        await this.player.start(tour);
        return tour.id;
      }
    }
    return null;
  }
}
