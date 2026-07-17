import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import {
  TK_THEME_CSS,
  TkTourService,
  TourAuditAdapter,
  TourAuditEvent,
  TourDefinition,
  TourStatus,
  TourStorageAdapter,
  validateTourDefinition,
} from '@mfontecchio/ng-tourkit';

interface TourAuditSummary {
  readonly started: number;
  readonly completed: number;
}

@Component({
  selector: 'tk-tour-manager',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="tk-manage">
      <header class="tk-manage__header">
        <div>
          <h2>Tour manager</h2>
          <p>Manage saved guided tours.</p>
        </div>
        <div class="tk-manage__tools">
          <button type="button" class="tk-btn tk-btn--sm" (click)="refresh()">Refresh</button>
          <label class="tk-btn tk-btn--sm tk-manage__import">
            Import JSON
            <input type="file" accept="application/json,.json" (change)="importFile($event)" />
          </label>
        </div>
      </header>

      @if (error()) {
        <p class="tk-manage__error" role="alert">{{ error() }}</p>
      }

      @if (tours().length === 0) {
        <p class="tk-manage__empty">No tours found.</p>
      } @else {
        <div class="tk-manage__table-wrap">
          <table class="tk-manage__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Version</th>
                <th>Steps</th>
                <th>Updated</th>
                <th>Audit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (tour of tours(); track tour.id) {
                <tr>
                  <td>
                    <button
                      type="button"
                      class="tk-manage__link"
                      [attr.aria-expanded]="expandedId() === tour.id"
                      (click)="toggleExpanded(tour.id)"
                    >
                      {{ tour.name }}
                    </button>
                  </td>
                  <td>
                    <span class="tk-manage__badge" [class]="'tk-manage__badge--' + tour.status">{{
                      tour.status
                    }}</span>
                  </td>
                  <td>{{ tour.version }}</td>
                  <td>{{ tour.steps.length }}</td>
                  <td>{{ tour.updatedAt }}</td>
                  <td>
                    {{ summary(tour.id).started }} started /
                    {{ summary(tour.id).completed }} completed
                  </td>
                  <td>
                    <div class="tk-manage__actions">
                      <button type="button" class="tk-btn tk-btn--sm" (click)="run(tour)">Run</button>
                      <button type="button" class="tk-btn tk-btn--sm" (click)="edit.emit(tour)">Edit</button>
                      <button type="button" class="tk-btn tk-btn--sm" (click)="toggleStatus(tour)">
                        {{ tour.status === 'published' ? 'Unpublish' : 'Publish' }}
                      </button>
                      <button type="button" class="tk-btn tk-btn--sm" (click)="archive(tour)">Archive</button>
                      <button type="button" class="tk-btn tk-btn--sm" (click)="duplicate(tour)">Duplicate</button>
                      <button type="button" class="tk-btn tk-btn--sm" (click)="exportJson(tour)">Export JSON</button>
                      <button type="button" class="tk-btn tk-btn--sm tk-btn--danger" (click)="delete(tour)">
                        {{ pendingDeleteId() === tour.id ? 'Confirm delete?' : 'Delete' }}
                      </button>
                    </div>
                  </td>
                </tr>
                @if (expandedId() === tour.id) {
                  <tr class="tk-manage__detail">
                    <td colspan="7">
                      <h3>Audit events</h3>
                      @if (events(tour.id).length === 0) {
                        <p>No audit events.</p>
                      } @else {
                        <ul>
                          @for (
                            event of events(tour.id);
                            track event.at + event.type + (event.stepId ?? '')
                          ) {
                            <li>
                              <strong>{{ event.type }}</strong>
                              <span>{{ event.userId }}</span>
                              <span>{{ event.stepId ?? '—' }}</span>
                              <time>{{ event.at }}</time>
                            </li>
                          }
                        </ul>
                      }
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="tk-manage__cards">
          @for (tour of tours(); track tour.id) {
            <article class="tk-manage__card">
              <div class="tk-manage__meta">
                <button
                  type="button"
                  class="tk-manage__link"
                  [attr.aria-expanded]="expandedId() === tour.id"
                  (click)="toggleExpanded(tour.id)"
                >
                  {{ tour.name }}
                </button>
                <span class="tk-manage__badge" [class]="'tk-manage__badge--' + tour.status">{{
                  tour.status
                }}</span>
                <div>Version {{ tour.version }} · {{ tour.steps.length }} steps</div>
                <div>Updated {{ tour.updatedAt }}</div>
                <div>
                  {{ summary(tour.id).started }} started /
                  {{ summary(tour.id).completed }} completed
                </div>
              </div>
              <div class="tk-manage__actions">
                <button type="button" class="tk-btn tk-btn--sm" (click)="run(tour)">Run</button>
                <button type="button" class="tk-btn tk-btn--sm" (click)="edit.emit(tour)">Edit</button>
                <button type="button" class="tk-btn tk-btn--sm" (click)="toggleStatus(tour)">
                  {{ tour.status === 'published' ? 'Unpublish' : 'Publish' }}
                </button>
                <button type="button" class="tk-btn tk-btn--sm" (click)="archive(tour)">Archive</button>
                <button type="button" class="tk-btn tk-btn--sm" (click)="duplicate(tour)">Duplicate</button>
                <button type="button" class="tk-btn tk-btn--sm" (click)="exportJson(tour)">Export JSON</button>
                <button type="button" class="tk-btn tk-btn--sm tk-btn--danger" (click)="delete(tour)">
                  {{ pendingDeleteId() === tour.id ? 'Confirm delete?' : 'Delete' }}
                </button>
              </div>
              @if (expandedId() === tour.id) {
                <div class="tk-manage__detail tk-manage__detail--card">
                  <h3>Audit events</h3>
                  @if (events(tour.id).length === 0) {
                    <p>No audit events.</p>
                  } @else {
                    <ul>
                      @for (
                        event of events(tour.id);
                        track event.at + event.type + (event.stepId ?? '')
                      ) {
                        <li>
                          <strong>{{ event.type }}</strong>
                          <span>{{ event.userId }}</span>
                          <span>{{ event.stepId ?? '—' }}</span>
                          <time>{{ event.at }}</time>
                        </li>
                      }
                    </ul>
                  }
                </div>
              }
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [
    TK_THEME_CSS,
    `
      :host {
        --tk-manage-bg: var(--tk-color-surface);
        --tk-manage-border: var(--tk-color-border);
        --tk-manage-text: var(--tk-color-text);
        --tk-manage-muted: var(--tk-color-text-muted);
        --tk-manage-accent: var(--tk-color-accent);
        --tk-manage-danger: var(--tk-color-danger);
        --tk-manage-draft: #667085;
        --tk-manage-published: #067647;
        --tk-manage-archived: #93370d;
        display: block;
        color: var(--tk-manage-text);
      }

      .tk-manage {
        background: var(--tk-manage-bg);
        border: 1px solid var(--tk-manage-border);
        border-radius: 12px;
        padding: 1rem;
      }

      .tk-manage__header,
      .tk-manage__tools,
      .tk-manage__actions {
        align-items: center;
        display: flex;
        gap: 0.5rem;
      }

      .tk-manage__header {
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      h2,
      h3,
      p {
        margin: 0;
      }

      h2 {
        font-size: 1.1rem;
      }

      h3 {
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
      }

      p,
      td,
      th {
        font-size: 0.875rem;
      }

      p {
        color: var(--tk-manage-muted);
      }

      .tk-manage__import {
        position: relative;
        overflow: hidden;
      }

      .tk-manage__import input {
        display: none;
      }

      .tk-manage__error {
        background: var(--tk-color-danger-soft);
        border: 1px solid var(--tk-color-danger-border);
        border-radius: var(--tk-radius-control);
        color: var(--tk-manage-danger);
        margin-bottom: 0.75rem;
        padding: 0.5rem 0.75rem;
      }

      .tk-manage__empty {
        padding: 1rem 0;
      }

      .tk-manage__table-wrap {
        overflow-x: auto;
      }

      .tk-manage__table {
        border-collapse: collapse;
        min-width: 900px;
        width: 100%;
      }

      .tk-manage__cards {
        display: none;
      }

      th,
      td {
        border-top: 1px solid var(--tk-manage-border);
        padding: 0.55rem;
        text-align: left;
        vertical-align: top;
      }

      th {
        color: var(--tk-manage-muted);
        font-weight: 600;
      }

      .tk-manage__link {
        background: transparent;
        border: 0;
        color: var(--tk-manage-accent);
        cursor: pointer;
        font: inherit;
        padding: 0;
        text-align: left;
      }

      .tk-manage__badge {
        border-radius: 999px;
        color: #fff;
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1;
        padding: 0.25rem 0.5rem;
      }

      .tk-manage__badge--draft {
        background: var(--tk-manage-draft);
      }

      .tk-manage__badge--published {
        background: var(--tk-manage-published);
      }

      .tk-manage__badge--archived {
        background: var(--tk-manage-archived);
      }

      .tk-manage__actions {
        flex-wrap: wrap;
      }

      .tk-manage__detail td,
      .tk-manage__detail--card {
        background: var(--tk-color-surface-muted);
      }

      .tk-manage__detail--card {
        border-radius: 8px;
        margin-top: 0.75rem;
        padding: 0.75rem;
      }

      .tk-manage__detail ul {
        display: grid;
        gap: 0.35rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .tk-manage__detail li {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: 9rem 8rem 8rem minmax(12rem, 1fr);
      }

      @media (max-width: 768px) {
        .tk-manage {
          padding: 0.75rem;
        }

        .tk-manage__header {
          align-items: stretch;
          flex-direction: column;
        }

        .tk-manage__tools {
          flex-wrap: wrap;
        }

        .tk-manage__table-wrap {
          display: none;
        }

        .tk-manage__cards {
          display: grid;
          gap: 0.75rem;
        }

        .tk-manage__card {
          border: 1px solid var(--tk-manage-border);
          border-radius: 10px;
          padding: 0.75rem;
        }

        .tk-manage__meta {
          display: grid;
          gap: 0.4rem;
          margin-bottom: 0.75rem;
        }

        .tk-manage__actions {
          align-items: stretch;
        }

        .tk-manage__actions .tk-btn {
          flex: 1 1 9rem;
        }

        .tk-manage__detail li {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TkTourManagerComponent implements OnDestroy {
  private readonly storage = inject(TourStorageAdapter);
  private readonly audit = inject(TourAuditAdapter);
  private readonly player = inject(TkTourService);
  private readonly document = inject(DOCUMENT);
  private deleteTimer: ReturnType<typeof setTimeout> | null = null;

  readonly edit = output<TourDefinition>();
  readonly tours = signal<readonly TourDefinition[]>([]);
  readonly auditEvents = signal<Record<string, readonly TourAuditEvent[]>>({});
  readonly expandedId = signal<string | null>(null);
  readonly pendingDeleteId = signal<string | null>(null);
  readonly error = signal('');
  readonly auditSummaries = computed<Record<string, TourAuditSummary>>(() => {
    const summaries: Record<string, TourAuditSummary> = {};
    for (const [tourId, events] of Object.entries(this.auditEvents())) {
      summaries[tourId] = {
        started: events.filter((e) => e.type === 'started').length,
        completed: events.filter((e) => e.type === 'completed').length,
      };
    }
    return summaries;
  });

  constructor() {
    void this.refresh();
  }

  ngOnDestroy(): void {
    this.clearDeleteTimer();
  }

  async refresh(): Promise<void> {
    this.error.set('');
    const tours = await this.storage.listTours();
    this.tours.set(tours);
    const auditEvents: Record<string, readonly TourAuditEvent[]> = {};
    //  upfront audit read is fine for dev-scale localStorage; server adapters can page later.
    await Promise.all(
      tours.map(async (tour) => {
        auditEvents[tour.id] = this.sortEvents(await this.audit.getEvents(tour.id));
      }),
    );
    this.auditEvents.set(auditEvents);
  }

  summary(tourId: string): TourAuditSummary {
    return this.auditSummaries()[tourId] ?? { started: 0, completed: 0 };
  }

  events(tourId: string): readonly TourAuditEvent[] {
    return this.auditEvents()[tourId] ?? [];
  }

  toggleExpanded(tourId: string): void {
    this.expandedId.update((id) => (id === tourId ? null : tourId));
  }

  run(tour: TourDefinition): void {
    void this.player.start(tour);
  }

  async toggleStatus(tour: TourDefinition): Promise<void> {
    await this.save({ ...tour, status: tour.status === 'published' ? 'draft' : 'published' });
  }

  async archive(tour: TourDefinition): Promise<void> {
    await this.save({ ...tour, status: 'archived' });
  }

  async duplicate(tour: TourDefinition): Promise<void> {
    const now = new Date().toISOString();
    await this.storage.saveTour({
      ...tour,
      id: crypto.randomUUID(),
      name: `${tour.name} (copy)`,
      version: 1,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });
    await this.refresh();
  }

  async delete(tour: TourDefinition): Promise<void> {
    if (this.pendingDeleteId() !== tour.id) {
      this.pendingDeleteId.set(tour.id);
      this.clearDeleteTimer();
      this.deleteTimer = setTimeout(() => this.pendingDeleteId.set(null), 3000);
      return;
    }
    this.clearDeleteTimer();
    this.pendingDeleteId.set(null);
    await this.storage.deleteTour(tour.id);
    await this.refresh();
  }

  exportJson(tour: TourDefinition): void {
    const blob = new Blob([JSON.stringify(tour, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = `${tour.name.replace(/[^a-z0-9-]+/gi, '-').toLowerCase() || 'tour'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  importFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => void this.importJsonPayload(String(reader.result ?? ''));
    reader.onerror = () => this.error.set('Could not read import file.');
    reader.readAsText(file);
    input.value = '';
  }

  async importJsonPayload(payload: string): Promise<void> {
    this.error.set('');
    let value: unknown;
    try {
      value = JSON.parse(payload);
    } catch {
      this.error.set('Invalid JSON.');
      return;
    }

    const issues = validateTourDefinition(value);
    if (issues.length > 0) {
      this.error.set(`Invalid tour JSON: ${issues[0].path} ${issues[0].message}`.trim());
      return;
    }

    const tour = value as TourDefinition;
    const ids = new Set((await this.storage.listTours()).map((t) => t.id));
    const now = new Date().toISOString();
    await this.storage.saveTour({
      ...tour,
      id: ids.has(tour.id) ? crypto.randomUUID() : tour.id,
      updatedAt: now,
    });
    await this.refresh();
  }

  private async save(tour: TourDefinition & { readonly status: TourStatus }): Promise<void> {
    await this.storage.saveTour({ ...tour, updatedAt: new Date().toISOString() });
    await this.refresh();
  }

  private sortEvents(events: readonly TourAuditEvent[]): readonly TourAuditEvent[] {
    return [...events].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 50);
  }

  private clearDeleteTimer(): void {
    if (this.deleteTimer === null) return;
    clearTimeout(this.deleteTimer);
    this.deleteTimer = null;
  }
}
