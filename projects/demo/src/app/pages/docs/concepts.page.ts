import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocCalloutComponent } from '../../shared/doc-callout.component';

@Component({
  selector: 'app-docs-concepts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DocCalloutComponent],
  template: `
    <h1>Concepts</h1>
    <p>
      Tours are versioned definitions made of ordered steps. The player resolves each step’s target,
      navigates if needed, then shows a spotlight and popover.
    </p>

    <h2>Tour definition</h2>
    <p>A <code>TourDefinition</code> includes:</p>
    <ul>
      <li><code>id</code>, <code>version</code>, <code>name</code>, <code>description</code></li>
      <li><code>status</code> — <code>draft</code> | <code>published</code> | <code>archived</code></li>
      <li><code>steps</code> — ordered list of <code>TourStep</code></li>
      <li>optional <code>audience</code> metadata and <code>autoLaunch</code></li>
      <li>timestamps and a schema version for durable persistence</li>
    </ul>

    <h2>Steps</h2>
    <p>Each step can declare:</p>
    <ul>
      <li><code>title</code> and plain-text <code>body</code> (never HTML — safer by default)</li>
      <li>optional <code>target</code> — an <code>ElementLocator</code></li>
      <li>optional <code>route</code> — Angular path the player navigates to first</li>
      <li><code>side</code> / <code>align</code> for popover placement</li>
      <li>optional <code>action</code> — replay <code>click</code> or <code>input</code> on advance</li>
      <li>optional <code>waitFor</code> — await an element before showing the step</li>
    </ul>

    <h2>Modal steps</h2>
    <p>
      Omit <code>target</code> for a centered modal with a full dim and <code>inert</code>
      background — useful for welcome and completion screens.
    </p>

    <h2>Player lifecycle</h2>
    <p>
      <code>TkTourService</code> exposes reactive signals for
      <code>state</code> (<code>idle</code> | <code>navigating</code> | <code>resolving</code> |
      <code>showing</code>), the active tour, step index, and current step. Call
      <code>start</code>, <code>next</code>, <code>prev</code>, or <code>dismiss</code>.
    </p>

    <app-doc-callout title="Cross-route tours" tone="note">
      When a step has a <code>route</code>, the player navigates first, waits for the target, then
      positions the highlight. That is the foundation of multi-page walkthroughs.
    </app-doc-callout>
  `,
})
export class ConceptsPage {}
