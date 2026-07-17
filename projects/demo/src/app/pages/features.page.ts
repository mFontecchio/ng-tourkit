import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const PILLARS = [
  {
    title: 'Tour player',
    body: 'Signal-based player with cross-route navigation, spotlight overlay, smart popover positioning, and keyboard control. Auto-mounts into the document — no wrapper required.',
  },
  {
    title: 'Visual recorder',
    body: 'Hover to highlight, click to capture. Edit titles, sides, wait timeouts, and click actions. Live quality badges (stable / ok / fragile) keep targeting durable.',
  },
  {
    title: 'Tour manager',
    body: 'Admin table for draft → published → archived lifecycle, duplicate, import/export JSON, and expandable audit logs per tour.',
  },
  {
    title: 'Resilient targeting',
    body: 'Selector cascade from data-tour through structural fallbacks, uniqueness checks at record time, MutationObserver waits, and fingerprint healing after redeploys.',
  },
  {
    title: 'Audience & auto-launch',
    body: 'Plug in your auth with TOUR_AUDIENCE_RESOLVER. Role helpers, eligibility checks, and once-per-user-per-version auto-launch via the audit trail.',
  },
  {
    title: 'Accessibility & mobile',
    body: 'Focus trap, inert backgrounds, live announcements, reduced-motion support, VisualViewport tracking, and safe-area insets on every built-in surface.',
  },
  {
    title: 'Theming & adapters',
    body: 'Override --tk-* tokens for popover, recorder, and manager. Swap LocalStorage adapters for your HTTP backend with provideTourKit.',
  },
] as const;

@Component({
  selector: 'app-features',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="mkt-page-hero">
      <div class="mkt-section__inner">
        <p class="mkt-eyebrow">Features</p>
        <h1 class="mkt-page-hero__title">Everything you need to ship guided tours</h1>
        <p class="mkt-page-hero__lead">
          Player, recorder, and manager — packaged as separate entry points so production stays
          lean.
        </p>
      </div>
    </section>

    @for (pillar of pillars; track pillar.title; let odd = $odd) {
      <section class="mkt-section" [class.mkt-section--muted]="odd">
        <div class="mkt-section__inner mkt-pillar">
          <h2 class="mkt-section__title">{{ pillar.title }}</h2>
          <p class="mkt-pillar__body">{{ pillar.body }}</p>
        </div>
      </section>
    }

    <section class="mkt-section">
      <div class="mkt-section__inner mkt-cta-band">
        <h2 class="mkt-section__title">See it running</h2>
        <p class="mkt-section__lead">Explore the interactive demo or dig into the guides.</p>
        <div class="mkt-hero__ctas">
          <a class="btn btn--primary" routerLink="/playground">Open playground</a>
          <a class="btn btn--ghost" routerLink="/docs">Read the docs</a>
        </div>
      </div>
    </section>
  `,
})
export class FeaturesPage {
  protected readonly pillars = PILLARS;
}
