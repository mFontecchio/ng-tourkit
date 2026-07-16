import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TkTourOverlayComponent } from '../overlay/overlay.component';
import { TkTourPopoverComponent } from '../popover/popover.component';
import { TkTourService } from './tour.service';

/** Rendered once into document.body by TkTourService while a tour is active. */
@Component({
  selector: 'tk-tour-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TkTourOverlayComponent, TkTourPopoverComponent],
  template: `
    <tk-tour-overlay
      [stage]="tour.stage()"
      [padding]="8"
      [radius]="8"
      (overlayClick)="tour.dismiss()"
    />
    @if (tour.state() === 'showing' && tour.currentStep(); as step) {
      <tk-tour-popover
        [title]="step.title"
        [body]="step.body"
        [stepIndex]="tour.stepIndex()"
        [stepCount]="tour.stepCount()"
        [side]="step.side ?? 'bottom'"
        [align]="step.align ?? 'center'"
        [targetRect]="tour.stage()"
        [showPrev]="tour.stepIndex() > 0"
        (next)="tour.next()"
        (prev)="tour.prev()"
        (closed)="tour.dismiss()"
      />
    }
  `,
})
export class TkTourHostComponent {
  protected readonly tour = inject(TkTourService);
}
