import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DocCalloutComponent } from '../../shared/doc-callout.component';

@Component({
  selector: 'app-docs-audience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, DocCalloutComponent, RouterLink],
  template: `
    <h1>Audience &amp; auto-launch</h1>
    <p>
      Show the right tour to the right user. Eligibility and auto-launch are built on pluggable
      identity and an audit trail.
    </p>

    <h2>Wire identity</h2>
    <app-code-block label="app.config.ts" [code]="identity" />

    <h2>Eligibility</h2>
    <p>
      <code>TkTourEligibility</code> exposes <code>isEligible</code>,
      <code>shouldAutoLaunch</code>, and <code>eligibleTours</code> (published + audience match +
      not yet completed).
    </p>

    <h2>Auto-launch</h2>
    <p>
      Call <code>TkTourAutoLauncher.checkAndLaunch()</code> after login or on
      <code>NavigationEnd</code>. Auto-launch runs <strong>once per user per tour version</strong>,
      deduped via the audit adapter.
    </p>

    <app-doc-callout title="Playground" tone="tip">
      Switch user and role in the
      <a routerLink="/playground">playground</a> top bar to see audience gating change live.
    </app-doc-callout>

    <h2>Production persistence</h2>
    <p>Implement adapters against your API:</p>
    <app-code-block label="TypeScript" [code]="adapters" />
    <p>
      Audit events (<code>started</code>, <code>step_viewed</code>, <code>completed</code>,
      <code>dismissed</code>) carry tour id, version, user id, step id, and timestamps.
    </p>
  `,
})
export class AudiencePage {
  protected readonly identity = `{
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
}`;

  protected readonly adapters = `class HttpTourStorage extends TourStorageAdapter { /* … */ }
class HttpTourAudit extends TourAuditAdapter { /* … */ }

provideTourKit({ storage: HttpTourStorage, audit: HttpTourAudit });`;
}
