import { createApplication } from '@angular/platform-browser';
import { TourStorageAdapter } from '@mfontecchio/ng-tourkit';
import { appConfig } from './app.config';
import { WORKFLOW_TOUR_ID } from './workflow-tour';

describe('appConfig', () => {
  beforeEach(() => localStorage.clear());

  it('seeds the workflow tour during app initialization', async () => {
    const appRef = await createApplication(appConfig);
    const stored = await appRef.injector.get(TourStorageAdapter).getTour(WORKFLOW_TOUR_ID);
    appRef.destroy();

    expect(stored).not.toBeNull();
  });
});
