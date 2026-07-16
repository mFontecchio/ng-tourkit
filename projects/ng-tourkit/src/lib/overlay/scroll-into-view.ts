import { prefersReducedMotion } from '../a11y/reduced-motion';

export function bringInView(el: HTMLElement): void {
  if (typeof el.scrollIntoView !== 'function') return; // jsdom
  const rect = el.getBoundingClientRect();
  const viewportHeight = globalThis.innerHeight || document.documentElement.clientHeight;
  const tallerThanViewport = rect.height > viewportHeight;

  el.scrollIntoView({
    behavior: hasScrollableParent(el) || prefersReducedMotion() ? 'auto' : 'smooth',
    block: tallerThanViewport ? 'start' : 'center',
    inline: 'center',
  });
}

function hasScrollableParent(el: HTMLElement): boolean {
  let parent = el.parentElement;

  while (parent) {
    const style = getComputedStyle(parent);
    const canScrollY =
      parent.scrollHeight > parent.clientHeight &&
      (style.overflowY === 'auto' || style.overflowY === 'scroll');

    if (canScrollY) {
      return true;
    }

    parent = parent.parentElement;
  }

  return false;
}

