import { Injectable, inject } from '@angular/core';
import { TourStorageAdapter } from '@mfontecchio/ng-tourkit';
import { WORKFLOW_TOUR, WORKFLOW_TOUR_ID } from './workflow-tour';

@Injectable({ providedIn: 'root' })
export class DemoTourSeeder {
  private readonly storage = inject(TourStorageAdapter);

  async seed(): Promise<void> {
    const stored = await this.storage.getTour(WORKFLOW_TOUR_ID);

    if (!stored || stored.version < WORKFLOW_TOUR.version) {
      await this.storage.saveTour(WORKFLOW_TOUR);
    }
  }
}
