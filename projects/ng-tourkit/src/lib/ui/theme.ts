/**
 * Shared, dependency-free control theme for ng-tourkit surfaces.
 * Defaults live on `:host`; consumers can override any `--tk-*` token.
 */
export const TK_THEME_CSS = `
  :host {
    --tk-color-surface: #ffffff;
    --tk-color-surface-muted: #f9fafb;
    --tk-color-surface-subtle: #f3f4f6;
    --tk-color-text: #111827;
    --tk-color-text-muted: #6b7280;
    --tk-color-text-subtle: #374151;
    --tk-color-border: #d1d5db;
    --tk-color-border-strong: #9ca3af;
    --tk-color-accent: #2563eb;
    --tk-color-accent-hover: #1d4ed8;
    --tk-color-accent-active: #1e40af;
    --tk-color-accent-soft: #eff6ff;
    --tk-color-danger: #b91c1c;
    --tk-color-danger-soft: #fef2f2;
    --tk-color-danger-border: #fecaca;
    --tk-radius-control: 8px;
    --tk-radius-control-sm: 6px;
    --tk-shadow-focus: 0 0 0 3px rgba(59, 130, 246, 0.15);
    --tk-font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --tk-control-height: 34px;
    --tk-control-padding-x: 10px;
    --tk-control-font-size: 13px;
    box-sizing: border-box;
    font-family: var(--tk-font-family);
  }

  .tk-field {
    display: grid;
    gap: 4px;
    margin-bottom: 8px;
  }

  .tk-field:last-child {
    margin-bottom: 0;
  }

  .tk-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--tk-color-text-subtle);
  }

  .tk-input,
  .tk-textarea,
  .tk-btn {
    font: inherit;
    font-size: var(--tk-control-font-size);
    box-sizing: border-box;
    outline: none;
  }

  .tk-input,
  .tk-textarea {
    width: 100%;
    min-height: var(--tk-control-height);
    padding: 6px var(--tk-control-padding-x);
    border: 1px solid var(--tk-color-border);
    border-radius: var(--tk-radius-control);
    background: var(--tk-color-surface-muted);
    color: var(--tk-color-text);
    transition: border-color 0.14s, box-shadow 0.14s, background-color 0.14s;
  }

  .tk-input:focus,
  .tk-textarea:focus {
    border-color: var(--tk-color-accent);
    background-color: var(--tk-color-surface);
    box-shadow: var(--tk-shadow-focus);
  }

  .tk-input:disabled,
  .tk-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tk-textarea {
    min-height: 64px;
    resize: vertical;
    padding-top: 8px;
  }

  .tk-check {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    cursor: pointer;
    font-size: 12px;
    color: var(--tk-color-text-subtle);
  }

  .tk-check__input {
    width: 15px;
    height: 15px;
    accent-color: var(--tk-color-accent);
    flex-shrink: 0;
    cursor: pointer;
  }

  .tk-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    min-height: var(--tk-control-height);
    padding: 6px 12px;
    border: 1px solid var(--tk-color-border);
    border-radius: var(--tk-radius-control);
    background: var(--tk-color-surface);
    color: var(--tk-color-text-subtle);
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.12s, border-color 0.12s, box-shadow 0.12s, color 0.12s;
  }

  .tk-btn:hover {
    background: var(--tk-color-surface-muted);
    border-color: var(--tk-color-border-strong);
  }

  .tk-btn:active {
    background: var(--tk-color-surface-subtle);
  }

  .tk-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  .tk-btn:focus-visible {
    box-shadow: var(--tk-shadow-focus);
    border-color: var(--tk-color-accent);
  }

  .tk-btn--primary {
    background: var(--tk-color-accent);
    border-color: var(--tk-color-accent);
    color: #fff;
  }

  .tk-btn--primary:hover {
    background: var(--tk-color-accent-hover);
    border-color: var(--tk-color-accent-hover);
  }

  .tk-btn--primary:active {
    background: var(--tk-color-accent-active);
    border-color: var(--tk-color-accent-active);
  }

  .tk-btn--ghost {
    background: transparent;
    border-color: transparent;
    color: var(--tk-color-text-muted);
  }

  .tk-btn--ghost:hover {
    background: var(--tk-color-surface-subtle);
    border-color: transparent;
    color: var(--tk-color-text-subtle);
  }

  .tk-btn--danger {
    color: var(--tk-color-danger);
  }

  .tk-btn--danger:hover {
    background: var(--tk-color-danger-soft);
    border-color: var(--tk-color-danger-border);
  }

  .tk-btn--sm {
    min-height: 28px;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: var(--tk-radius-control-sm);
  }
`;
