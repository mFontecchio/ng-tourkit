import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { TK_THEME_CSS } from './theme';

export interface TkSelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

let nextSelectId = 0;

@Component({
  selector: 'tk-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tk-select',
    '[class.tk-select--open]': 'open()',
    '(keydown)': 'onHostKeydown($event)',
    '(focusout)': 'onFocusOut($event)',
  },
  template: `
    <button
      #trigger
      type="button"
      class="tk-select__trigger"
      role="combobox"
      [id]="controlId()"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="listboxId"
      [attr.aria-activedescendant]="activeOptionId()"
      aria-haspopup="listbox"
      [disabled]="disabled()"
      (click)="toggle()"
    >
      <span class="tk-select__value" [class.tk-select__value--placeholder]="!selectedOption()">
        {{ selectedOption()?.label ?? placeholder() }}
      </span>
      <svg class="tk-select__chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M3 4.5 6 7.5 9 4.5"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    @if (open()) {
      <ul
        #listbox
        class="tk-select__list"
        role="listbox"
        [id]="listboxId"
        [attr.aria-labelledby]="controlId()"
      >
        @for (option of options(); track option.value; let i = $index) {
          <li
            role="option"
            class="tk-select__option"
            [id]="optionId(i)"
            [class.tk-select__option--active]="activeIndex() === i"
            [class.tk-select__option--selected]="option.value === value()"
            [class.tk-select__option--disabled]="option.disabled"
            [attr.aria-selected]="option.value === value()"
            [attr.aria-disabled]="option.disabled || null"
            (click)="selectIndex(i, $event)"
            (mouseenter)="setActiveIndex(i)"
          >
            {{ option.label }}
          </li>
        }
      </ul>
    }
  `,
  styles: [
    TK_THEME_CSS,
    `
      :host {
        position: relative;
        display: block;
        width: 100%;
      }

      .tk-select__trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        width: 100%;
        min-height: var(--tk-control-height);
        padding: 6px 10px;
        border: 1px solid var(--tk-color-border);
        border-radius: var(--tk-radius-control);
        background: var(--tk-color-surface-muted);
        color: var(--tk-color-text);
        font: inherit;
        font-size: var(--tk-control-font-size);
        text-align: left;
        cursor: pointer;
        outline: none;
        transition: border-color 0.14s, box-shadow 0.14s, background-color 0.14s;
      }

      .tk-select__trigger:hover:not(:disabled) {
        border-color: var(--tk-color-border-strong);
      }

      .tk-select__trigger:focus-visible,
      :host.tk-select--open .tk-select__trigger {
        border-color: var(--tk-color-accent);
        background-color: var(--tk-color-surface);
        box-shadow: var(--tk-shadow-focus);
      }

      .tk-select__trigger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .tk-select__value {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tk-select__value--placeholder {
        color: var(--tk-color-text-muted);
      }

      .tk-select__chevron {
        flex-shrink: 0;
        color: var(--tk-color-text-muted);
        transition: transform 0.14s;
      }

      :host.tk-select--open .tk-select__chevron {
        transform: rotate(180deg);
      }

      .tk-select__list {
        position: absolute;
        z-index: 20;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        margin: 0;
        padding: 4px;
        list-style: none;
        max-height: 220px;
        overflow-y: auto;
        border: 1px solid var(--tk-color-border);
        border-radius: var(--tk-radius-control);
        background: var(--tk-color-surface);
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12);
      }

      .tk-select__option {
        padding: 7px 10px;
        border-radius: var(--tk-radius-control-sm);
        color: var(--tk-color-text);
        font-size: var(--tk-control-font-size);
        cursor: pointer;
      }

      .tk-select__option--active {
        background: var(--tk-color-surface-subtle);
      }

      .tk-select__option--selected {
        background: var(--tk-color-accent-soft);
        color: var(--tk-color-accent-hover);
        font-weight: 600;
      }

      .tk-select__option--selected.tk-select__option--active {
        background: var(--tk-color-accent-soft);
      }

      .tk-select__option--disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    `,
  ],
})
export class TkSelectComponent {
  private readonly generatedId = `tk-select-${nextSelectId++}`;
  readonly listboxId = `${this.generatedId}-listbox`;

  readonly value = input('');
  readonly options = input.required<readonly TkSelectOption[]>();
  readonly placeholder = input('Select…');
  readonly disabled = input(false);
  readonly id = input<string | undefined>(undefined);
  readonly valueChange = output<string>();

  readonly open = signal(false);
  readonly activeIndex = signal(-1);

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly listbox = viewChild<ElementRef<HTMLUListElement>>('listbox');

  readonly controlId = computed(() => this.id() ?? this.generatedId);
  readonly selectedOption = computed(
    () => this.options().find(option => option.value === this.value()) ?? null,
  );
  readonly activeOptionId = computed(() => {
    const index = this.activeIndex();
    return this.open() && index >= 0 ? this.optionId(index) : null;
  });

  optionId(index: number): string {
    return `${this.generatedId}-option-${index}`;
  }

  toggle(): void {
    if (this.disabled()) return;
    if (this.open()) this.close();
    else this.openList();
  }

  openList(): void {
    if (this.disabled() || this.open()) return;
    const selected = this.options().findIndex(option => option.value === this.value() && !option.disabled);
    const firstEnabled = this.options().findIndex(option => !option.disabled);
    this.activeIndex.set(selected >= 0 ? selected : firstEnabled);
    this.open.set(true);
    queueMicrotask(() => this.scrollActiveIntoView());
  }

  close(restoreFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    this.activeIndex.set(-1);
    if (restoreFocus) this.trigger()?.nativeElement.focus();
  }

  setActiveIndex(index: number): void {
    const option = this.options()[index];
    if (!option || option.disabled) return;
    this.activeIndex.set(index);
  }

  selectIndex(index: number, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();
    const option = this.options()[index];
    if (!option || option.disabled) return;
    this.valueChange.emit(option.value);
    this.close(true);
  }

  onHostKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.open()) this.openList();
        else this.moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!this.open()) this.openList();
        else this.moveActive(-1);
        break;
      case 'Home':
        if (this.open()) {
          event.preventDefault();
          this.moveActiveToEdge('start');
        }
        break;
      case 'End':
        if (this.open()) {
          event.preventDefault();
          this.moveActiveToEdge('end');
        }
        break;
      case 'Enter':
      case ' ':
        if (this.open()) {
          event.preventDefault();
          const index = this.activeIndex();
          if (index >= 0) this.selectIndex(index);
        } else if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.openList();
        }
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          event.stopPropagation();
          this.close(true);
        }
        break;
      default:
        break;
    }
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && (event.currentTarget as HTMLElement).contains(next)) return;
    this.close();
  }

  private moveActive(delta: number): void {
    const options = this.options();
    if (!options.length) return;
    let index = this.activeIndex();
    for (let attempt = 0; attempt < options.length; attempt += 1) {
      index = (index + delta + options.length) % options.length;
      if (!options[index]?.disabled) {
        this.activeIndex.set(index);
        this.scrollActiveIntoView();
        return;
      }
    }
  }

  private moveActiveToEdge(edge: 'start' | 'end'): void {
    const options = this.options();
    const indexes =
      edge === 'start'
        ? options.map((_, index) => index)
        : options.map((_, index) => options.length - 1 - index);
    const next = indexes.find(index => !options[index]?.disabled);
    if (next === undefined) return;
    this.activeIndex.set(next);
    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    const list = this.listbox()?.nativeElement;
    const index = this.activeIndex();
    if (!list || index < 0) return;
    const option = list.children.item(index) as HTMLElement | null;
    option?.scrollIntoView?.({ block: 'nearest' });
  }
}
