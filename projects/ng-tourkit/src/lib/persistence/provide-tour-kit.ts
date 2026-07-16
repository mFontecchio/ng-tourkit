import { EnvironmentProviders, InjectionToken, Type, makeEnvironmentProviders } from '@angular/core';
import { TourAudienceResolver, TOUR_AUDIENCE_RESOLVER } from '../audience/audience';
import { TourAuditAdapter, TourStorageAdapter } from './adapters';
import {
  LocalStorageTourAuditAdapter,
  LocalStorageTourStorageAdapter,
} from './local-storage.adapter';

/** Returns the current user's stable id for audit records. */
export type TourUserIdProvider = () => string;

export const TOUR_USER_ID = new InjectionToken<TourUserIdProvider>('TOUR_USER_ID', {
  factory: () => () => 'anonymous',
});

export interface TourKitConfig {
  /** Defaults to localStorage-backed dev adapter. */
  storage?: Type<TourStorageAdapter>;
  audit?: Type<TourAuditAdapter>;
  audienceResolver?: TourAudienceResolver;
  userId?: TourUserIdProvider;
}

export function provideTourKit(config: TourKitConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TourStorageAdapter, useClass: config.storage ?? LocalStorageTourStorageAdapter },
    { provide: TourAuditAdapter, useClass: config.audit ?? LocalStorageTourAuditAdapter },
    ...(config.audienceResolver
      ? [{ provide: TOUR_AUDIENCE_RESOLVER, useValue: config.audienceResolver }]
      : []),
    ...(config.userId ? [{ provide: TOUR_USER_ID, useValue: config.userId }] : []),
  ]);
}
