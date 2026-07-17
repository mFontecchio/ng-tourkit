import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TkSelectComponent, TkSelectOption } from './select.component';

const options: readonly TkSelectOption[] = [
  { value: 'top', label: 'top' },
  { value: 'right', label: 'right' },
  { value: 'bottom', label: 'bottom', disabled: true },
  { value: 'left', label: 'left' },
];

describe('TkSelectComponent', () => {
  let fixture: ComponentFixture<TkSelectComponent>;

  afterEach(() => {
    fixture?.destroy();
  });

  async function render(
    patch: { value?: string; placeholder?: string; disabled?: boolean } = {},
  ): Promise<ComponentFixture<TkSelectComponent>> {
    await TestBed.configureTestingModule({
      imports: [TkSelectComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TkSelectComponent);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', patch.value ?? '');
    fixture.componentRef.setInput('placeholder', patch.placeholder ?? 'Pick one');
    fixture.componentRef.setInput('disabled', patch.disabled ?? false);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  function trigger(): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
  }

  function listOptions(): HTMLLIElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('[role="option"]'));
  }

  it('renders the selected label and placeholder', async () => {
    await render({ value: 'right' });
    expect(trigger().textContent).toContain('right');

    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(trigger().textContent).toContain('Pick one');
  });

  it('emits valueChange when an option is clicked', async () => {
    await render();
    const onChange = vi.fn();
    fixture.componentInstance.valueChange.subscribe(onChange);

    trigger().click();
    fixture.detectChanges();
    listOptions()
      .find(option => option.textContent?.trim() === 'left')
      ?.click();
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('left');
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('supports keyboard navigation and selection', async () => {
    await render({ value: 'top' });
    const onChange = vi.fn();
    fixture.componentInstance.valueChange.subscribe(onChange);
    const host = fixture.nativeElement as HTMLElement;

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(true);

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(1);

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('right');
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('skips disabled options and does not select them', async () => {
    await render({ value: 'right' });
    const onChange = vi.fn();
    fixture.componentInstance.valueChange.subscribe(onChange);
    const host = fixture.nativeElement as HTMLElement;

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.activeIndex()).toBe(3);

    const disabled = listOptions().find(option => option.textContent?.trim() === 'bottom');
    disabled?.click();
    fixture.detectChanges();

    expect(onChange).not.toHaveBeenCalled();
    expect(fixture.componentInstance.open()).toBe(true);
  });

  it('closes on Escape and focus leaving the control', async () => {
    await render();
    const host = fixture.nativeElement as HTMLElement;

    trigger().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(true);

    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);

    trigger().click();
    fixture.detectChanges();
    host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });

  it('does not open when disabled', async () => {
    await render({ disabled: true });
    trigger().click();
    fixture.detectChanges();
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
