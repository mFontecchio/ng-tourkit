import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TkTourPopoverComponent } from './popover.component';

describe('TkTourPopoverComponent', () => {
  let fixture: ComponentFixture<TkTourPopoverComponent>;

  afterEach(() => {
    fixture?.destroy();
  });

  async function render(): Promise<ComponentFixture<TkTourPopoverComponent>> {
    await TestBed.configureTestingModule({
      imports: [TkTourPopoverComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TkTourPopoverComponent);
    fixture.componentRef.setInput('title', 'Welcome');
    fixture.componentRef.setInput('body', 'Plain body');
    fixture.componentRef.setInput('stepIndex', 0);
    fixture.componentRef.setInput('stepCount', 2);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('renders dialog content and progress text', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('role')).toBe('dialog');
    expect(host.getAttribute('aria-modal')).toBe('true');
    expect(host.textContent).toContain('Welcome');
    expect(host.textContent).toContain('Plain body');
    expect(host.textContent).toContain('Step 1 of 2');
  });

  it('emits button outputs', async () => {
    const fixture = await render();
    const component = fixture.componentInstance;
    const prev = vi.fn();
    const next = vi.fn();
    const closed = vi.fn();
    component.prev.subscribe(prev);
    component.next.subscribe(next);
    component.closed.subscribe(closed);

    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find((button) => button.textContent?.trim() === 'Prev')?.click();
    buttons.find((button) => button.textContent?.trim() === 'Next')?.click();
    buttons.find((button) => button.textContent?.trim() === '×')?.click();

    expect(prev).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
    expect(closed).toHaveBeenCalledOnce();
  });

  it('emits closed on Escape', async () => {
    const fixture = await render();
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closed).toHaveBeenCalledOnce();
  });

  it('renders body as text, not HTML', async () => {
    const fixture = await render();
    fixture.componentRef.setInput('body', '<img src=x onerror=alert(1)>Hello');
    fixture.detectChanges();
    await fixture.whenStable();

    const body = (fixture.nativeElement as HTMLElement).querySelector('p') as HTMLParagraphElement;
    expect(body.textContent).toBe('<img src=x onerror=alert(1)>Hello');
    expect(body.querySelector('img')).toBeNull();
  });
});

