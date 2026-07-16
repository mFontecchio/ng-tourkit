import { describe, expect, it } from 'vitest';
import { TOUR_SCHEMA_VERSION, TourDefinition } from '../models/tour.models';
import { roleAudienceResolver } from './audience';

const tour = (audience?: Record<string, unknown>): TourDefinition => ({
  schemaVersion: TOUR_SCHEMA_VERSION,
  id: 't',
  version: 1,
  name: 'T',
  status: 'published',
  steps: [],
  audience,
  createdAt: '',
  updatedAt: '',
});

describe('roleAudienceResolver', () => {
  it('allows everyone when no roles set', async () => {
    const r = roleAudienceResolver(() => ['user']);
    expect(await r(tour())).toBe(true);
    expect(await r(tour({ roles: [] }))).toBe(true);
  });

  it('matches any-of roles, supports async role source', async () => {
    const r = roleAudienceResolver(async () => ['admin']);
    expect(await r(tour({ roles: ['admin', 'pm'] }))).toBe(true);
    expect(await r(tour({ roles: ['pm'] }))).toBe(false);
  });
});
