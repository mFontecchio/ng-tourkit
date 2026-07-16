/**
 * Core tour schema. Version everything: definitions persist outside the app
 * and must survive both app redeploys and library upgrades.
 */

export const TOUR_SCHEMA_VERSION = 1 as const;

/** How a single CSS selector candidate was derived — used for quality feedback. */
export type SelectorStrategy =
  | 'test-id' // [data-testid], [data-tour], [data-test-id], [data-test]
  | 'id' // #human-readable-id (non GUID-like)
  | 'role-name' // [role=...][aria-label=...] or implicit role + accessible name
  | 'aria-label'
  | 'attribute' // name/rel/href/placeholder/title/alt or word-like data-*
  | 'text' // tag + trimmed text content match (resolved manually, not pure CSS)
  | 'css-path' // class/tag path from penalty-scored generation
  | 'structural'; // nth-of-type / nth-child chain — last resort

export interface SelectorCandidate {
  /** CSS selector, or for strategy 'text' a `tag|text` payload resolved by the engine. */
  readonly selector: string;
  readonly strategy: SelectorStrategy;
  /** Lower = more stable. Mirrors generation penalty; used to order the cascade. */
  readonly score: number;
}

/**
 * Structural fingerprint captured at record time. Used for fuzzy healing when
 * every selector candidate fails after an app redeploy.
 */
export interface ElementFingerprint {
  readonly tag: string;
  /** Trimmed, whitespace-collapsed text content (first 120 chars), empty if none. */
  readonly text: string;
  /** Stable attributes present at record time (role, name, type, aria-label, ...). */
  readonly attributes: Readonly<Record<string, string>>;
  /** Depth from document root. */
  readonly depth: number;
  /** Index among element siblings of the same tag. */
  readonly siblingIndex: number;
  /** Tag names of up to 3 ancestors, nearest first. */
  readonly ancestry: readonly string[];
}

export interface ElementLocator {
  readonly version: 1;
  /** Ordered most-stable-first. Resolver walks the cascade. */
  readonly candidates: readonly SelectorCandidate[];
  readonly fingerprint: ElementFingerprint;
}

/** Action optionally replayed when the step is shown or advanced. */
export type StepAction =
  | { readonly kind: 'click' }
  | { readonly kind: 'input'; readonly value: string };

export interface WaitCondition {
  /** Wait until this locator resolves to a visible element. Defaults to the step target. */
  readonly locator?: ElementLocator;
  /** Max wait in ms before the error policy applies. Default 5000. */
  readonly timeoutMs?: number;
}

export type PopoverSide = 'top' | 'right' | 'bottom' | 'left' | 'over';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface TourStep {
  readonly id: string;
  readonly title: string;
  /** Plain text body. Rendered as text, never as HTML. */
  readonly body: string;
  /** Absent = modal step centered on screen (no highlight). */
  readonly target?: ElementLocator;
  /** Route the step lives on. Player navigates here before resolving the target. */
  readonly route?: string;
  readonly side?: PopoverSide;
  readonly align?: PopoverAlign;
  /** Executed on the target when the user clicks Next (before advancing). */
  readonly action?: StepAction;
  /** Condition awaited before the step renders. */
  readonly waitFor?: WaitCondition;
}

export type TourStatus = 'draft' | 'published' | 'archived';

export interface TourDefinition {
  readonly schemaVersion: typeof TOUR_SCHEMA_VERSION;
  readonly id: string;
  /** Bumped on every published edit; audit records store the version viewed. */
  readonly version: number;
  readonly name: string;
  readonly description?: string;
  readonly status: TourStatus;
  readonly steps: readonly TourStep[];
  /**
   * Opaque targeting metadata interpreted by the consumer's audience resolver.
   * Built-in helper treats `{ roles: string[] }` as an any-of role match.
   */
  readonly audience?: Readonly<Record<string, unknown>>;
  /** Auto-launch for eligible users who have not completed it. */
  readonly autoLaunch?: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type TourAuditEventType =
  | 'started'
  | 'step_viewed'
  | 'completed'
  | 'dismissed';

export interface TourAuditEvent {
  readonly tourId: string;
  readonly tourVersion: number;
  readonly userId: string;
  readonly type: TourAuditEventType;
  readonly stepId?: string;
  readonly stepIndex?: number;
  /** ISO timestamp. */
  readonly at: string;
}
