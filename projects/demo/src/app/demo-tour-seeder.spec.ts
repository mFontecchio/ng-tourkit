import { TestBed } from '@angular/core/testing';
import { TourDefinition, TourStorageAdapter } from '@mfontecchio/ng-tourkit';
import { DemoTourSeeder } from './demo-tour-seeder';
import { WORKFLOW_TOUR, WORKFLOW_TOUR_ID } from './workflow-tour';

class MemoryTourStorage extends TourStorageAdapter {
  readonly tours = new Map<string, TourDefinition>();
  readonly savedIds: string[] = [];

  async listTours(): Promise<TourDefinition[]> {
    return [...this.tours.values()];
  }

  async getTour(id: string): Promise<TourDefinition | null> {
    return this.tours.get(id) ?? null;
  }

  async saveTour(tour: TourDefinition): Promise<void> {
    this.savedIds.push(tour.id);
    this.tours.set(tour.id, tour);
  }

  async deleteTour(id: string): Promise<void> {
    this.tours.delete(id);
  }
}

describe('DemoTourSeeder', () => {
  let seeder: DemoTourSeeder;
  let storage: MemoryTourStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DemoTourSeeder,
        MemoryTourStorage,
        { provide: TourStorageAdapter, useExisting: MemoryTourStorage },
      ],
    });

    seeder = TestBed.inject(DemoTourSeeder);
    storage = TestBed.inject(MemoryTourStorage);
  });

  it('saves the bundled workflow tour when it is absent', async () => {
    await seeder.seed();

    expect(await storage.getTour(WORKFLOW_TOUR_ID)).toEqual(WORKFLOW_TOUR);
  });

  it.each([
    ['same', WORKFLOW_TOUR.version],
    ['newer', WORKFLOW_TOUR.version + 1],
  ])('preserves a %s-version stored copy', async (_label, version) => {
    const stored = { ...WORKFLOW_TOUR, version, name: 'Locally edited workflow' };
    storage.tours.set(stored.id, stored);

    await seeder.seed();

    expect(await storage.getTour(WORKFLOW_TOUR_ID)).toBe(stored);
    expect(storage.savedIds).toEqual([]);
  });

  it('replaces an older stored copy', async () => {
    storage.tours.set(WORKFLOW_TOUR_ID, {
      ...WORKFLOW_TOUR,
      version: WORKFLOW_TOUR.version - 1,
    });

    await seeder.seed();

    expect(await storage.getTour(WORKFLOW_TOUR_ID)).toEqual(WORKFLOW_TOUR);
    expect(storage.savedIds).toEqual([WORKFLOW_TOUR_ID]);
  });

  it('replaces a same-version copy that still uses pre-playground routes', async () => {
    storage.tours.set(WORKFLOW_TOUR_ID, {
      ...WORKFLOW_TOUR,
      version: WORKFLOW_TOUR.version,
      steps: WORKFLOW_TOUR.steps.map((step) => ({
        ...step,
        route: step.route?.replace(/^\/playground/, '') || '/',
      })),
    });

    await seeder.seed();

    expect(await storage.getTour(WORKFLOW_TOUR_ID)).toEqual(WORKFLOW_TOUR);
    expect(storage.savedIds).toEqual([WORKFLOW_TOUR_ID]);
  });

  it('leaves unrelated tours untouched', async () => {
    const other = { ...WORKFLOW_TOUR, id: 'user-created-tour', name: 'User-created tour' };
    storage.tours.set(other.id, other);

    await seeder.seed();

    expect(await storage.getTour(other.id)).toBe(other);
  });
});
