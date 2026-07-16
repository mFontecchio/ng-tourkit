import { DOCUMENT } from '@angular/common';
import { Injectable, OnDestroy, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TkLiveAnnouncer implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private node: HTMLDivElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  announce(msg: string): void {
    const node = this.ensureNode();
    node.textContent = '';

    if (this.timer !== null) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      node.textContent = msg;
      this.timer = null;
    }, 50);
  }

  ngOnDestroy(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.node?.remove();
    this.node = null;
  }

  private ensureNode(): HTMLDivElement {
    if (this.node) {
      return this.node;
    }

    const node = this.document.createElement('div');
    node.setAttribute('aria-live', 'polite');
    node.setAttribute('aria-atomic', 'true');
    node.style.position = 'absolute';
    node.style.width = '1px';
    node.style.height = '1px';
    node.style.margin = '-1px';
    node.style.border = '0';
    node.style.padding = '0';
    node.style.overflow = 'hidden';
    node.style.clip = 'rect(0 0 0 0)';
    this.document.body.appendChild(node);
    this.node = node;
    return node;
  }
}

