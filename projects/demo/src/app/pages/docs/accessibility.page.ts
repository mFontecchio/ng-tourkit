import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-docs-accessibility',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>Accessibility &amp; mobile</h1>

    <h2>Accessibility</h2>
    <ul>
      <li>
        APG modal-dialog pattern: <code>role="dialog"</code>, <code>aria-modal</code>, focus trap
        with wrap, focus restore, Escape to dismiss
      </li>
      <li>Off-screen <code>aria-live="polite"</code> announcements per step</li>
      <li><code>inert</code> background for modal steps</li>
      <li>
        <code>prefers-reduced-motion</code> disables overlay stage animation and smooth scrolling
      </li>
      <li>Full keyboard control (← / → / Esc)</li>
    </ul>

    <h2>Responsive / mobile</h2>
    <p>All built-in surfaces reflow at a single <code>768px</code> breakpoint:</p>
    <ul>
      <li>Popover, recorder, and manager honor <code>env(safe-area-inset-*)</code></li>
      <li>
        Overlay and popover track <code>VisualViewport</code> so steps stay aligned during
        pinch-zoom, on-screen keyboard, or collapsing mobile chrome
      </li>
      <li>When VisualViewport is unavailable, positioning falls back to the layout viewport</li>
    </ul>
  `,
})
export class AccessibilityPage {}
