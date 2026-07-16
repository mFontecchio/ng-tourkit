import {
  ElementLocator,
  TOUR_SCHEMA_VERSION,
  TourDefinition,
  TourStep,
} from './tour.models';

export interface ValidationIssue {
  readonly path: string;
  readonly message: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

function validateLocator(v: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(v)) {
    issues.push({ path, message: 'locator must be an object' });
    return;
  }
  if (v['version'] !== 1) issues.push({ path: `${path}.version`, message: 'unsupported locator version' });
  if (!Array.isArray(v['candidates']) || v['candidates'].length === 0) {
    issues.push({ path: `${path}.candidates`, message: 'at least one selector candidate is required' });
  } else {
    v['candidates'].forEach((c: unknown, i: number) => {
      if (!isRecord(c) || !isNonEmptyString(c['selector']) || typeof c['score'] !== 'number') {
        issues.push({ path: `${path}.candidates[${i}]`, message: 'candidate needs selector and score' });
      }
    });
  }
  if (!isRecord(v['fingerprint']) || !isNonEmptyString((v['fingerprint'] as Record<string, unknown>)['tag'])) {
    issues.push({ path: `${path}.fingerprint`, message: 'fingerprint with tag is required' });
  }
}

function validateStep(v: unknown, path: string, issues: ValidationIssue[]): void {
  if (!isRecord(v)) {
    issues.push({ path, message: 'step must be an object' });
    return;
  }
  if (!isNonEmptyString(v['id'])) issues.push({ path: `${path}.id`, message: 'step id is required' });
  if (!isNonEmptyString(v['title'])) issues.push({ path: `${path}.title`, message: 'step title is required' });
  if (typeof v['body'] !== 'string') issues.push({ path: `${path}.body`, message: 'step body must be a string' });
  if (v['target'] !== undefined) validateLocator(v['target'], `${path}.target`, issues);
  if (v['action'] !== undefined) {
    const a = v['action'];
    const ok =
      isRecord(a) &&
      (a['kind'] === 'click' || (a['kind'] === 'input' && typeof a['value'] === 'string'));
    if (!ok) issues.push({ path: `${path}.action`, message: 'action must be click or input with value' });
    if (ok && v['target'] === undefined) {
      issues.push({ path: `${path}.action`, message: 'action requires a target' });
    }
  }
}

/** Structural validation for definitions loaded from storage. Returns all issues. */
export function validateTourDefinition(value: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isRecord(value)) return [{ path: '', message: 'tour must be an object' }];
  if (value['schemaVersion'] !== TOUR_SCHEMA_VERSION) {
    issues.push({ path: 'schemaVersion', message: `expected schema version ${TOUR_SCHEMA_VERSION}` });
  }
  if (!isNonEmptyString(value['id'])) issues.push({ path: 'id', message: 'tour id is required' });
  if (!isNonEmptyString(value['name'])) issues.push({ path: 'name', message: 'tour name is required' });
  if (typeof value['version'] !== 'number' || value['version'] < 1) {
    issues.push({ path: 'version', message: 'version must be a positive number' });
  }
  if (!['draft', 'published', 'archived'].includes(value['status'] as string)) {
    issues.push({ path: 'status', message: 'status must be draft|published|archived' });
  }
  if (!Array.isArray(value['steps'])) {
    issues.push({ path: 'steps', message: 'steps must be an array' });
  } else {
    value['steps'].forEach((s: unknown, i: number) => validateStep(s, `steps[${i}]`, issues));
    const ids = new Set<string>();
    for (const s of value['steps'] as TourStep[]) {
      if (isRecord(s) && typeof s.id === 'string') {
        if (ids.has(s.id)) issues.push({ path: 'steps', message: `duplicate step id "${s.id}"` });
        ids.add(s.id);
      }
    }
  }
  return issues;
}

export function isTourDefinition(value: unknown): value is TourDefinition {
  return validateTourDefinition(value).length === 0;
}

/**
 * Migrate a stored definition to the current schema version.
 * ponytail: single version today — this is the seam future migrations plug into.
 */
export function migrateTourDefinition(value: unknown): unknown {
  return value;
}

export function isElementLocator(value: unknown): value is ElementLocator {
  const issues: ValidationIssue[] = [];
  validateLocator(value, '', issues);
  return issues.length === 0;
}
