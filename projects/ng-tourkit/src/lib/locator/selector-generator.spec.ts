import { describe, expect, it } from 'vitest';
import { generateLocator, isGuidLike, scoreQuality, wordLike } from './selector-generator';

function setBody(html: string): void {
  document.body.innerHTML = html;
}

describe('generateLocator', () => {
  it('orders test-id first and marks stable quality', () => {
    setBody('<button data-testid="save" id="save-button" aria-label="Save">Save</button>');

    const locator = generateLocator(document.querySelector('button')!);

    expect(locator.candidates[0]).toMatchObject({ selector: '[data-testid="save"]', strategy: 'test-id', score: 0 });
    expect(scoreQuality(locator)).toBe('stable');
  });

  it('skips GUID-like ids', () => {
    setBody('<button id="550e8400-e29b-41d4-a716-446655440000">Save</button>');

    const locator = generateLocator(document.querySelector('button')!);

    expect(isGuidLike('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(locator.candidates.some(candidate => candidate.strategy === 'id')).toBe(false);
  });

  it('rejects hashed class names as word-like values', () => {
    setBody('<button class="css-1q2w3e x9fK2 real-button">Save</button>');

    const locator = generateLocator(document.querySelector('button')!);

    expect(wordLike('css-1q2w3e')).toBe(false);
    expect(wordLike('x9fK2')).toBe(false);
    expect(locator.candidates.some(candidate => candidate.selector.includes('css-1q2w3e'))).toBe(false);
    expect(locator.candidates.some(candidate => candidate.selector.includes('x9fK2'))).toBe(false);
  });

  it('drops ambiguous CSS attribute candidates', () => {
    setBody('<button name="save-button">One</button><button name="save-button">Two</button>');

    const locator = generateLocator(document.querySelector('button')!);

    expect(locator.candidates.some(candidate => candidate.selector === '[name="save-button"]')).toBe(false);
  });

  it('always includes structural fallback last', () => {
    setBody('<main><section><button>Save</button></section></main>');

    const locator = generateLocator(document.querySelector('button')!);
    const last = locator.candidates.at(-1);

    expect(last?.strategy).toBe('structural');
    expect(document.querySelectorAll(last!.selector)).toHaveLength(1);
  });
});