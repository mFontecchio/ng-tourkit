export function applyInert(except: HTMLElement[]): () => void {
  const changed: HTMLElement[] = [];

  Array.from(document.body.children).forEach((child) => {
    if (!(child instanceof HTMLElement) || shouldRemainActive(child, except)) {
      return;
    }

    if (!child.hasAttribute('inert')) {
      child.setAttribute('inert', '');
      child.inert = true;
      changed.push(child);
    }
  });

  return () => {
    changed.forEach((el) => {
      el.removeAttribute('inert');
      el.inert = false;
    });
  };
}

function shouldRemainActive(child: HTMLElement, except: HTMLElement[]): boolean {
  return except.some((el) => child.contains(el) || el.contains(child));
}

