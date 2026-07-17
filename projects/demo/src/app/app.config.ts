import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { TOUR_AUDIENCE_RESOLVER, TOUR_USER_ID, provideTourKit, roleAudienceResolver } from '@mfontecchio/ng-tourkit';

import { routes } from './app.routes';
import { DemoUser } from './demo-user.service';
import { DemoTourSeeder } from './demo-tour-seeder';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideTourKit(),
    provideAppInitializer(() => inject(DemoTourSeeder).seed()),
    {
      provide: TOUR_AUDIENCE_RESOLVER,
      useFactory: () => {
        const user = inject(DemoUser);
        return roleAudienceResolver(() => user.roles());
      },
    },
    {
      provide: TOUR_USER_ID,
      useFactory: () => {
        const user = inject(DemoUser);
        return () => user.userId();
      },
    },
  ],
};
