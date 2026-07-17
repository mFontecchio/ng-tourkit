# ng-tourkit

Guided tours for Angular 20.3+, with no third-party runtime dependencies — only
Angular peers (`@angular/core`, `@angular/common`, `@angular/router`) plus `tslib`.

Includes a visual recorder, resilient element targeting, audience rules, audit
trail, and a tour manager UI.

## Install

```sh
npm install @mfontecchio/ng-tourkit
```

**Requirements:** Angular `^20.3.0`, standalone components.

## Entry points

| Import | Use for |
|---|---|
| `ng-tourkit` | Tour player, storage/audit adapters, audience, auto-launch |
| `ng-tourkit/recorder` | Visual recorder (lazy-load in production) |
| `ng-tourkit/manage` | Admin tour table, audit view, import/export |

## Quick start

```ts
import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideTourKit,
  roleAudienceResolver,
  TOUR_AUDIENCE_RESOLVER,
  TOUR_USER_ID,
  TkTourAutoLauncher,
  TkTourService,
} from '@mfontecchio/ng-tourkit';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideTourKit(),
    { provide: TOUR_USER_ID, useFactory: () => () => inject(Auth).userId() },
    {
      provide: TOUR_AUDIENCE_RESOLVER,
      useFactory: () => roleAudienceResolver(() => inject(Auth).roles()),
    },
  ],
};

// after navigation settles
inject(TkTourAutoLauncher).checkAndLaunch();
inject(TkTourService).start(tour);
```

```ts
import { Component, inject } from '@angular/core';
import { TkTourManagerComponent } from '@mfontecchio/ng-tourkit/manage';
import { TkRecorderLauncher } from '@mfontecchio/ng-tourkit/recorder';

@Component({
  imports: [TkTourManagerComponent],
  template: `<tk-tour-manager (edit)="recorder.open($event.id)" />`,
})
export class ManagePage {
  readonly recorder = inject(TkRecorderLauncher);
}
```

For production, implement `TourStorageAdapter` and `TourAuditAdapter` against
your API and pass them to `provideTourKit({ storage, audit })`.

## Full documentation

See the [repository README](https://github.com/mFontecchio/ng-tourkit#readme) for
targeting details, accessibility notes, demo setup, and known limitations.

## Development

From the monorepo root:

```sh
npx ng build ng-tourkit   # output: dist/ng-tourkit
npm test                  # vitest (library + demo)
```

Tests use Vitest via Angular's experimental `unit-test` builder — not Karma.

## License

Source-available custom license (not OSI open source). Free to use in your apps,
including commercial ones, with attribution. Do not resell or directly monetize
this library. Full terms: [LICENSE](../../LICENSE).
