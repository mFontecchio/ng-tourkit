import { afterEach, describe, expect, it } from 'vitest';

import { applyInert } from './inert-manager';

describe('applyInert', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('inerts body children except those containing an allowed element', () => {
    document.body.innerHTML = `
      <main id="app"></main>
      <div id="overlay"><section id="popover"></section></div>
      <aside id="side"></aside>
    `;
    const app = document.getElementById('app') as HTMLElement;
    const overlay = document.getElementById('overlay') as HTMLElement;
    const side = document.getElementById('side') as HTMLElement;
    const popover = document.getElementById('popover') as HTMLElement;

    const cleanup = applyInert([popover]);

    expect(app.hasAttribute('inert')).toBe(true);
    expect(side.hasAttribute('inert')).toBe(true);
    expect(overlay.hasAttribute('inert')).toBe(false);

    cleanup();
    expect(app.hasAttribute('inert')).toBe(false);
    expect(side.hasAttribute('inert')).toBe(false);
  });

  it('does not clobber pre-existing inert attributes', () => {
    document.body.innerHTML = `
      <main id="app" inert></main>
      <div id="overlay"></div>
    `;
    const app = document.getElementById('app') as HTMLElement;
    const overlay = document.getElementById('overlay') as HTMLElement;

    const cleanup = applyInert([overlay]);
    cleanup();

    expect(app.hasAttribute('inert')).toBe(true);
  });
});

