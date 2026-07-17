import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const EXAMPLES = [
  {
    title: 'Onboarding auto-launch',
    body: 'Publish a tour with autoLaunch and wire TkTourAutoLauncher on NavigationEnd. New users see guidance once per tour version.',
    cta: '/playground',
    ctaLabel: 'Try in playground',
  },
  {
    title: 'Role-targeted announcement',
    body: 'Attach audience metadata and resolve roles via TOUR_AUDIENCE_RESOLVER. Switch demo roles in the playground to see eligibility change live.',
    cta: '/playground',
    ctaLabel: 'Switch roles in playground',
  },
  {
    title: 'Cross-route walkthrough',
    body: 'Each step declares a route. The player navigates first, waits for the target, then positions the highlight — ideal for multi-page workflows.',
    cta: '/playground',
    ctaLabel: 'Run the workflow tour',
  },
  {
    title: 'Interactive step actions',
    body: 'Replay click or input on the target when advancing so tours can drive wizards and forms without leaving the user stranded.',
    cta: '/docs/concepts',
    ctaLabel: 'Read about step actions',
  },
  {
    title: 'Modal welcome',
    body: 'Omit the target for a centered modal step with a fully dimmed, inert background — perfect for kickoff or completion screens.',
    cta: '/docs/concepts',
    ctaLabel: 'See modal steps',
  },
] as const;

@Component({
  selector: 'app-examples',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="mkt-page-hero">
      <div class="mkt-section__inner">
        <p class="mkt-eyebrow">Examples</p>
        <h1 class="mkt-page-hero__title">Patterns you can ship tomorrow</h1>
        <p class="mkt-page-hero__lead">
          Common tour shapes used in enterprise Angular products — each backed by the playground or
          docs.
        </p>
      </div>
    </section>

    <section class="mkt-section">
      <div class="mkt-section__inner">
        <div class="mkt-example-list">
          @for (ex of examples; track ex.title) {
            <article class="mkt-example">
              <h2>{{ ex.title }}</h2>
              <p>{{ ex.body }}</p>
              <a class="btn btn--ghost btn--sm" [routerLink]="ex.cta">{{ ex.ctaLabel }}</a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class ExamplesPage {
  protected readonly examples = EXAMPLES;
}
