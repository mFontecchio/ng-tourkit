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
| `ng-tourkit` | end users | player runtime: overlay, popover, `TkTourService`, adapters, audience, auto-launch, shared UI theme + `TkSelectComponent` |
| `ng-tourkit/recorder` | authors only (lazy-load / dev builds) | visual recorder panel + capture engine |
| `ng-tourkit/manage` | admins | tour CRUD table, audit view, import/export |

## Quick start

```sh
npm install @mfontecchio/ng-tourkit
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
} from '@mfontecchio/ng-tourkit';

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
import { TkTourAutoLauncher, TkTourService } from '@mfontecchio/ng-tourkit';

inject(TkTourService).start(tour);

// auto-launch pending tours after navigation (e.g. on NavigationEnd)
inject(TkTourAutoLauncher).checkAndLaunch();
```

```ts
// recorder + manage (import only where needed; lazy-load in production)
import { Component, inject } from '@angular/core';
import { TkTourManagerComponent } from '@mfontecchio/ng-tourkit/manage';
import { TkRecorderLauncher } from '@mfontecchio/ng-tourkit/recorder';

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

## Responsive / mobile

All built-in surfaces are responsive down to phone widths (single `768px`
breakpoint):

- The player popover, recorder panel, and tour manager reflow for small screens
  and honor `env(safe-area-inset-*)` (notches, home indicators).
- Overlay stage and popover positioning track the `VisualViewport`, so steps stay
  aligned and fully on-screen during pinch-zoom, on-screen keyboard, or collapsing
  mobile browser chrome. When `VisualViewport` is unavailable, positioning falls
  back to the layout viewport.

## Theming

All built-in surfaces (player popover, recorder panel, tour manager) share a
dependency-free control theme. Override look globally via `--tk-*` CSS variables
on any host element:

```css
tk-tour-popover,
tk-tour-recorder-panel,
tk-tour-manager {
  --tk-color-accent: #7c3aed;
  --tk-radius-control: 10px;
}
```

Common tokens include `--tk-color-surface`, `--tk-color-text`, `--tk-color-border`,
`--tk-color-accent`, and `--tk-shadow-focus`. Surface-specific aliases (for example
`--tk-popover-bg`, `--tk-recorder-bg`, `--tk-manage-accent`) default to the shared
tokens.

For custom authoring UIs, the core package also exports:

- `TK_THEME_CSS` — a CSS string with defaults and reusable classes (`tk-input`,
  `tk-textarea`, `tk-btn`, `tk-field`, `tk-label`, `tk-check`).
- `TkSelectComponent` (`tk-select`) — accessible custom listbox select with fully
  styled options (no native browser dropdown).

```ts
import { TK_THEME_CSS, TkSelectComponent } from '@mfontecchio/ng-tourkit';
```

## Demo

From the repository root:

```sh
npm install
npm start                      # serves projects/demo (marketing + docs + playground)
npm test                       # vitest: ng-tourkit library + demo app
npx ng build ng-tourkit        # publishable package in dist/ng-tourkit
npm run build:demo:pages         # GitHub Pages build (base-href /ng-tourkit/)
```

The demo site includes marketing pages, guides with a light API overview, example
patterns, and an interactive `/playground` SaaS shell (multi-route pages, mock
user/role switcher, recorder button, manage page). It ships a bundled
"ng-tourkit workflow" tour (record → manage → play) that auto-launches on first
playground visit, and its shells are fully responsive with off-canvas nav on mobile.

## Known limitations (v1)

- Replayed input actions dispatch synthetic `input`/`change` events — fine for
  Angular forms, not for listeners requiring trusted events.
- Iframe content is out of scope; shadow DOM is supported via root overrides.
- Step text is plain text (rendered via interpolation, never HTML) — i18n hook TBD.
- LocalStorage adapters are dev/demo grade; bring your own backend for production.

## License

Source-available (custom; not OSI open source). You may use it free of charge,
including in commercial apps, with attribution. You may not resell or directly
monetize this library. Full terms: [LICENSE](LICENSE).

## Security

Report vulnerabilities privately — see [SECURITY.md](SECURITY.md). Do not open
public issues for security problems.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Release notes live in [CHANGELOG.md](CHANGELOG.md).
