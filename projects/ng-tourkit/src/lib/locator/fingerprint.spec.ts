import { describe, expect, it } from 'vitest';
import { captureFingerprint, fingerprintSimilarity } from './fingerprint';

function setBody(html: string): void {
  document.body.innerHTML = html;
}

describe('fingerprint', () => {
  it('captures stable element shape', () => {
    setBody('<main><section><button role="button" aria-label="Save" title="Save now">Save   now</button></section></main>');

    const fingerprint = captureFingerprint(document.querySelector('button')!);

    expect(fingerprint.tag).toBe('button');
    expect(fingerprint.text).toBe('Save now');
    expect(fingerprint.attributes).toMatchObject({ role: 'button', 'aria-label': 'Save', title: 'Save now' });
    expect(fingerprint.siblingIndex).toBe(0);
    expect(fingerprint.ancestry).toEqual(['section', 'main', 'body']);
  });

  it('scores similar fingerprints higher than unrelated ones', () => {
    setBody('<form><div><input type="email" name="email-address" placeholder="email-address"></div><section><input type="email" name="email-address" placeholder="email-address"></section><button>Delete</button></form>');

    const original = captureFingerprint(document.querySelector('div input')!);
    const moved = captureFingerprint(document.querySelector('section input')!);
    const unrelated = captureFingerprint(document.querySelector('button')!);

    expect(fingerprintSimilarity(original, moved)).toBeGreaterThan(0.75);
    expect(fingerprintSimilarity(original, unrelated)).toBeLessThan(0.5);
  });
});