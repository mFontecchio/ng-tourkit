import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  TOUR_SCHEMA_VERSION,
  TourAuditAdapter,
  TourDefinition,
  TourStorageAdapter,
  provideTourKit,
} from 'ng-tourkit';
import { TkTourManagerComponent } from './tour-manager.component';

function tour(id: string, name: string, status: TourDefinition['status'] = 'draft'): TourDefinition {
  return {
    schemaVersion: TOUR_SCHEMA_VERSION,
    id,
    version: 2,
    name,
    status,
    steps: [
      { id: 'intro', title: 'Intro', body: 'Welcome' },
      { id: 'finish', title: 'Finish', body: 'Done' },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };
}

function text(fixture: ComponentFixture<TkTourManagerComponent>): string {
  return (fixture.nativeElement as HTMLElement).textContent ?? '';
}

async function stable(fixture: ComponentFixture<TkTourManagerComponent>): Promise<void> {
  await TestBed.inject(ApplicationRef).whenStable();
  fixture.detectChanges();
  await TestBed.inject(ApplicationRef).whenStable();
}

function clickButton(fixture: ComponentFixture<TkTourManagerComponent>, label: string): void {
  const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
    .find(b => (b.textContent ?? '').trim() === label);
  expect(button).toBeTruthy();
  button?.click();
}

describe('TkTourManagerComponent', () => {
  let storage: TourStorageAdapter;
  let audit: TourAuditAdapter;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [TkTourManagerComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTourKit({ userId: () => 'tester' }),
      ],
    });
    storage = TestBed.inject(TourStorageAdapter);
    audit = TestBed.inject(TourAuditAdapter);
  });

  it('renders saved tours and audit summary counts', async () => {
    await storage.saveTour(tour('tour-a', 'Alpha tour', 'published'));
    await storage.saveTour(tour('tour-b', 'Beta tour'));
    await audit.recordEvent({
      tourId: 'tour-a',
      tourVersion: 2,
      userId: 'u1',
      type: 'started',
      at: '2026-01-03T00:00:00.000Z',
    });
    await audit.recordEvent({
      tourId: 'tour-a',
      tourVersion: 2,
      userId: 'u2',
      type: 'started',
      at: '2026-01-04T00:00:00.000Z',
    });
    await audit.recordEvent({
      tourId: 'tour-a',
      tourVersion: 2,
      userId: 'u1',
      type: 'completed',
      at: '2026-01-05T00:00:00.000Z',
    });

    const fixture = TestBed.createComponent(TkTourManagerComponent);
    fixture.detectChanges();
    await stable(fixture);

    expect(text(fixture)).toContain('Alpha tour');
    expect(text(fixture)).toContain('Beta tour');
    expect(text(fixture)).toContain('published');
    expect(text(fixture)).toContain('2 started / 1 completed');
  });

  it('duplicates a tour as a new draft with a new id', async () => {
    const original = tour('tour-a', 'Alpha tour', 'published');
    await storage.saveTour(original);
    const fixture = TestBed.createComponent(TkTourManagerComponent);
    fixture.detectChanges();
    await stable(fixture);

    await fixture.componentInstance.duplicate(original);
    await stable(fixture);

    const tours = await storage.listTours();
    const copy = tours.find(t => t.name === 'Alpha tour (copy)');
    expect(copy).toBeTruthy();
    expect(copy?.id).not.toBe(original.id);
    expect(copy?.status).toBe('draft');
    expect(copy?.version).toBe(1);
  });

  it('deletes only after the confirm click sequence', async () => {
    await storage.saveTour(tour('tour-a', 'Alpha tour'));
    const fixture = TestBed.createComponent(TkTourManagerComponent);
    fixture.detectChanges();
    await stable(fixture);

    clickButton(fixture, 'Delete');
    await stable(fixture);
    expect(await storage.getTour('tour-a')).not.toBeNull();
    expect(text(fixture)).toContain('Confirm delete?');

    clickButton(fixture, 'Confirm delete?');
    await stable(fixture);
    expect(await storage.getTour('tour-a')).toBeNull();
    expect(text(fixture)).not.toContain('Alpha tour');
  });

  it('toggles status and persists via the storage adapter', async () => {
    const original = tour('tour-a', 'Alpha tour', 'draft');
    await storage.saveTour(original);
    const fixture = TestBed.createComponent(TkTourManagerComponent);
    fixture.detectChanges();
    await stable(fixture);

    await fixture.componentInstance.toggleStatus(original);
    expect((await storage.getTour('tour-a'))?.status).toBe('published');

    await fixture.componentInstance.toggleStatus((await storage.getTour('tour-a')) as TourDefinition);
    expect((await storage.getTour('tour-a'))?.status).toBe('draft');
  });

  it('rejects invalid JSON import payloads', async () => {
    const fixture = TestBed.createComponent(TkTourManagerComponent);
    fixture.detectChanges();
    await stable(fixture);

    await fixture.componentInstance.importJsonPayload('{"id":""}');
    await stable(fixture);

    expect(text(fixture)).toContain('Invalid tour JSON');
    expect(await storage.listTours()).toEqual([]);
  });

  it('regenerates ids on import collision', async () => {
    const original = tour('tour-a', 'Alpha tour');
    await storage.saveTour(original);
    const fixture = TestBed.createComponent(TkTourManagerComponent);
    fixture.detectChanges();
    await stable(fixture);

    await fixture.componentInstance.importJsonPayload(JSON.stringify(original));
    await stable(fixture);

    const tours = await storage.listTours();
    expect(tours).toHaveLength(2);
    expect(tours.map(t => t.id).filter(id => id === 'tour-a')).toHaveLength(1);
  });
});
