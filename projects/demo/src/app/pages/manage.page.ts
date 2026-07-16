import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TourDefinition } from 'ng-tourkit';
import { TkTourManagerComponent } from 'ng-tourkit/manage';
import { TkRecorderLauncher } from 'ng-tourkit/recorder';

@Component({
  selector: 'app-manage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TkTourManagerComponent],
  template: `
    <div class="page-header">
      <h1 class="page-title">Manage Tours</h1>
      <p class="page-sub">
        Create, edit, publish and audit guided tours.
        Use the <strong>Record</strong> button to build new tours visually.
      </p>
    </div>
    <tk-tour-manager (edit)="editInRecorder($event)" />
  `,
  styles: ``,
})
export class ManagePage {
  private readonly recorder = inject(TkRecorderLauncher);

  protected editInRecorder(tour: TourDefinition): void {
    this.recorder.open(tour.id);
  }
}
