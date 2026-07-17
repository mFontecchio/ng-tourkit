import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block.component';

@Component({
  selector: 'app-docs-manage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, RouterLink],
  template: `
    <h1>Tour manager</h1>
    <p>
      <code>TkTourManagerComponent</code> is the admin surface for tour lifecycle operations. Import
      it from <code>&#64;mfontecchio/ng-tourkit/manage</code>.
    </p>

    <h2>Embed the manager</h2>
    <app-code-block label="TypeScript" [code]="embed" />

    <h2>Capabilities</h2>
    <ul>
      <li>Table + responsive cards: name, status, version, step count, updated time</li>
      <li>Audit summary (started / completed) with expandable event log</li>
      <li>Run, Edit (hands off to recorder), Publish / Unpublish, Archive</li>
      <li>Duplicate, Export JSON, Import JSON (validated), Delete with confirm</li>
    </ul>

    <p>
      See it live under <a routerLink="/playground/manage">Playground → Manage Tours</a>.
    </p>
  `,
})
export class ManageDocPage {
  protected readonly embed = `import { Component, inject } from '@angular/core';
import { TkTourManagerComponent } from '@mfontecchio/ng-tourkit/manage';
import { TkRecorderLauncher } from '@mfontecchio/ng-tourkit/recorder';

@Component({
  imports: [TkTourManagerComponent],
  template: \`<tk-tour-manager (edit)="editTour($event)" />\`,
})
export class ManagePage {
  private readonly recorder = inject(TkRecorderLauncher);

  editTour(tour: { id: string }): void {
    this.recorder.open(tour.id);
  }
}`;
}
