import { ElementLocator, SelectorCandidate } from '../models/tour.models';
import { captureFingerprint, normalizeText } from './fingerprint';

const DEFAULT_TEST_ID_ATTRIBUTES = ['data-tour', 'data-testid', 'data-test-id', 'data-test'];
const WORD_ATTRIBUTES = ['name', 'placeholder', 'title', 'alt', 'rel'];
const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function generateLocator(
  el: Element,
  opts: { testIdAttributes?: string[]; root?: ParentNode } = {},
): ElementLocator {
  const root = opts.root ?? el.ownerDocument;
  const candidates: SelectorCandidate[] = [];
  const seen = new Set<string>();
  const add = (candidate: SelectorCandidate, css = true): void => {
    const key = `${candidate.strategy}|${candidate.selector}`;
    if (seen.has(key) || (css && !isUnique(candidate.selector, el, root))) {
      return;
    }
    seen.add(key);
    candidates.push(candidate);
  };

  for (const attr of opts.testIdAttributes ?? DEFAULT_TEST_ID_ATTRIBUTES) {
    const value = el.getAttribute(attr);
    if (value) {
      add({ selector: attrSelector(attr, value), strategy: 'test-id', score: 0 });
    }
  }

  const id = el.id;
  if (id && !isGuidLike(id)) {
    add({ selector: `#${cssEscape(id)}`, strategy: 'id', score: 1 });
  }

  const ariaLabel = el.getAttribute('aria-label');
  const role = el.getAttribute('role');
  if (role && ariaLabel) {
    add({ selector: `${attrSelector('role', role)}${attrSelector('aria-label', ariaLabel)}`, strategy: 'role-name', score: 2 });
  }
  if (ariaLabel) {
    add({ selector: attrSelector('aria-label', ariaLabel), strategy: 'aria-label', score: 2 });
  }

  for (const attr of WORD_ATTRIBUTES) {
    const value = el.getAttribute(attr);
    if (value && wordLike(value)) {
      add({ selector: attrSelector(attr, value), strategy: 'attribute', score: 3 });
    }
  }

  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith('data-') && wordLike(attr.name.slice(5)) && wordLike(attr.value)) {
      add({ selector: attrSelector(attr.name, attr.value), strategy: 'attribute', score: 3 });
    }
  }

  const text = normalizeText(el.textContent);
  if (text) {
    candidates.push({ selector: `${el.tagName.toLowerCase()}|${text}`, strategy: 'text', score: 4 });
  }

  const cssPath = bestCssPath(el, root);
  if (cssPath) {
    add({ selector: cssPath.selector, strategy: 'css-path', score: 5 + cssPath.penalty / 100 });
  }

  const structural = structuralPath(el);
  candidates.push({ selector: structural, strategy: 'structural', score: 100 });

  return {
    version: 1,
    candidates: candidates.sort((a, b) => a.score - b.score),
    fingerprint: captureFingerprint(el),
  };
}

export function scoreQuality(locator: ElementLocator): 'stable' | 'ok' | 'fragile' {
  const best = locator.candidates[0]?.score ?? Number.POSITIVE_INFINITY;
  if (best <= 1) {
    return 'stable';
  }
  if (best <= 4) {
    return 'ok';
  }
  return 'fragile';
}

export function isGuidLike(value: string): boolean {
  const compact = value.trim();
  if (GUID_RE.test(compact)) {
    return true;
  }

  const digits = (compact.match(/\d/g) ?? []).length;
  const hex = (compact.match(/[a-f0-9]/gi) ?? []).length;
  return (compact.length >= 8 && hex / compact.length > 0.8) || (digits > 3 && /[a-z]/i.test(compact));
}

export function wordLike(value: string): boolean {
  const normalized = value.trim();
  if (normalized.length < 3 || normalized !== normalized.toLowerCase()) {
    return false;
  }
  if (!/^[a-z][a-z-]*[a-z]$/.test(normalized)) {
    return false;
  }

  const words = normalized.split('-');
  return words.every(word => word.length > 2 && !/[bcdfghjklmnpqrstvwxyz]{4,}/.test(word));
}

function bestCssPath(el: Element, root: ParentNode): { selector: string; penalty: number } | null {
  let current: Element | null = el;
  let paths: Array<{ selector: string; penalty: number }> = [{ selector: '', penalty: 0 }];

  while (current) {
    const parts = selectorParts(current);
    paths = parts
      .flatMap(part => paths.map(path => ({
        selector: path.selector ? `${part.selector} > ${path.selector}` : part.selector,
        penalty: path.penalty + part.penalty,
      })))
      .sort((a, b) => a.penalty - b.penalty || a.selector.length - b.selector.length)
      .slice(0, 20);

    const unique = paths.find(path => isUnique(path.selector, el, root));
    if (unique) {
      return unique;
    }

    current = current.parentElement;
  }

  return null;
}

function selectorParts(el: Element): Array<{ selector: string; penalty: number }> {
  const tag = el.tagName.toLowerCase();
  const parts = Array.from(el.classList)
    .filter(wordLike)
    .map(className => ({ selector: `.${cssEscape(className)}`, penalty: 1 }));

  parts.push({ selector: tag, penalty: 5 });
  parts.push({ selector: `${tag}:nth-of-type(${siblingIndex(el, true) + 1})`, penalty: 10 });
  parts.push({ selector: `${tag}:nth-child(${siblingIndex(el, false) + 1})`, penalty: 50 });

  return parts;
}

function structuralPath(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;
  while (current) {
    const tag = current.tagName.toLowerCase();
    parts.unshift(`${tag}:nth-of-type(${siblingIndex(current, true) + 1})`);
    current = current.parentElement;
  }
  return parts.join(' > ');
}

function siblingIndex(el: Element, sameTag: boolean): number {
  const parent = el.parentElement;
  if (!parent) {
    return 0;
  }

  const siblings = Array.from(parent.children).filter(child => !sameTag || child.tagName === el.tagName);
  return siblings.indexOf(el);
}

function isUnique(selector: string, el: Element, root: ParentNode): boolean {
  try {
    const matches = Array.from(root.querySelectorAll(selector));
    return matches.length === 1 && matches[0] === el;
  } catch {
    return false;
  }
}

function attrSelector(name: string, value: string): string {
  return `[${cssEscape(name)}="${cssString(value)}"]`;
}

function cssEscape(value: string): string {
  return globalThis.CSS?.escape?.(value) ?? value.replace(/[^a-zA-Z0-9_-]/g, char => `\\${char}`);
}

function cssString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}