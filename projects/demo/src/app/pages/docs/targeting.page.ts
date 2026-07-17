import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocCalloutComponent } from '../../shared/doc-callout.component';

@Component({
  selector: 'app-docs-targeting',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocCalloutComponent],
  template: `
    <h1>Targeting</h1>
    <p>
      Each recorded step stores an <code>ElementLocator</code> — a cascade of selectors plus a DOM
      fingerprint — so tours survive UI churn.
    </p>

    <h2>Selector cascade</h2>
    <p>Candidates are ordered most → least stable:</p>
    <ol>
      <li><code>data-tour</code> / <code>data-testid</code></li>
      <li>Human <code>#id</code> (GUID-like ids are rejected)</li>
      <li><code>aria-label</code> / <code>role</code></li>
      <li>Word-like attributes</li>
      <li>Text content</li>
      <li>Penalty-scored CSS path</li>
      <li>Structural <code>nth-of-type</code> fallback</li>
    </ol>
    <p>Every CSS candidate is verified unique at record time.</p>

    <h2>Fingerprint healing</h2>
    <p>
      If every selector fails after a redeploy, the resolver fuzzy-matches the fingerprint (tag,
      text, stable attributes, depth, sibling index, ancestry) at ≥ 0.75 similarity and heals the
      step.
    </p>

    <h2>Async waits</h2>
    <p>
      When the target is not present yet, a <code>MutationObserver</code> retries until timeout.
      Hidden matches are filtered with <code>Element.checkVisibility()</code>.
    </p>

    <app-doc-callout title="Best practice" tone="tip">
      Prefer stable <code>data-tour</code> attributes on important UI. The demo uses them throughout
      the playground shell.
    </app-doc-callout>
  `,
})
export class TargetingPage {}
