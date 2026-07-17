import { Injectable, inject } from '@angular/core';
import { TourStorageAdapter } from '@mfontecchio/ng-tourkit';
import { WORKFLOW_TOUR, WORKFLOW_TOUR_ID } from './workflow-tour';

@Injectable({ providedIn: 'root' })
export class DemoTourSeeder {
  private readonly storage = inject(TourStorageAdapter);

  async seed(): Promise<void> {
    const stored = await this.storage.getTour(WORKFLOW_TOUR_ID);

    // Replace when missing, older, or still using pre-playground routes from an
    // earlier demo layout (same version number but broken step paths).
    const needsUpdate =
      !stored ||
      stored.version < WORKFLOW_TOUR.version ||
      stored.steps.some(
        (step) =>
          step.route === '/' ||
          step.route === '/manage' ||
          step.route === '/settings' ||
          step.route === '/admin',
      );

    if (needsUpdate) {
      await this.storage.saveTour(WORKFLOW_TOUR);
    }
  }
}
