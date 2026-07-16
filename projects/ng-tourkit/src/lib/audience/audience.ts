import { InjectionToken } from '@angular/core';
import { TourDefinition } from '../models/tour.models';

/**
 * Decides whether the current user should see a tour, based on the tour's
 * opaque `audience` metadata. Consumers wire their own auth/role logic here.
 */
export type TourAudienceResolver = (tour: TourDefinition) => boolean | Promise<boolean>;

export const TOUR_AUDIENCE_RESOLVER = new InjectionToken<TourAudienceResolver>(
  'TOUR_AUDIENCE_RESOLVER',
  { factory: () => () => true },
);

/**
 * Helper for the common case: tour.audience = { roles: string[] } matches if the
 * user has ANY listed role. Tours with no audience/roles are visible to everyone.
 */
export function roleAudienceResolver(getUserRoles: () => readonly string[] | Promise<readonly string[]>): TourAudienceResolver {
  return async tour => {
    const roles = tour.audience?.['roles'];
    if (!Array.isArray(roles) || roles.length === 0) return true;
    const userRoles = await getUserRoles();
    return roles.some(r => userRoles.includes(r as string));
  };
}
