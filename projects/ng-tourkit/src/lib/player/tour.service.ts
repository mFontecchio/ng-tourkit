import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  Signal,
  computed,
  createComponent,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { StepAction, TourDefinition, TourStep } from '../models/tour.models';
import { LocatorTimeoutError, TkSelectorResolver } from '../locator/selector-resolver';
import { TkStageTracker } from '../overlay/stage-tracker';
import { StageRect } from '../overlay/stage-path';
import { bringInView } from '../overlay/scroll-into-view';
import { TkLiveAnnouncer } from '../a11y/live-announcer';
import { applyInert } from '../a11y/inert-manager';
import { TourAuditAdapter } from '../persistence/adapters';
import { TOUR_USER_ID } from '../persistence/provide-tour-kit';
import { TkTourHostComponent } from './tour-host.component';

export type TourPlayerState = 'idle' | 'navigating' | 'resolving' | 'showing';

export interface StartTourOptions {
  /** What to do when a step target cannot be resolved. Default 'skip'. */
  onStepError?: 'skip' | 'abort';
  /** Per-step resolve timeout in ms. Default 5000 (step.waitFor.timeoutMs wins). */
  timeoutMs?: number;
  /** Start at this step index. Default 0. */
  startAt?: number;
}

@Injectable({ providedIn: 'root' })
export class TkTourService {
  private readonly resolver = inject(TkSelectorResolver);
  private readonly tracker = inject(TkStageTracker);
  private readonly announcer = inject(TkLiveAnnouncer);
  private readonly audit = inject(TourAuditAdapter);
  private readonly userId = inject(TOUR_USER_ID);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router, { optional: true });

  readonly state = signal<TourPlayerState>('idle');
  readonly activeTour = signal<TourDefinition | null>(null);
  readonly stepIndex = signal(0);
  readonly stepCount = computed(() => this.activeTour()?.steps.length ?? 0);
  readonly currentStep = computed<TourStep | null>(
    () => this.activeTour()?.steps[this.stepIndex()] ?? null,
  );

  private readonly stageSource = signal<Signal<StageRect> | null>(null);
  /** Highlight rect for the current step's target; null = modal step (full dim). */
  readonly stage = computed<StageRect | null>(() => this.stageSource()?.() ?? null);

  private hostRef: ComponentRef<TkTourHostComponent> | null = null;
  private resolvedTarget: HTMLElement | null = null;
  private removeInert: (() => void) | null = null;
  private options: Required<Pick<StartTourOptions, 'onStepError' | 'timeoutMs'>> = {
    onStepError: 'skip',
    timeoutMs: 5000,
  };
  /** Generation counter: invalidates in-flight async step work after navigation/teardown. */
  private generation = 0;

  async start(tour: TourDefinition, opts: StartTourOptions = {}): Promise<void> {
    if (this.activeTour()) this.teardown();
    if (tour.steps.length === 0) return;
    this.options = {
      onStepError: opts.onStepError ?? 'skip',
      timeoutMs: opts.timeoutMs ?? 5000,
    };
    this.activeTour.set(tour);
    this.mountHost();
    void this.record('started');
    await this.showStep(opts.startAt ?? 0);
  }

  async next(): Promise<void> {
    const step = this.currentStep();
    if (!step || this.state() !== 'showing') return;
    if (step.action && this.resolvedTarget) this.executeAction(step.action, this.resolvedTarget);
    if (this.stepIndex() + 1 >= this.stepCount()) {
      void this.record('completed');
      this.teardown();
      return;
    }
    await this.showStep(this.stepIndex() + 1);
  }

  async prev(): Promise<void> {
    if (this.stepIndex() === 0 || this.state() !== 'showing') return;
    await this.showStep(this.stepIndex() - 1);
  }

  dismiss(): void {
    if (!this.activeTour()) return;
    void this.record('dismissed');
    this.teardown();
  }

  private async showStep(index: number): Promise<void> {
    const tour = this.activeTour();
    const step = tour?.steps[index];
    if (!tour || !step) return;
    const gen = ++this.generation;

    this.stepIndex.set(index);
    this.tracker.stop();
    this.stageSource.set(null);
    this.resolvedTarget = null;
    this.removeInert?.();
    this.removeInert = null;

    try {
      if (step.route && this.router) {
        const current = this.router.url.split('?')[0];
        if (current !== step.route) {
          this.state.set('navigating');
          await this.router.navigateByUrl(step.route);
          if (gen !== this.generation) return;
        }
      }

      this.state.set('resolving');

      if (step.waitFor?.locator && step.waitFor.locator !== step.target) {
        await this.resolver.resolve(step.waitFor.locator, {
          timeoutMs: step.waitFor.timeoutMs ?? this.options.timeoutMs,
        });
        if (gen !== this.generation) return;
      }

      if (step.target) {
        const result = await this.resolver.resolve(step.target, {
          timeoutMs: step.waitFor?.timeoutMs ?? this.options.timeoutMs,
        });
        if (gen !== this.generation) return;
        this.resolvedTarget = result.element;
        bringInView(result.element);
        this.stageSource.set(this.tracker.track(result.element));
      } else if (this.hostRef) {
        // Modal step: background fully dimmed and inert.
        this.removeInert = applyInert([this.hostRef.location.nativeElement as HTMLElement]);
      }

      this.state.set('showing');
      this.announcer.announce(`Step ${index + 1} of ${tour.steps.length}: ${step.title}`);
      void this.record('step_viewed', step.id, index);
    } catch (err) {
      if (gen !== this.generation) return;
      if (err instanceof LocatorTimeoutError) {
        console.warn(`[ng-tourkit] step "${step.id}" target not found`, err.locator);
        if (this.options.onStepError === 'skip' && index + 1 < tour.steps.length) {
          await this.showStep(index + 1);
        } else {
          void this.record('dismissed', step.id, index);
          this.teardown();
        }
        return;
      }
      throw err;
    }
  }

  private executeAction(action: StepAction, el: HTMLElement): void {
    if (action.kind === 'click') {
      el.click();
      return;
    }
    // ponytail: synthetic events aren't "trusted" — enough for Angular forms, not for native-only listeners.
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.value = action.value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  private mountHost(): void {
    if (this.hostRef) return;
    this.hostRef = createComponent(TkTourHostComponent, { environmentInjector: this.injector });
    this.appRef.attachView(this.hostRef.hostView);
    this.document.body.appendChild(this.hostRef.location.nativeElement);
  }

  private teardown(): void {
    this.generation++;
    this.tracker.stop();
    this.removeInert?.();
    this.removeInert = null;
    this.stageSource.set(null);
    this.resolvedTarget = null;
    this.hostRef?.destroy();
    this.hostRef = null;
    this.activeTour.set(null);
    this.stepIndex.set(0);
    this.state.set('idle');
  }

  private record(type: 'started' | 'step_viewed' | 'completed' | 'dismissed', stepId?: string, stepIndex?: number): Promise<void> {
    const tour = this.activeTour();
    if (!tour) return Promise.resolve();
    return this.audit
      .recordEvent({
        tourId: tour.id,
        tourVersion: tour.version,
        userId: this.userId(),
        type,
        stepId,
        stepIndex,
        at: new Date().toISOString(),
      })
      .catch(err => console.warn('[ng-tourkit] audit write failed', err));
  }
}
