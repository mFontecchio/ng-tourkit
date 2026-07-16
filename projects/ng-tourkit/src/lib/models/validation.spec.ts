import { describe, expect, it } from 'vitest';
import { TOUR_SCHEMA_VERSION, TourDefinition } from './tour.models';
import { isTourDefinition, validateTourDefinition } from './validation';

const locator = {
  version: 1,
  candidates: [{ selector: '[data-testid="save"]', strategy: 'test-id', score: 0 }],
  fingerprint: { tag: 'button', text: 'Save', attributes: {}, depth: 5, siblingIndex: 0, ancestry: ['div'] },
};

const tour: TourDefinition = {
  schemaVersion: TOUR_SCHEMA_VERSION,
  id: 't1',
  version: 1,
  name: 'Onboarding',
  status: 'published',
  steps: [{ id: 's1', title: 'Save', body: 'Click save.', target: locator } as never],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('validateTourDefinition', () => {
  it('accepts a valid tour', () => {
    expect(validateTourDefinition(tour)).toEqual([]);
    expect(isTourDefinition(tour)).toBe(true);
  });

  it('rejects non-objects and missing fields', () => {
    expect(validateTourDefinition(null).length).toBe(1);
    expect(validateTourDefinition({ ...tour, id: '' }).some(i => i.path === 'id')).toBe(true);
    expect(validateTourDefinition({ ...tour, status: 'live' }).some(i => i.path === 'status')).toBe(true);
  });

  it('rejects duplicate step ids', () => {
    const dup = { ...tour, steps: [...tour.steps, ...tour.steps] };
    expect(validateTourDefinition(dup).some(i => i.message.includes('duplicate'))).toBe(true);
  });

  it('rejects action without target', () => {
    const bad = { ...tour, steps: [{ id: 's1', title: 'x', body: '', action: { kind: 'click' } }] };
    expect(validateTourDefinition(bad).some(i => i.path.endsWith('action'))).toBe(true);
  });

  it('rejects locator without candidates', () => {
    const bad = { ...tour, steps: [{ id: 's1', title: 'x', body: '', target: { ...locator, candidates: [] } }] };
    expect(validateTourDefinition(bad).some(i => i.path.includes('candidates'))).toBe(true);
  });
});
