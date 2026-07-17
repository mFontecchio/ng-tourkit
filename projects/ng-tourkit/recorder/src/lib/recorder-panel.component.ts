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
  TkSelectComponent,
  TkSelectOption,
  TkTourService,
  TK_THEME_CSS,
  scoreQuality,
  validateTourDefinition,
} from '@mfontecchio/ng-tourkit';
import { LocatorQuality, PickedElement, TkCaptureService } from './capture.service';

type StepSide = Exclude<PopoverSide, 'over'>;
type PickIntent = 'new-step' | 'retarget';

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
const sideSelectOptions: readonly TkSelectOption[] = sides.map(side => ({ value: side, label: side }));

@Component({
  selector: 'tk-tour-recorder-panel',
  standalone: true,
  imports: [TkSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'data-tk-recorder': '',
    '[attr.aria-label]': '"Tour recorder"',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
  template: `
    <div class="panel" [class.panel--collapsed]="collapsed()" [class.panel--closing]="closing()">
      <!-- Header -->
      <header class="panel-hdr">
        <svg class="panel-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="6" fill="currentColor" opacity="0.2"/>
          <circle cx="8" cy="8" r="3.5" fill="currentColor"/>
        </svg>
        <span class="panel-title">Tour Recorder</span>
        @if (capture.mode() === 'pick') {
          <span class="rec-pill">REC</span>
        }
        <span class="hdr-spacer"></span>
        <span class="step-count-badge" title="{{ steps().length }} step(s)">{{ steps().length }}</span>
        <button type="button" class="icon-hdr-btn" (click)="collapsed.set(!collapsed())" [attr.aria-label]="collapsed() ? 'Expand recorder' : 'Collapse recorder'" [attr.aria-expanded]="!collapsed()">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" [style.transform]="collapsed() ? 'rotate(180deg)' : 'none'" style="transition:transform 0.25s cubic-bezier(0.4,0,0.2,1)">
            <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button type="button" class="close-btn" (click)="requestClose()" aria-label="Close recorder">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
          </svg>
        </button>
      </header>

      <!-- Collapsible content -->
      <div class="panel-collapsible">
        <div class="panel-collapsible-inner">
          <!-- Validation issues -->
          @if (issues().length) {
            <div class="issues-bar" role="alert">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style="flex-shrink:0;margin-top:1px">
                <path d="M7 1.5L13 12H1L7 1.5z" fill="#fca5a5"/>
                <path d="M7 5.5v3M7 10.5h.01" stroke="#991b1b" stroke-width="1.4" stroke-linecap="round"/>
              </svg>
              <ul class="issues-list">
                @for (issue of issues(); track issue.path + issue.message) {
                  <li>{{ issue.path }} {{ issue.message }}</li>
                }
              </ul>
            </div>
          }

          <!-- Pick hint -->
          @if (capture.mode() === 'pick') {
            <div class="pick-hint">
              <span class="pick-pulse" aria-hidden="true"></span>
              Click any element in the app — press <kbd>Esc</kbd> to cancel
            </div>
          }

          <!-- Step form -->
          @if (form(); as f) {
            <form class="step-form" (submit)="saveStep($event)">
              <div class="form-hdr">
                <span class="form-title">{{ f.index === null ? 'New step' : 'Edit step' }}</span>
                @if (f.quality) {
                  <span class="q-badge" [class]="'q-' + f.quality">{{ f.quality }}</span>
                } @else {
                  <span class="q-badge q-modal">modal</span>
                }
              </div>
              <div class="tk-field">
                <label class="tk-label" for="tk-step-title">Title</label>
                <input id="tk-step-title" class="tk-input" [value]="f.title" (input)="patchForm({ title: text($event) })" placeholder="Step title" />
              </div>
              <div class="tk-field">
                <label class="tk-label" for="tk-step-body">Body</label>
                <textarea id="tk-step-body" class="tk-textarea" [value]="f.body" (input)="patchForm({ body: text($event) })" placeholder="Step description"></textarea>
              </div>
              @if (f.target) {
                @if (f.index !== null) {
                  <div class="target-field">
                    <div>
                      <span class="tk-label">Target</span>
                      <div class="target-selector" [title]="f.target.candidates[0]?.selector ?? 'Element target'">
                        {{ f.target.candidates[0]?.selector ?? 'Element target' }}
                      </div>
                    </div>
                    <button type="button" class="tk-btn tk-btn--sm" (click)="changeTarget()" [disabled]="isPicking()">Change target</button>
                  </div>
                }
                <div class="tk-field">
                  <label class="tk-label" for="tk-step-side">Popover side</label>
                  <tk-select
                    id="tk-step-side"
                    [value]="f.side"
                    [options]="sideSelectOptions"
                    (valueChange)="patchForm({ side: asSide($event) })"
                  />
                </div>
                <label class="tk-check">
                  <input type="checkbox" class="tk-check__input" [checked]="f.clickAction" (change)="patchForm({ clickAction: checked($event) })" />
                  <span>Click element on Next</span>
                </label>
                <div class="tk-field">
                  <label class="tk-label" for="tk-step-wait">Wait timeout (ms)</label>
                  <input id="tk-step-wait" type="number" min="0" class="tk-input" [value]="f.waitTimeout ?? ''" (input)="patchForm({ waitTimeout: numberOrNull($event) })" placeholder="None" />
                </div>
              }
              <div class="form-actions">
                <button type="submit" class="tk-btn tk-btn--primary tk-btn--sm" [disabled]="isPicking()">Save step</button>
                <button type="button" class="tk-btn tk-btn--ghost tk-btn--sm" (click)="isPicking() ? cancelTargetPick() : cancelForm()">
                  {{ isPicking() ? 'Cancel pick' : 'Cancel' }}
                </button>
              </div>
            </form>
          }

          <!-- Scrollable body -->
          <div class="panel-body">
            <!-- Tour info -->
            <section class="section">
              <div class="tk-field">
                <label class="tk-label" for="tk-tour-name">Tour name</label>
                <input id="tk-tour-name" class="tk-input" [value]="name()" (input)="setName($event)" placeholder="my-tour" />
              </div>
              <div class="tk-field">
                <label class="tk-label" for="tk-tour-load">Load existing</label>
                <tk-select
                  id="tk-tour-load"
                  [value]="selectedTourId()"
                  [options]="tourSelectOptions()"
                  placeholder="Select a tour…"
                  (valueChange)="loadSelected($event)"
                />
              </div>
            </section>

            <!-- Steps -->
            <section class="section">
              <div class="section-hdr">
                <span class="section-title">
                  Steps
                  <span class="count-chip">{{ steps().length }}</span>
                </span>
                <div class="row">
                  <button type="button" class="tk-btn tk-btn--sm" (click)="addStep()" [disabled]="capture.mode() === 'pick'">+ Element</button>
                  <button type="button" class="tk-btn tk-btn--sm" (click)="addModalStep()">+ Modal</button>
                </div>
              </div>
              @if (steps().length === 0) {
                <p class="empty-steps">No steps yet — add your first above.</p>
              }
              <ol class="steps-list" aria-label="Tour steps">
                @for (step of steps(); track step.id; let i = $index) {
                  <li class="step-card">
                    <div class="step-meta">
                      <span class="step-num" aria-hidden="true">{{ i + 1 }}</span>
                      <span class="step-title-text" [title]="step.title || '(untitled)'">{{ step.title || '(untitled)' }}</span>
                      <span class="q-badge" [class]="'q-' + stepQuality(step)">{{ stepQuality(step) }}</span>
                    </div>
                    <div class="step-actions">
                      <button type="button" class="icon-btn" (click)="moveStep(i, -1)" [disabled]="i === 0" aria-label="Move up">↑</button>
                      <button type="button" class="icon-btn" (click)="moveStep(i, 1)" [disabled]="i === steps().length - 1" aria-label="Move down">↓</button>
                      <button type="button" class="icon-btn" (click)="editStep(i)" aria-label="Edit step">✎</button>
                      <button type="button" class="icon-btn icon-btn-danger" (click)="deleteStep(i)" aria-label="Delete step">✕</button>
                    </div>
                  </li>
                }
              </ol>
            </section>
          </div>

          <!-- Footer -->
          <footer class="panel-footer">
            <button type="button" class="tk-btn tk-btn--ghost tk-btn--sm" (click)="newTour()">New tour</button>
            <div class="footer-actions">
              <button type="button" class="tk-btn tk-btn--ghost tk-btn--sm" (click)="preview()">Preview</button>
              <button type="button" class="tk-btn tk-btn--sm" (click)="saveDraft()">Save draft</button>
              <button type="button" class="tk-btn tk-btn--primary tk-btn--sm" (click)="publish()">Publish</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  `,
  styles: [
    TK_THEME_CSS,
    `
      :host {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 10003;
        font-size: 13px;
        line-height: 1.45;
        color: var(--tk-recorder-text, var(--tk-color-text));
      }

      /* ── Panel shell ─────────────────────────────────────── */
      .panel {
        width: var(--tk-recorder-width, 360px);
        max-height: 82vh;
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        background: var(--tk-recorder-bg, var(--tk-color-surface));
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.10), 0 16px 40px -4px rgba(0,0,0,0.18);
        border: 1px solid rgba(0,0,0,0.08);
        overflow: hidden;
        animation: panel-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      }
      .panel--closing {
        animation: panel-out 0.22s cubic-bezier(0.4, 0, 1, 1) both;
        pointer-events: none;
      }
      @keyframes panel-in {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to   { opacity: 1; transform: none; }
      }
      @keyframes panel-out {
        from { opacity: 1; transform: none; }
        to   { opacity: 0; transform: translateY(12px) scale(0.97); }
      }

      /* ── Collapse ────────────────────────────────────────── */
      .panel-collapsible {
        display: grid;
        grid-template-rows: 1fr;
        transition: grid-template-rows 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .panel--collapsed .panel-collapsible {
        grid-template-rows: 0fr;
      }
      .panel-collapsible-inner {
        overflow: hidden;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }

      @media (prefers-reduced-motion: reduce) {
        .panel { animation-duration: 0.01ms !important; }
        .panel-collapsible { transition-duration: 0.01ms !important; }
      }

      /* ── Header ──────────────────────────────────────────── */
      .panel-hdr {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 11px 14px;
        background: #1d4ed8;
        color: #fff;
        flex-shrink: 0;
        user-select: none;
      }
      .panel-icon { display: flex; color: rgba(255,255,255,0.8); }
      .panel-title { font-size: 13px; font-weight: 600; letter-spacing: 0.01em; }
      .hdr-spacer { flex: 1; }
      .step-count-badge {
        font-size: 11px;
        font-weight: 700;
        background: rgba(255,255,255,0.18);
        color: #fff;
        min-width: 22px;
        height: 22px;
        padding: 0 6px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .rec-pill {
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 0.1em;
        background: #ef4444;
        color: #fff;
        padding: 2px 6px;
        border-radius: 999px;
        animation: rec-blink 1.2s step-start infinite;
      }
      @keyframes rec-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      .icon-hdr-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 8px;
        background: rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.9);
        cursor: pointer;
        transition: background 0.13s;
        flex-shrink: 0;
      }
      .icon-hdr-btn:hover { background: rgba(255,255,255,0.22); }
      .icon-hdr-btn:active { background: rgba(255,255,255,0.06); }

      .close-btn {        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 8px;
        background: rgba(255,255,255,0.12);
        color: rgba(255,255,255,0.9);
        cursor: pointer;
        transition: background 0.13s;
        flex-shrink: 0;
      }
      .close-btn:hover { background: rgba(255,255,255,0.22); }
      .close-btn:active { background: rgba(255,255,255,0.06); }

      /* ── Issues bar ──────────────────────────────────────── */
      .issues-bar {
        display: flex;
        gap: 8px;
        padding: 10px 14px;
        background: #fef2f2;
        border-bottom: 1px solid #fecaca;
        color: #991b1b;
        font-size: 12px;
        flex-shrink: 0;
      }
      .issues-list { margin: 0; padding: 0; list-style: none; }
      .issues-list li + li { margin-top: 3px; }

      /* ── Pick hint ───────────────────────────────────────── */
      .pick-hint {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: #eff6ff;
        border-bottom: 1px solid #bfdbfe;
        color: #1e40af;
        font-size: 12px;
        flex-shrink: 0;
      }
      .pick-pulse {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #3b82f6;
        flex-shrink: 0;
        animation: pulse-dot 1.3s ease-in-out infinite;
      }
      @keyframes pulse-dot {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
        50% { box-shadow: 0 0 0 7px rgba(59,130,246,0); }
      }
      kbd {
        font: inherit;
        font-size: 11px;
        font-weight: 600;
        background: #dbeafe;
        border: 1px solid #93c5fd;
        border-radius: 4px;
        padding: 1px 5px;
      }

      /* ── Step form ───────────────────────────────────────── */
      .step-form {
        padding: 12px 14px;
        background: #f8fafc;
        border-bottom: 1px solid #e5e7eb;
        flex-shrink: 0;
      }
      .form-hdr {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }
      .form-title { font-size: 13px; font-weight: 600; color: #111827; }
      .form-actions { display: flex; gap: 8px; margin-top: 12px; }
      .target-field {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 8px;
      }
      .target-selector {
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #6b7280;
        font-size: 12px;
      }

      /* ── Scrollable body ─────────────────────────────────── */
      .panel-body {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        scroll-behavior: smooth;
      }
      .panel-body::-webkit-scrollbar { width: 4px; }
      .panel-body::-webkit-scrollbar-track { background: transparent; }
      .panel-body::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }

      /* ── Sections ────────────────────────────────────────── */
      .section {
        padding: 12px 14px;
        border-bottom: 1px solid #f3f4f6;
      }
      .section:last-child { border-bottom: none; }
      .section-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .section-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #6b7280;
      }
      .count-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 999px;
        background: #e5e7eb;
        color: #374151;
        font-size: 11px;
        font-weight: 700;
        margin-left: 5px;
        text-transform: none;
        letter-spacing: 0;
        vertical-align: middle;
      }

      /* ── Steps list ──────────────────────────────────────── */
      .empty-steps {
        margin: 0 0 4px;
        text-align: center;
        padding: 14px 0;
        color: #9ca3af;
        font-size: 12px;
      }
      .steps-list { margin: 0; padding: 0; list-style: none; display: grid; gap: 6px; }
      .step-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 9px 11px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #fff;
        transition: box-shadow 0.12s;
      }
      .step-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.07); }
      .step-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      .step-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #f3f4f6;
        color: #374151;
        font-size: 10px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .step-title-text {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 13px;
        color: #111827;
      }
      .step-actions { display: flex; gap: 3px; }

      /* ── Quality badges ──────────────────────────────────── */
      .q-badge {
        display: inline-flex;
        align-items: center;
        padding: 1px 7px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        flex-shrink: 0;
      }
      .q-stable { background: #dcfce7; color: #15803d; }
      .q-ok { background: #fef3c7; color: #92400e; }
      .q-fragile { background: #fee2e2; color: #b91c1c; }
      .q-modal { background: #dbeafe; color: #1d4ed8; }

      /* ── Icon buttons ────────────────────────────────────── */
      .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border: 1px solid transparent;
        border-radius: 6px;
        background: transparent;
        color: #6b7280;
        font: inherit;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.12s, color 0.12s, border-color 0.12s;
      }
      .icon-btn:hover { background: #f3f4f6; color: #111827; border-color: #e5e7eb; }
      .icon-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .icon-btn-danger:hover { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

      /* ── Footer ──────────────────────────────────────────── */
      .panel-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-top: 1px solid #e5e7eb;
        background: #f9fafb;
        flex-shrink: 0;
        gap: 6px;
      }
      .footer-actions { display: flex; gap: 6px; }

      /* ── Utility ─────────────────────────────────────────── */
      .row { display: flex; align-items: center; gap: 6px; }
    `,
  ],
})
export class TkTourRecorderPanelComponent {
  private readonly captureService = inject(TkCaptureService);
  private readonly storage = inject(TourStorageAdapter);
  private readonly player = inject(TkTourService);
  private readonly router = inject(Router, { optional: true });

  readonly closed = output<void>();
  readonly collapsed = signal(false);
  readonly closing = signal(false);
  readonly isDirty = signal(false);
  readonly capture = this.captureService;
  readonly sideSelectOptions = sideSelectOptions;
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
  readonly isPicking = computed(() => this.pickIntent() !== null);
  readonly tourSelectOptions = computed<readonly TkSelectOption[]>(() =>
    this.tours().map(tour => ({
      value: tour.id,
      label: `${tour.name} v${tour.version} (${tour.status})`,
    })),
  );

  private readonly pickIntent = signal<PickIntent | null>(null);

  constructor() {
    void this.reloadTours();
    effect(() => {
      const picked = this.captureService.lastPicked();
      const intent = this.pickIntent();
      if (intent && picked) this.applyPickedElement(picked, intent);
    });
    effect(() => {
      this.steps(); // track
      this.isDirty.set(true);
    }, { allowSignalWrites: true });
  }

  requestClose(): void {
    if (this.isDirty() && this.steps().length > 0 && !confirm('You have unsaved changes. Close without saving?')) {
      return;
    }
    this.closing.set(true);
    setTimeout(() => this.closed.emit(), 220);
  }

  addStep(): void {
    this.form.set(null);
    this.startPicking('new-step');
  }

  addModalStep(): void {
    this.cancelTargetPick();
    this.form.set(this.blankForm(null, null));
  }

  saveStep(event?: Event): void {
    event?.preventDefault();
    if (this.isPicking()) return;
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
    this.cancelTargetPick();
  }

  editStep(index: number): void {
    const step = this.steps()[index];
    if (!step) return;
    this.cancelTargetPick();
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

  changeTarget(): void {
    const form = this.form();
    if (!form?.target || form.index === null) return;
    this.startPicking('retarget');
  }

  cancelTargetPick(): void {
    if (!this.isPicking()) return;
    this.pickIntent.set(null);
    this.captureService.stop();
    this.captureService.clearPicked();
  }

  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.isPicking()) return;
    event.preventDefault();
    event.stopPropagation();
    this.cancelTargetPick();
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
    this.isDirty.set(false);
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
    this.isDirty.set(false);
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
    this.isDirty.set(false);
  }

  loadSelected(id: string): void {
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
    this.isDirty.set(false);
  }

  patchForm(patch: Partial<StepForm>): void {
    this.form.update(form => (form ? { ...form, ...patch } : form));
  }

  setName(event: Event): void {
    this.name.set(this.text(event));
  }

  text(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  asSide(value: string): StepSide {
    return sides.includes(value as StepSide) ? (value as StepSide) : 'bottom';
  }

  numberOrNull(event: Event): number | null {
    const value = this.text(event);
    return value === '' ? null : Number(value);
  }

  stepQuality(step: TourStep): LocatorQuality | 'modal' {
    return step.target ? scoreQuality(step.target) : 'modal';
  }

  private startPicking(intent: PickIntent): void {
    this.pickIntent.set(intent);
    this.captureService.clearPicked();
    this.captureService.mode.set('pick');
    this.captureService.start();
  }

  private applyPickedElement(picked: PickedElement, intent: PickIntent): void {
    this.pickIntent.set(null);
    this.captureService.stop();
    this.captureService.clearPicked();
    if (intent === 'new-step') {
      this.form.set(this.blankForm(picked.locator, picked.quality, this.router?.url));
      return;
    }
    this.patchForm({ target: picked.locator, quality: picked.quality, route: this.router?.url });
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
