import { ElementFingerprint } from '../models/tour.models';

const TEXT_LIMIT = 120;
const STABLE_ATTRIBUTES = [
  'role',
  'name',
  'type',
  'aria-label',
  'placeholder',
  'href',
  'title',
] as const;

export function normalizeText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

export function captureFingerprint(el: Element): ElementFingerprint {
  const tag = el.tagName.toLowerCase();
  const attributes: Record<string, string> = {};

  for (const name of STABLE_ATTRIBUTES) {
    const value = el.getAttribute(name);
    if (value !== null && value !== '') {
      attributes[name] = normalizeText(value);
    }
  }

  return {
    tag,
    text: normalizeText(el.textContent).slice(0, TEXT_LIMIT),
    attributes,
    depth: depthOf(el),
    siblingIndex: siblingIndexOf(el),
    ancestry: ancestryOf(el),
  };
}

export function fingerprintSimilarity(a: ElementFingerprint, b: ElementFingerprint): number {
  return clamp01(
    exact(a.tag, b.tag) * 0.25 +
      textSimilarity(a.text, b.text) * 0.3 +
      attributeSimilarity(a.attributes, b.attributes) * 0.2 +
      ancestrySimilarity(a.ancestry, b.ancestry) * 0.15 +
      positionSimilarity(a, b) * 0.1,
  );
}

function depthOf(el: Element): number {
  let depth = 0;
  let current: ParentNode | null = el.parentNode;
  while (current) {
    depth++;
    current = current.parentNode;
  }
  return depth;
}

function siblingIndexOf(el: Element): number {
  const parent = el.parentElement;
  if (!parent) {
    return 0;
  }

  return Array.from(parent.children)
    .filter(child => child.tagName === el.tagName)
    .indexOf(el);
}

function ancestryOf(el: Element): readonly string[] {
  const ancestry: string[] = [];
  let current = el.parentElement;
  while (current && ancestry.length < 3) {
    ancestry.push(current.tagName.toLowerCase());
    current = current.parentElement;
  }
  return ancestry;
}

function exact(a: string, b: string): number {
  return a === b ? 1 : 0;
}

function textSimilarity(a: string, b: string): number {
  if (!a && !b) {
    return 1;
  }
  if (!a || !b) {
    return 0;
  }

  const aTokens = tokens(a);
  const bTokens = tokens(b);
  if (aTokens.size === 0 || bTokens.size === 0) {
    return a === b ? 1 : 0;
  }

  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) {
      overlap++;
    }
  }

  return overlap / Math.max(aTokens.size, bTokens.size);
}

function tokens(value: string): Set<string> {
  return new Set(normalizeText(value).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

function attributeSimilarity(a: Readonly<Record<string, string>>, b: Readonly<Record<string, string>>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  if (keys.size === 0) {
    return 1;
  }

  let matches = 0;
  for (const key of keys) {
    if (a[key] !== undefined && a[key] === b[key]) {
      matches++;
    }
  }

  return matches / keys.size;
}

function ancestrySimilarity(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 && b.length === 0) {
    return 1;
  }

  const max = Math.max(a.length, b.length);
  let matches = 0;
  for (let i = 0; i < max; i++) {
    if (a[i] !== undefined && a[i] === b[i]) {
      matches++;
    }
  }

  return matches / max;
}

function positionSimilarity(a: ElementFingerprint, b: ElementFingerprint): number {
  const depth = proximity(a.depth, b.depth, 6);
  const sibling = proximity(a.siblingIndex, b.siblingIndex, 6);
  return (depth + sibling) / 2;
}

function proximity(a: number, b: number, tolerance: number): number {
  return Math.max(0, 1 - Math.abs(a - b) / tolerance);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}