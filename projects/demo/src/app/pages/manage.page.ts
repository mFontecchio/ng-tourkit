import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TourDefinition } from 'ng-tourkit';
import { TkTourManagerComponent } from 'ng-tourkit/manage';
import { TkRecorderLauncher } from 'ng-tourkit/recorder';

@Component({
  selector: 'app-manage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TkTourManagerComponent],
  template: `
    <h1>Manage tours</h1>
    <tk-tour-manager (edit)="editInRecorder($event)" />
  `,
})
export class ManagePage {
  private readonly recorder = inject(TkRecorderLauncher);

  protected editInRecorder(tour: TourDefinition): void {
    this.recorder.open(tour.id);
  }
}
