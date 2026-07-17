import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="mkt-hero">
      <div class="mkt-hero__atmosphere" aria-hidden="true"></div>
      <div class="mkt-hero__inner">
        <p class="mkt-hero__brand">ng-tourkit</p>
        <h1 class="mkt-hero__headline">Guided product tours for Angular — built for enterprise apps</h1>
        <p class="mkt-hero__lead">
          Zero third-party runtime dependencies. Record tours by clicking the real UI. Ship a
          resilient player with audience targeting, audit trails, and accessibility baked in.
        </p>
        <div class="mkt-hero__ctas">
          <a class="btn btn--primary" routerLink="/playground">Open playground</a>
          <a class="btn btn--ghost" routerLink="/docs">Read the docs</a>
        </div>
      </div>
    </section>

    <section class="mkt-section">
      <div class="mkt-section__inner">
        <h2 class="mkt-section__title">Why teams choose ng-tourkit</h2>
        <p class="mkt-section__lead">
          A focused Angular library — not another overlay stack bolted onto your app.
        </p>
        <div class="mkt-diff-grid">
          <article class="mkt-diff">
            <div class="mkt-diff__icon"><app-icon name="cube" size="1.25rem" /></div>
            <h3>Zero runtime dependencies</h3>
            <p>
              Only Angular peers and tslib. No Floating UI, Popper, driver.js, or RxJS inside the
              library.
            </p>
          </article>
          <article class="mkt-diff">
            <div class="mkt-diff__icon"><app-icon name="video" size="1.25rem" /></div>
            <h3>Record by clicking</h3>
            <p>
              PMs and BAs author tours against the live product. Quality badges flag fragile
              selectors before you publish.
            </p>
          </article>
          <article class="mkt-diff">
            <div class="mkt-diff__icon"><app-icon name="sparkles" size="1.25rem" /></div>
            <h3>Self-healing targets</h3>
            <p>
              Multi-candidate selectors plus structural fingerprint healing keep tours alive through
              redeploys.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="mkt-section mkt-section--muted">
      <div class="mkt-section__inner">
        <h2 class="mkt-section__title">How it works</h2>
        <p class="mkt-section__lead">Three entry points. One clear workflow.</p>
        <ol class="mkt-steps">
          <li>
            <span class="mkt-steps__num">1</span>
            <div>
              <strong>Record</strong>
              <p>Capture steps visually with the recorder panel — lazy-load it for authors only.</p>
            </div>
          </li>
          <li>
            <span class="mkt-steps__num">2</span>
            <div>
              <strong>Manage</strong>
              <p>Publish, version, import/export, and inspect engagement from the tour manager.</p>
            </div>
          </li>
          <li>
            <span class="mkt-steps__num">3</span>
            <div>
              <strong>Play</strong>
              <p>
                The player navigates routes, waits for targets, and highlights with an accessible
                popover.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="mkt-section">
      <div class="mkt-section__inner mkt-cta-band">
        <h2 class="mkt-section__title">Try it in the playground</h2>
        <p class="mkt-section__lead">
          A live SaaS-style demo with role switching, the visual recorder, and a seeded workflow
          tour.
        </p>
        <a class="btn btn--primary" routerLink="/playground">Open playground</a>
      </div>
    </section>
  `,
})
export class LandingPage {}
