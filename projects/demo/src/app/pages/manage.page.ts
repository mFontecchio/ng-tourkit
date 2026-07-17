import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TourDefinition } from '@mfontecchio/ng-tourkit';
import { TkTourManagerComponent } from '@mfontecchio/ng-tourkit/manage';
import { TkRecorderLauncher } from '@mfontecchio/ng-tourkit/recorder';

@Component({
  selector: 'app-manage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TkTourManagerComponent],
  template: `
    <div class="page-header">
      <h1 class="page-title" data-tour="manage-title">Manage Tours</h1>
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
