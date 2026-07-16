import { afterEach, describe, expect, it } from 'vitest';

import { trapFocus } from './focus-trap';

describe('trapFocus', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('wraps focus forward and backward', () => {
    document.body.innerHTML = `
      <button id="before">Before</button>
      <div id="trap">
        <button id="first">First</button>
        <button id="last">Last</button>
      </div>
    `;
    const trap = document.getElementById('trap') as HTMLElement;
    const first = document.getElementById('first') as HTMLButtonElement;
    const last = document.getElementById('last') as HTMLButtonElement;
    const cleanup = trapFocus(trap);

    expect(document.activeElement).toBe(first);

    last.focus();
    trap.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);

    first.focus();
    trap.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);

    cleanup();
  });

  it('restores previously focused element on cleanup', () => {
    document.body.innerHTML = `
      <button id="before">Before</button>
      <div id="trap"><button id="first">First</button></div>
    `;
    const before = document.getElementById('before') as HTMLButtonElement;
    before.focus();

    const cleanup = trapFocus(document.getElementById('trap') as HTMLElement);
    expect(document.activeElement?.id).toBe('first');

    cleanup();
    expect(document.activeElement).toBe(before);
  });
});

