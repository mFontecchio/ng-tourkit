import { ChangeDetectionStrategy, Component, computed, effect, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ElementLocator,
  PopoverSide,
  TOUR_SCHEMA_VERSION,
  TourDefinition,
  TourStatus,
  TourStep,
  TourStorageAdapter,
  TkTourService,
  scoreQuality,
  validateTourDefinition,
} from 'ng-tourkit';
import { LocatorQuality, PickedElement, TkCaptureService } from './capture.service';

type StepSide = Exclude<PopoverSide, 'over'>;

interface StepForm {
  readonly index: number | null;
  readonly target: ElementLocator | null;
  readonly quality: LocatorQuality | null;
  readonly title: string;
  readonly body: string;
  readonly side: StepSide;
  readonly clickAction: boolean;
  readonly waitTimeout: number | null;
  readonly route: string | undefined;
}

const sides: readonly StepSide[] = ['top', 'right', 'bottom', 'left'];

@Component({
  selector: 'tk-tour-recorder-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-tk-recorder': '', '[attr.aria-label]': '"Tour recorder"' },
  template: `
    <section class="panel">
      <header>
        <strong>Tour recorder</strong>
        <button type="button" (click)="closed.emit()">×</button>
      </header>

      @if (issues().length) {
        <ul class="issues">
          @for (issue of issues(); track issue.path + issue.message) {
            <li>{{ issue.path }} {{ issue.message }}</li>
          }
        </ul>
      }

      <label>
        Name
        <input [value]="name()" (input)="setName($event)" />
      </label>

      <div class="row">
        <button type="button" (click)="addStep()">Add step</button>
        <button type="button" (click)="addModalStep()">Add modal step</button>
      </div>

      <label>
        Load existing tour
        <select [value]="selectedTourId()" (change)="loadSelected($event)">
          <option value="">Select…</option>
          @for (tour of tours(); track tour.id) {
            <option [value]="tour.id">{{ tour.name }} v{{ tour.version }} ({{ tour.status }})</option>
          }
        </select>
      </label>

      @if (capture.mode() === 'pick') {
        <p class="hint">Click a target in the app.</p>
      }

      @if (form(); as f) {
        <form class="step-form" (submit)="saveStep($event)">
          <strong>{{ f.index === null ? 'New step' : 'Edit step' }}</strong>
          @if (f.quality) {
            <span class="quality" [class]="f.quality">{{ f.quality }}</span>
          } @else {
            <span class="quality modal">modal</span>
          }
          <label>
            Title
            <input [value]="f.title" (input)="patchForm({ title: text($event) })" />
          </label>
          <label>
            Body
            <textarea [value]="f.body" (input)="patchForm({ body: text($event) })"></textarea>
          </label>
          @if (f.target) {
            <label>
              Side
              <select [value]="f.side" (change)="patchForm({ side: side($event) })">
                @for (side of sideOptions; track side) {
                  <option [value]="side">{{ side }}</option>
                }
              </select>
            </label>
            <label class="check">
              <input type="checkbox" [checked]="f.clickAction" (change)="patchForm({ clickAction: checked($event) })" />
              click this element on Next
            </label>
            <label>
              Wait timeout ms
              <input type="number" min="0" [value]="f.waitTimeout ?? ''" (input)="patchForm({ waitTimeout: numberOrNull($event) })" />
            </label>
          }
          <div class="row">
            <button type="submit">Save step</button>
            <button type="button" (click)="cancelForm()">Cancel</button>
          </div>
        </form>
      }

      <ol class="steps">
        @for (step of steps(); track step.id; let i = $index) {
          <li>
            <span>{{ i + 1 }}. {{ step.title || '(untitled)' }}</span>
            <span class="quality" [class]="stepQuality(step)">{{ stepQuality(step) }}</span>
            <div class="row">
              <button type="button" (click)="moveStep(i, -1)" [disabled]="i === 0">↑</button>
              <button type="button" (click)="moveStep(i, 1)" [disabled]="i === steps().length - 1">↓</button>
              <button type="button" (click)="editStep(i)">Edit</button>
              <button type="button" (click)="deleteStep(i)">Delete</button>
            </div>
          </li>
        }
      </ol>

      <footer class="row">
        <button type="button" (click)="preview()">Preview</button>
        <button type="button" (click)="saveDraft()">Save draft</button>
        <button type="button" (click)="publish()">Publish</button>
        <button type="button" (click)="newTour()">New tour</button>
      </footer>
    </section>
  `,
  styles: [
    `
      :host {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 10003;
        font-family: system-ui, sans-serif;
        color: var(--tk-recorder-text, #111827);
      }
      .panel {
        width: var(--tk-recorder-width, 320px);
        max-height: 70vh;
        overflow: auto;
        display: grid;
        gap: 10px;
        padding: 12px;
        border: 1px solid var(--tk-recorder-border, #d1d5db);
        border-radius: 12px;
        background: var(--tk-recorder-bg, #fff);
        box-shadow: 0 20px 40px #0003;
      }
      header,
      .row,
      footer {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      header {
        justify-content: space-between;
      }
      label,
      .step-form {
        display: grid;
        gap: 4px;
      }
      input,
      textarea,
      select,
      button {
        font: inherit;
      }
      textarea {
        min-height: 56px;
        resize: vertical;
      }
      button {
        border: 1px solid var(--tk-recorder-border, #d1d5db);
        border-radius: 8px;
        background: var(--tk-recorder-button, #f9fafb);
        padding: 4px 8px;
      }
      .check {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .issues {
        margin: 0;
        padding: 8px 8px 8px 24px;
        border-radius: 8px;
        background: #fef2f2;
        color: #991b1b;
      }
      .hint {
        margin: 0;
        color: #1d4ed8;
      }
      .steps {
        margin: 0;
        padding-left: 20px;
      }
      .steps li {
        margin: 8px 0;
      }
      .quality {
        display: inline-block;
        margin-left: 4px;
        padding: 1px 6px;
        border-radius: 999px;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
      }
      .stable {
        background: var(--tk-recorder-stable, #15803d);
      }
      .ok,
      .modal {
        background: var(--tk-recorder-ok, #b45309);
      }
      .fragile {
        background: var(--tk-recorder-fragile, #b91c1c);
      }
    `,
  ],
})
export class TkTourRecorderPanelComponent {
  private readonly captureService = inject(TkCaptureService);
  private readonly storage = inject(TourStorageAdapter);
  private readonly player = inject(TkTourService);
  private readonly router = inject(Router, { optional: true });

  readonly closed = output<void>();
  readonly capture = this.captureService;
  readonly sideOptions = sides;
  readonly id = signal(this.nextId());
  readonly name = signal(`tour-${this.id().slice(5)}`);
  readonly version = signal(1);
  readonly status = signal<TourStatus>('draft');
  readonly createdAt = signal(new Date().toISOString());
  readonly steps = signal<TourStep[]>([]);
  readonly form = signal<StepForm | null>(null);
  readonly issues = signal<Array<{ path: string; message: string }>>([]);
  readonly tours = signal<TourDefinition[]>([]);
  readonly selectedTourId = signal('');
  readonly loadedVersion = signal<number | null>(null);
  readonly wasPublished = signal(false);
  readonly draft = computed(() => this.buildTour(this.status(), this.version()));

  private waitingForPick = false;

  constructor() {
    void this.reloadTours();
    effect(() => {
      const picked = this.captureService.lastPicked();
      if (this.waitingForPick && picked) this.openPickedForm(picked);
    });
  }

  addStep(): void {
    this.waitingForPick = true;
    this.form.set(null);
    this.captureService.clearPicked();
    this.captureService.mode.set('pick');
    this.captureService.start();
  }

  addModalStep(): void {
    this.waitingForPick = false;
    this.captureService.stop();
    this.form.set(this.blankForm(null, null));
  }

  saveStep(event?: Event): void {
    event?.preventDefault();
    const form = this.form();
    if (!form) return;
    const step: TourStep = {
      id: form.index === null ? this.nextStepId() : this.steps()[form.index]?.id ?? this.nextStepId(),
      title: form.title.trim(),
      body: form.body,
      ...(form.target ? { target: form.target, side: form.side, route: form.route } : {}),
      ...(form.target && form.clickAction ? { action: { kind: 'click' } as const } : {}),
      ...(form.target && form.waitTimeout !== null ? { waitFor: { timeoutMs: form.waitTimeout } } : {}),
    };
    this.steps.update(steps => {
      const next = [...steps];
      if (form.index === null) next.push(step);
      else next[form.index] = step;
      return next;
    });
    this.form.set(null);
  }

  cancelForm(): void {
    this.form.set(null);
    this.waitingForPick = false;
    this.captureService.stop();
  }

  editStep(index: number): void {
    const step = this.steps()[index];
    if (!step) return;
    this.form.set({
      index,
      target: step.target ?? null,
      quality: step.target ? scoreQuality(step.target) : null,
      title: step.title,
      body: step.body,
      side: (step.side && step.side !== 'over' ? step.side : 'bottom') as StepSide,
      clickAction: step.action?.kind === 'click',
      waitTimeout: step.waitFor?.timeoutMs ?? null,
      route: step.route,
    });
  }

  deleteStep(index: number): void {
    this.steps.update(steps => steps.filter((_, i) => i !== index));
  }

  moveStep(index: number, delta: -1 | 1): void {
    const to = index + delta;
    this.steps.update(steps => {
      if (to < 0 || to >= steps.length) return steps;
      const next = [...steps];
      [next[index], next[to]] = [next[to]!, next[index]!];
      return next;
    });
  }

  preview(): void {
    const tour = this.validTour('draft', this.version());
    if (tour) void this.player.start(tour, { onStepError: 'skip' });
  }

  async saveDraft(): Promise<void> {
    const tour = this.validTour('draft', this.version());
    if (!tour) return;
    await this.storage.saveTour(tour);
    this.status.set('draft');
    await this.reloadTours();
  }

  async publish(): Promise<void> {
    const nextVersion = this.wasPublished() ? (this.loadedVersion() ?? this.version()) + 1 : this.version();
    const tour = this.validTour('published', nextVersion);
    if (!tour) return;
    await this.storage.saveTour(tour);
    this.status.set('published');
    this.version.set(nextVersion);
    this.loadedVersion.set(nextVersion);
    this.wasPublished.set(true);
    await this.reloadTours();
  }

  async reloadTours(): Promise<void> {
    this.tours.set(await this.storage.listTours());
  }

  async loadTour(id: string): Promise<void> {
    const tour = await this.storage.getTour(id);
    if (!tour) return;
    this.id.set(tour.id);
    this.name.set(tour.name);
    this.version.set(tour.version);
    this.status.set(tour.status);
    this.createdAt.set(tour.createdAt);
    this.steps.set([...tour.steps]);
    this.selectedTourId.set(tour.id);
    this.loadedVersion.set(tour.version);
    this.wasPublished.set(tour.status === 'published');
    this.form.set(null);
    this.issues.set([]);
  }

  loadSelected(event: Event): void {
    const id = this.text(event);
    this.selectedTourId.set(id);
    if (id) void this.loadTour(id);
  }

  newTour(): void {
    const id = this.nextId();
    this.id.set(id);
    this.name.set(`tour-${id.slice(5)}`);
    this.version.set(1);
    this.status.set('draft');
    this.createdAt.set(new Date().toISOString());
    this.steps.set([]);
    this.form.set(null);
    this.issues.set([]);
    this.selectedTourId.set('');
    this.loadedVersion.set(null);
    this.wasPublished.set(false);
  }

  patchForm(patch: Partial<StepForm>): void {
    this.form.update(form => (form ? { ...form, ...patch } : form));
  }

  setName(event: Event): void {
    this.name.set(this.text(event));
  }

  text(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  side(event: Event): StepSide {
    const value = this.text(event);
    return sides.includes(value as StepSide) ? (value as StepSide) : 'bottom';
  }

  numberOrNull(event: Event): number | null {
    const value = this.text(event);
    return value === '' ? null : Number(value);
  }

  stepQuality(step: TourStep): LocatorQuality | 'modal' {
    return step.target ? scoreQuality(step.target) : 'modal';
  }

  private openPickedForm(picked: PickedElement): void {
    this.waitingForPick = false;
    this.captureService.stop();
    this.form.set(this.blankForm(picked.locator, picked.quality, this.router?.url));
  }

  private blankForm(target: ElementLocator | null, quality: LocatorQuality | null, route?: string): StepForm {
    return {
      index: null,
      target,
      quality,
      title: '',
      body: '',
      side: 'bottom',
      clickAction: false,
      waitTimeout: null,
      route,
    };
  }

  private validTour(status: TourStatus, version: number): TourDefinition | null {
    const tour = this.buildTour(status, version);
    const issues = validateTourDefinition(tour);
    this.issues.set(issues);
    return issues.length ? null : tour;
  }

  private buildTour(status: TourStatus, version: number): TourDefinition {
    return {
      schemaVersion: TOUR_SCHEMA_VERSION,
      id: this.id(),
      version,
      name: this.name().trim(),
      status,
      steps: this.steps(),
      createdAt: this.createdAt(),
      updatedAt: new Date().toISOString(),
    };
  }

  private nextId(): string {
    return `tour-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  }

  private nextStepId(): string {
    return `step-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  }
}
