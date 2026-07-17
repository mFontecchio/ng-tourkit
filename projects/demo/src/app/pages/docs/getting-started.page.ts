import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlockComponent } from '../../shared/code-block.component';
import { DocCalloutComponent } from '../../shared/doc-callout.component';

@Component({
  selector: 'app-docs-getting-started',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CodeBlockComponent, DocCalloutComponent, RouterLink],
  template: `
    <h1>Getting started</h1>
    <p>
      ng-tourkit is a guided-tour library for Angular 20.3+ with no third-party runtime
      dependencies — only Angular peers and tslib.
    </p>

    <h2>Requirements</h2>
    <ul>
      <li>Angular <code>^20.3.0</code></li>
      <li>Standalone components (the library does not ship NgModules)</li>
    </ul>

    <h2>Install</h2>
    <app-code-block label="shell" [code]="install" />

    <h2>Provide the kit</h2>
    <p>
      Call <code>provideTourKit()</code> in your application config. LocalStorage adapters are the
      default — swap them for your backend in production.
    </p>
    <app-code-block label="app.config.ts" [code]="provide" />

    <h2>Start a tour</h2>
    <app-code-block label="TypeScript" [code]="start" />

    <h2>Recorder &amp; manage</h2>
    <p>
      Import recorder and manage only where needed. Lazy-load them in production so end users never
      download authoring UI.
    </p>
    <app-code-block label="TypeScript" [code]="recorder" />

    <app-doc-callout title="Try it live" tone="tip">
      The <a routerLink="/playground">playground</a> already wires providers, a role switcher, and
      a seeded workflow tour.
    </app-doc-callout>

    <h2>Entry points</h2>
    <div class="docs-table-wrap">
      <table class="docs-table">
        <thead>
          <tr>
            <th>Import</th>
            <th>Ships to</th>
            <th>Contents</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>&#64;mfontecchio/ng-tourkit</code></td>
            <td>End users</td>
            <td>Player, adapters, audience, auto-launch, theme</td>
          </tr>
          <tr>
            <td><code>&#64;mfontecchio/ng-tourkit/recorder</code></td>
            <td>Authors</td>
            <td>Visual recorder + capture</td>
          </tr>
          <tr>
            <td><code>&#64;mfontecchio/ng-tourkit/manage</code></td>
            <td>Admins</td>
            <td>Tour CRUD, audit, import/export</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class GettingStartedPage {
  protected readonly install = `npm install @mfontecchio/ng-tourkit`;

  protected readonly provide = `import { ApplicationConfig, inject } from '@angular/core';
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
    provideTourKit(),
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
};`;

  protected readonly start = `import { inject } from '@angular/core';
import { TkTourAutoLauncher, TkTourService } from '@mfontecchio/ng-tourkit';

inject(TkTourService).start(tour);

// after navigation (e.g. NavigationEnd)
inject(TkTourAutoLauncher).checkAndLaunch();`;

  protected readonly recorder = `import { Component, inject } from '@angular/core';
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
