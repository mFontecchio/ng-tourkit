import { Injectable, inject } from '@angular/core';
import { TOUR_AUDIENCE_RESOLVER } from './audience';
import { TourAuditAdapter, TourStorageAdapter } from '../persistence/adapters';
import { TOUR_USER_ID } from '../persistence/provide-tour-kit';
import { TourDefinition } from '../models/tour.models';

/** Answers "should this user see this tour (now)?" */
@Injectable({ providedIn: 'root' })
export class TkTourEligibility {
  private readonly storage = inject(TourStorageAdapter);
  private readonly audit = inject(TourAuditAdapter);
  private readonly resolveAudience = inject(TOUR_AUDIENCE_RESOLVER);
  private readonly userId = inject(TOUR_USER_ID);

  /** Published + audience match. Ignores completion state (manual launches allowed anytime). */
  async isEligible(tour: TourDefinition): Promise<boolean> {
    return tour.status === 'published' && (await this.resolveAudience(tour));
  }

  /** Eligible AND not already completed at this version — the auto-launch gate. */
  async shouldAutoLaunch(tour: TourDefinition): Promise<boolean> {
    if (!tour.autoLaunch || !(await this.isEligible(tour))) return false;
    return !(await this.audit.hasCompleted(tour.id, this.userId(), tour.version));
  }

  /** All published tours the current user may see. */
  async eligibleTours(): Promise<TourDefinition[]> {
    const tours = await this.storage.listTours();
    const flags = await Promise.all(tours.map(t => this.isEligible(t)));
    return tours.filter((_, i) => flags[i]);
  }
}
