import { beforeEach, describe, expect, it } from 'vitest';
import { TOUR_SCHEMA_VERSION, TourAuditEvent, TourDefinition } from '../models/tour.models';
import {
  LocalStorageTourAuditAdapter,
  LocalStorageTourStorageAdapter,
} from './local-storage.adapter';

const tour = (id: string, version = 1): TourDefinition => ({
  schemaVersion: TOUR_SCHEMA_VERSION,
  id,
  version,
  name: `Tour ${id}`,
  status: 'published',
  steps: [{ id: 's1', title: 'T', body: 'B' }],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

const event = (over: Partial<TourAuditEvent>): TourAuditEvent => ({
  tourId: 't1',
  tourVersion: 1,
  userId: 'u1',
  type: 'completed',
  at: '2026-01-01T00:00:00Z',
  ...over,
});

describe('LocalStorage adapters', () => {
  beforeEach(() => localStorage.clear());

  it('saves, lists, gets, updates and deletes tours', async () => {
    const s = new LocalStorageTourStorageAdapter();
    await s.saveTour(tour('a'));
    await s.saveTour(tour('b'));
    expect((await s.listTours()).map(t => t.id)).toEqual(['a', 'b']);
    await s.saveTour({ ...tour('a'), name: 'Renamed' });
    expect((await s.getTour('a'))?.name).toBe('Renamed');
    await s.deleteTour('a');
    expect(await s.getTour('a')).toBeNull();
  });

  it('drops invalid stored data instead of throwing', async () => {
    localStorage.setItem('tk-tours', JSON.stringify([{ junk: true }]));
    expect(await new LocalStorageTourStorageAdapter().listTours()).toEqual([]);
  });

  it('records events and answers hasCompleted with version gate', async () => {
    const a = new LocalStorageTourAuditAdapter();
    await a.recordEvent(event({ type: 'started' }));
    await a.recordEvent(event({ type: 'completed', tourVersion: 2 }));
    expect(await a.hasCompleted('t1', 'u1')).toBe(true);
    expect(await a.hasCompleted('t1', 'u1', 3)).toBe(false);
    expect(await a.hasCompleted('t1', 'other')).toBe(false);
    expect((await a.getEvents('t1')).length).toBe(2);
  });
});
