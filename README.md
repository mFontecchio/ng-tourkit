# ng-tourkit

Zero-dependency guided tours for Angular 20+ - with a built-in visual recorder so
PMs, BAs and other non-developers create and maintain tours by clicking around the
real app. No driver.js, no floating-ui, no rxjs: peer deps are @angular/core,
@angular/common and @angular/router only.

## Entry points

| Import | Ships to | Contents |
|---|---|---|
| `ng-tourkit` | end users | player runtime: overlay, popover, `TkTourService`, adapters, audience, auto-launch |
| `ng-tourkit/recorder` | authors only (lazy-load / dev builds) | visual recorder panel + capture engine |
| `ng-tourkit/manage` | admins | tour CRUD table, audit view, import/export |

## Quick start

```ts
// app.config.ts
import { provideTourKit, roleAudienceResolver, TOUR_AUDIENCE_RESOLVER, TOUR_USER_ID } from 'ng-tourkit';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideTourKit(), // localStorage adapters by default - swap for your backend
    { provide: TOUR_USER_ID, useFactory: () => { const auth = inject(Auth); return () => auth.userId(); } },
    { provide: TOUR_AUDIENCE_RESOLVER, useFactory: () => { const auth = inject(Auth); return roleAudienceResolver(() => auth.roles()); } },
  ],
};
```

```ts
// run a tour
inject(TkTourService).start(tour);

// auto-launch pending tours after navigation
inject(TkTourAutoLauncher).checkAndLaunch();

// open the recorder (gate this behind your own role check)
inject(TkRecorderLauncher).open();        // from 'ng-tourkit/recorder'
inject(TkRecorderLauncher).open(tourId);  // edit an existing tour
```

```html
<!-- admin page -->
<tk-tour-manager (edit)="recorder.open($event.id)" />
```

## Production persistence

Implement the two abstract adapters against your API and pass them to provideTourKit:

```ts
class HttpTourStorage extends TourStorageAdapter { /* listTours/getTour/saveTour/deleteTour */ }
class HttpTourAudit extends TourAuditAdapter { /* recordEvent/getEvents/hasCompleted */ }

provideTourKit({ storage: HttpTourStorage, audit: HttpTourAudit })
```

Audit events (started, step_viewed, completed, dismissed) carry
tourId, tourVersion, userId, stepId, timestamps - enough to answer
"has this user completed training X at version >= N?" via hasCompleted.

## How element targeting stays robust

Each recorded step stores an ElementLocator:

- **Multi-candidate selectors**, most stable first: data-tour/data-testid ->
  human #id (GUID-like ids are rejected) -> aria-label/role -> word-like
  attributes -> text content -> penalty-scored CSS path -> structural nth-of-type
  fallback. Every CSS candidate is verified *unique* at record time.
- **A DOM fingerprint** (tag, text, stable attributes, depth, sibling index,
  ancestry). If every selector breaks after a redeploy, the resolver
  fuzzy-matches the fingerprint (>= 0.75 similarity) and heals the step.
- **Async waits**: if the target is not there yet, a MutationObserver retries
  until timeout, and Element.checkVisibility() filters hidden matches.

The recorder shows a live quality badge (stable / ok / fragile) while hovering and
suggests adding a data-tour attribute when targeting would be fragile.

## Accessibility

- APG modal-dialog pattern: role="dialog", aria-modal, focus trap with wrap,
  focus restore, Escape to dismiss.
- Off-screen aria-live="polite" announcements per step ("Step 2 of 5: ...").
- inert background for modal steps; prefers-reduced-motion disables the
  overlay stage animation and smooth scrolling.

## Demo

```sh
npm start                # serves projects/demo
npm test                 # ng test ng-tourkit (vitest, all entry points)
npx ng build ng-tourkit  # publishable package in dist/ng-tourkit
```

The demo has multi-route pages, a mock user/role switcher (audience targeting),
a recorder button and a manage page.

## Known limitations (v1)

- Replayed input actions dispatch synthetic input/change events - fine for
  Angular forms, not for listeners requiring trusted events.
- Iframe content is out of scope; shadow DOM is supported via root overrides.
- Step text is plain text (rendered via interpolation, never HTML) - i18n hook TBD.
- LocalStorage adapters are dev/demo grade; bring your own backend for production.
