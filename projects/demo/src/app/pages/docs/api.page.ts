import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocCalloutComponent } from '../../shared/doc-callout.component';

@Component({
  selector: 'app-docs-api',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocCalloutComponent, RouterLink],
  template: `
    <h1>API overview</h1>
    <p>
      A concise map of the public surface. For full signatures, see the package source and repository
      README.
    </p>

    <h2>Setup &amp; DI</h2>
    <ul>
      <li><code>provideTourKit(config?)</code> — storage, audit, audience, userId</li>
      <li><code>provideTourRecorder()</code></li>
      <li>Tokens: <code>TOUR_USER_ID</code>, <code>TOUR_AUDIENCE_RESOLVER</code></li>
    </ul>

    <h2>Player</h2>
    <ul>
      <li><code>TkTourService</code> — state signals + <code>start</code> / <code>next</code> / <code>prev</code> / <code>dismiss</code></li>
      <li><code>TkTourAutoLauncher</code>, <code>TkTourEligibility</code></li>
    </ul>

    <h2>Models</h2>
    <ul>
      <li><code>TourDefinition</code>, <code>TourStep</code>, <code>ElementLocator</code></li>
      <li><code>TourAuditEvent</code>, <code>TOUR_SCHEMA_VERSION</code></li>
      <li><code>validateTourDefinition</code>, <code>migrateTourDefinition</code></li>
    </ul>

    <h2>Audience &amp; persistence</h2>
    <ul>
      <li><code>roleAudienceResolver()</code>, <code>TourAudienceResolver</code></li>
      <li>
        <code>TourStorageAdapter</code>, <code>TourAuditAdapter</code>, LocalStorage implementations
      </li>
    </ul>

    <h2>Theming &amp; UI</h2>
    <ul>
      <li><code>TK_THEME_CSS</code>, <code>TkSelectComponent</code></li>
    </ul>

    <h2>Recorder</h2>
    <ul>
      <li><code>TkRecorderLauncher</code> — <code>open(tourId?)</code>, <code>close()</code></li>
      <li><code>TkCaptureService</code>, recorder panel components</li>
    </ul>

    <h2>Manage</h2>
    <ul>
      <li><code>TkTourManagerComponent</code> — CRUD, audit, import/export, <code>edit</code> output</li>
    </ul>

    <app-doc-callout title="Next steps" tone="note">
      Start with <a routerLink="/docs/getting-started">Getting started</a>, then explore the
      <a routerLink="/playground">playground</a>.
    </app-doc-callout>
  `,
})
export class ApiPage {}
