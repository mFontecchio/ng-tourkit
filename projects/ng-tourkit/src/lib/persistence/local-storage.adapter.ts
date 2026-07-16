import { TourAuditEvent, TourDefinition } from '../models/tour.models';
import { isTourDefinition, migrateTourDefinition } from '../models/validation';
import { TourAuditAdapter, TourStorageAdapter } from './adapters';

const TOURS_KEY = 'tk-tours';
const AUDIT_KEY = 'tk-tour-audit';

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Dev/demo storage. Swap for an HTTP-backed adapter in production. */
export class LocalStorageTourStorageAdapter extends TourStorageAdapter {
  async listTours(): Promise<TourDefinition[]> {
    return read<unknown>(TOURS_KEY).map(migrateTourDefinition).filter(isTourDefinition);
  }

  async getTour(id: string): Promise<TourDefinition | null> {
    return (await this.listTours()).find((t) => t.id === id) ?? null;
  }

  async saveTour(tour: TourDefinition): Promise<void> {
    const tours = await this.listTours();
    const i = tours.findIndex((t) => t.id === tour.id);
    if (i >= 0) tours[i] = tour;
    else tours.push(tour);
    write(TOURS_KEY, tours);
  }

  async deleteTour(id: string): Promise<void> {
    write(
      TOURS_KEY,
      (await this.listTours()).filter((t) => t.id !== id),
    );
  }
}

/**  unbounded event list in localStorage — fine for dev, use a server adapter in prod. */
export class LocalStorageTourAuditAdapter extends TourAuditAdapter {
  async recordEvent(event: TourAuditEvent): Promise<void> {
    const events = read<TourAuditEvent>(AUDIT_KEY);
    events.push(event);
    write(AUDIT_KEY, events);
  }

  async getEvents(tourId: string): Promise<TourAuditEvent[]> {
    return read<TourAuditEvent>(AUDIT_KEY).filter((e) => e.tourId === tourId);
  }

  async hasCompleted(tourId: string, userId: string, minVersion?: number): Promise<boolean> {
    return read<TourAuditEvent>(AUDIT_KEY).some(
      (e) =>
        e.tourId === tourId &&
        e.userId === userId &&
        e.type === 'completed' &&
        (minVersion === undefined || e.tourVersion >= minVersion),
    );
  }
}
