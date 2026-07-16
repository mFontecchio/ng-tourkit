import { DOCUMENT } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { generateLocator } from './selector-generator';
import { LocatorTimeoutError, TkSelectorResolver } from './selector-resolver';

function resolver(): TkSelectorResolver {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), { provide: DOCUMENT, useValue: document }] });
  return TestBed.inject(TkSelectorResolver);
}

function setBody(html: string): void {
  document.body.innerHTML = html;
}

describe('TkSelectorResolver', () => {
  it('resolves structural fallback', () => {
    setBody('<main><section><button>Save</button></section></main>');
    const locator = generateLocator(document.querySelector('button')!);
    const structuralOnly = { ...locator, candidates: locator.candidates.filter(candidate => candidate.strategy === 'structural') };

    const result = resolver().resolveSync(structuralOnly);

    expect(result?.element).toBe(document.querySelector('button'));
    expect(result?.candidate?.strategy).toBe('structural');
  });

  it('resolves text candidates specially', () => {
    setBody('<button>Save changes</button>');
    const locator = generateLocator(document.querySelector('button')!);
    const textOnly = { ...locator, candidates: locator.candidates.filter(candidate => candidate.strategy === 'text') };

    const result = resolver().resolveSync(textOnly);

    expect(result?.element).toBe(document.querySelector('button'));
    expect(result?.candidate?.strategy).toBe('text');
  });

  it('heals a moved element when selectors break', () => {
    setBody('<form><div><input id="email-field" type="email"></div><section></section></form>');
    const input = document.querySelector('input')!;
    const locator = generateLocator(input);
    input.removeAttribute('id');
    document.querySelector('section')!.append(input);
    document.querySelector('div')!.remove();
    document.querySelector('form')!.insertAdjacentHTML('beforeend', '<aside><input type="text"></aside>');

    const result = resolver().resolveSync(locator);

    expect(result?.element).toBe(input);
    expect(result?.candidate).toBeNull();
    expect(result?.healed).toBe(true);
  });

  it('waits asynchronously until an element appears', async () => {
    setBody('<main></main>');
    const later = document.createElement('button');
    later.setAttribute('data-testid', 'later-button');
    later.textContent = 'Later';
    document.body.append(later);
    const locator = generateLocator(later);
    later.remove();

    const promise = resolver().resolve(locator, { timeoutMs: 500 });
    queueMicrotask(() => document.querySelector('main')!.append(later));

    await expect(promise).resolves.toMatchObject({ element: later, healed: false });
  });

  it('rejects with LocatorTimeoutError on timeout', async () => {
    setBody('<main></main>');
    const missing = document.createElement('button');
    missing.setAttribute('data-testid', 'missing-button');
    missing.textContent = 'Missing';
    document.body.append(missing);
    const locator = generateLocator(missing);
    missing.remove();

    await expect(resolver().resolve(locator, { timeoutMs: 10 })).rejects.toBeInstanceOf(LocatorTimeoutError);
  });
});