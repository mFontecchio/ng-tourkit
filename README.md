# ng-tourkit

Guided tours for Angular 20.3+, with no third-party runtime dependencies — only
Angular peers (`@angular/core`, `@angular/common`, `@angular/router`) plus `tslib`.
No driver.js, no floating-ui, no RxJS in the library itself.

Includes a built-in visual recorder so PMs, BAs and other non-developers create
and maintain tours by clicking around the real app.

## Requirements

- Angular `^20.3.0`
- Standalone components (the library does not ship NgModules)

## Entry points

| Import | Ships to | Contents |
|---|---|---|
| `ng-tourkit` | end users | player runtime: overlay, popover, `TkTourService`, adapters, audience, auto-launch |
| `ng-tourkit/recorder` | authors only (lazy-load / dev builds) | visual recorder panel + capture engine |
| `ng-tourkit/manage` | admins | tour CRUD table, audit view, import/export |

## Quick start

```sh
npm install ng-tourkit
```

```ts
// app.config.ts
import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideTourKit,
  roleAudienceResolver,
  TOUR_AUDIENCE_RESOLVER,
  TOUR_USER_ID,
} from 'ng-tourkit';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideTourKit(), // localStorage adapters by default — swap for your backend
    {
      provide: TOUR_USER_ID,
      useFactory: () => {
        const auth = inject(Auth);
        return () => auth.userId();
      },
    },
    {
      provide: TOUR_AUDIENCE_RESOLVER,
      useFactory: () => {
        const auth = inject(Auth);
        return roleAudienceResolver(() => auth.roles());
      },
    },
  ],
};
```

```ts
// run a tour
import { inject } from '@angular/core';
import { TkTourAutoLauncher, TkTourService } from 'ng-tourkit';

inject(TkTourService).start(tour);

// auto-launch pending tours after navigation (e.g. on NavigationEnd)
inject(TkTourAutoLauncher).checkAndLaunch();
```

```ts
// recorder + manage (import only where needed; lazy-load in production)
import { Component, inject } from '@angular/core';
import { TkTourManagerComponent } from 'ng-tourkit/manage';
import { TkRecorderLauncher } from 'ng-tourkit/recorder';

@Component({
  imports: [TkTourManagerComponent],
  template: `<tk-tour-manager (edit)="editTour($event)" />`,
})
export class ManagePage {
  private readonly recorder = inject(TkRecorderLauncher);

  editTour(tour: { id: string }): void {
    this.recorder.open(tour.id);
  }
}

// gate recorder.open() behind your own role check
inject(TkRecorderLauncher).open();        // create a new tour
inject(TkRecorderLauncher).open(tourId);  // edit an existing tour
```

## Production persistence

Implement the two abstract adapters against your API and pass them to `provideTourKit`:

```ts
class HttpTourStorage extends TourStorageAdapter { /* listTours/getTour/saveTour/deleteTour */ }
class HttpTourAudit extends TourAuditAdapter { /* recordEvent/getEvents/hasCompleted */ }

provideTourKit({ storage: HttpTourStorage, audit: HttpTourAudit })
```

Audit events (`started`, `step_viewed`, `completed`, `dismissed`) carry
`tourId`, `tourVersion`, `userId`, `stepId`, timestamps — enough to answer
"has this user completed training X at version >= N?" via `hasCompleted`.

## How element targeting stays robust

Each recorded step stores an `ElementLocator`:

- **Multi-candidate selectors**, most stable first: `data-tour`/`data-testid` ->
  human `#id` (GUID-like ids are rejected) -> `aria-label`/`role` -> word-like
  attributes -> text content -> penalty-scored CSS path -> structural `nth-of-type`
  fallback. Every CSS candidate is verified *unique* at record time.
- **A DOM fingerprint** (tag, text, stable attributes, depth, sibling index,
  ancestry). If every selector breaks after a redeploy, the resolver
  fuzzy-matches the fingerprint (>= 0.75 similarity) and heals the step.
- **Async waits**: if the target is not there yet, a `MutationObserver` retries
  until timeout, and `Element.checkVisibility()` filters hidden matches.

The recorder shows a live quality badge (stable / ok / fragile) while hovering and
suggests adding a `data-tour` attribute when targeting would be fragile.

## Accessibility

- APG modal-dialog pattern: `role="dialog"`, `aria-modal`, focus trap with wrap,
  focus restore, Escape to dismiss.
- Off-screen `aria-live="polite"` announcements per step ("Step 2 of 5: ...").
- `inert` background for modal steps; `prefers-reduced-motion` disables the
  overlay stage animation and smooth scrolling.

## Demo

From the repository root:

```sh
npm install
npm start                      # serves projects/demo
npm test                       # vitest: ng-tourkit library + demo app
npx ng build ng-tourkit        # publishable package in dist/ng-tourkit
npm run build:demo:pages         # GitHub Pages build (base-href /ng-tourkit/)
```

The demo has multi-route pages, a mock user/role switcher (audience targeting),
a recorder button and a manage page.

## Known limitations (v1)

- Replayed input actions dispatch synthetic `input`/`change` events — fine for
  Angular forms, not for listeners requiring trusted events.
- Iframe content is out of scope; shadow DOM is supported via root overrides.
- Step text is plain text (rendered via interpolation, never HTML) — i18n hook TBD.
- LocalStorage adapters are dev/demo grade; bring your own backend for production.
