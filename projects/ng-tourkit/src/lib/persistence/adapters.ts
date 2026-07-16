import { TourAuditEvent, TourDefinition } from '../models/tour.models';

/**
 * Storage for tour definitions. Implement against your backend; the library
 * ships a localStorage implementation for dev/demo.
 */
export abstract class TourStorageAdapter {
  abstract listTours(): Promise<TourDefinition[]>;
  abstract getTour(id: string): Promise<TourDefinition | null>;
  abstract saveTour(tour: TourDefinition): Promise<void>;
  abstract deleteTour(id: string): Promise<void>;
}

/** Audit trail: who saw what, when. */
export abstract class TourAuditAdapter {
  abstract recordEvent(event: TourAuditEvent): Promise<void>;
  abstract getEvents(tourId: string): Promise<TourAuditEvent[]>;
  /** True if userId completed tourId at version >= minVersion (any version when omitted). */
  abstract hasCompleted(tourId: string, userId: string, minVersion?: number): Promise<boolean>;
}
