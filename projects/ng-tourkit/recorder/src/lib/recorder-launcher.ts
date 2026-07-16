import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  EnvironmentProviders,
  Injectable,
  createComponent,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TkCaptureService } from './capture.service';
import { TkRecorderHighlightComponent } from './recorder-highlight.component';
import { TkTourRecorderPanelComponent } from './recorder-panel.component';

@Injectable({ providedIn: 'root' })
export class TkRecorderLauncher {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly capture = inject(TkCaptureService);
  private panelRef: ComponentRef<TkTourRecorderPanelComponent> | null = null;
  private highlightRef: ComponentRef<TkRecorderHighlightComponent> | null = null;

  open(tourId?: string): void {
    // ponytail: one recorder panel per app; add panel ids only if multi-window recording appears.
    if (this.panelRef) {
      if (tourId) void this.panelRef.instance.loadTour(tourId);
      return;
    }
    this.highlightRef = createComponent(TkRecorderHighlightComponent, { environmentInjector: this.injector });
    this.panelRef = createComponent(TkTourRecorderPanelComponent, { environmentInjector: this.injector });
    this.panelRef.instance.closed.subscribe(() => this.close());
    this.appRef.attachView(this.highlightRef.hostView);
    this.appRef.attachView(this.panelRef.hostView);
    this.document.body.append(this.highlightRef.location.nativeElement, this.panelRef.location.nativeElement);
    if (tourId) void this.panelRef.instance.loadTour(tourId);
  }

  close(): void {
    this.capture.stop();
    this.destroy(this.panelRef);
    this.destroy(this.highlightRef);
    this.panelRef = null;
    this.highlightRef = null;
  }

  private destroy(ref: ComponentRef<unknown> | null): void {
    if (!ref) return;
    this.appRef.detachView(ref.hostView);
    ref.destroy();
  }
}

export function provideTourRecorder(): EnvironmentProviders {
  return makeEnvironmentProviders([TkRecorderLauncher]);
}
