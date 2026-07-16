import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ElementLocator, SelectorCandidate } from '../models/tour.models';
import { captureFingerprint, fingerprintSimilarity, normalizeText } from './fingerprint';

export interface ResolveResult {
  readonly element: HTMLElement;
  readonly candidate: SelectorCandidate | null;
  readonly healed: boolean;
}

export class LocatorTimeoutError extends Error {
  override readonly name = 'LocatorTimeoutError';

  constructor(readonly locator: ElementLocator) {
    super('Timed out resolving locator.');
  }
}

@Injectable({ providedIn: 'root' })
export class TkSelectorResolver {
  private readonly document = inject(DOCUMENT);

  resolveSync(locator: ElementLocator, root: ParentNode = this.document): ResolveResult | null {
    for (const candidate of [...locator.candidates].sort((a, b) => a.score - b.score)) {
      const element = candidate.strategy === 'text'
        ? resolveText(candidate, root)
        : resolveCss(candidate, root);
      if (element) {
        return { element, candidate, healed: false };
      }
    }

    return heal(locator, root);
  }

  resolve(
    locator: ElementLocator,
    opts: { timeoutMs?: number; root?: ParentNode; signal?: AbortSignal } = {},
  ): Promise<ResolveResult> {
    const root = opts.root ?? this.document;
    const immediate = this.resolveSync(locator, root);
    if (immediate) {
      return Promise.resolve(immediate);
    }

    return new Promise((resolve, reject) => {
      let queued = false;
      let done = false;
      const observer = new MutationObserver(schedule);
      const timeout = setTimeout(() => finish(null), opts.timeoutMs ?? 5000);

      const abort = (): void => finish(null, opts.signal?.reason instanceof Error ? opts.signal.reason : new DOMException('Aborted', 'AbortError'));
      const cleanup = (): void => {
        done = true;
        clearTimeout(timeout);
        observer.disconnect();
        opts.signal?.removeEventListener('abort', abort);
      };
      const finish = (result: ResolveResult | null, error?: Error): void => {
        if (done) {
          return;
        }
        cleanup();
        if (result) {
          resolve(result);
        } else {
          reject(error ?? new LocatorTimeoutError(locator));
        }
      };

      const check = (): void => {
        queued = false;
        const result = this.resolveSync(locator, root);
        if (result) {
          finish(result);
        }
      };

      function schedule(): void {
        if (queued || done) {
          return;
        }
        queued = true;
        queueMicrotask(() => (globalThis.requestAnimationFrame ?? setTimeout)(check));
      }

      if (opts.signal?.aborted) {
        abort();
        return;
      }

      opts.signal?.addEventListener('abort', abort, { once: true });
      observer.observe(root, { childList: true, subtree: true, attributes: true });
      schedule();
    });
  }
}

function resolveCss(candidate: SelectorCandidate, root: ParentNode): HTMLElement | null {
  try {
    const matches = Array.from(root.querySelectorAll(candidate.selector)).filter(isVisibleHtml);
    return matches.length === 1 ? matches[0] : null;
  } catch {
    return null;
  }
}

function resolveText(candidate: SelectorCandidate, root: ParentNode): HTMLElement | null {
  const [tag, ...textParts] = candidate.selector.split('|');
  const text = textParts.join('|');
  if (!tag || !text) {
    return null;
  }

  const matches = Array.from(root.querySelectorAll(tag))
    .filter(isVisibleHtml)
    .filter(el => normalizeText(el.textContent) === text);
  return matches.length === 1 ? matches[0] : null;
}

function heal(locator: ElementLocator, root: ParentNode): ResolveResult | null {
  const tag = locator.fingerprint.tag;
  let best: { element: HTMLElement; score: number } | null = null;

  for (const element of Array.from(root.querySelectorAll(tag)).filter(isVisibleHtml)) {
    const score = fingerprintSimilarity(locator.fingerprint, captureFingerprint(element));
    if (!best || score > best.score) {
      best = { element, score };
    }
  }

  return best && best.score >= 0.75 ? { element: best.element, candidate: null, healed: true } : null;
}

function isVisibleHtml(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) {
    return false;
  }
  return el.checkVisibility?.({ checkOpacity: true, checkVisibilityCSS: true }) ?? true;
}