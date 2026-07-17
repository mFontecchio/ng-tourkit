# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Responsive/mobile support across built-in surfaces. The player popover, recorder
  panel, and tour manager now adapt to small screens (single `768px` breakpoint),
  respect `env(safe-area-inset-*)`, and constrain themselves to the viewport.
- Visual viewport tracking: overlay stage and popover positioning follow the
  `VisualViewport` (pinch-zoom, on-screen keyboard, mobile browser chrome) and fall
  back to the layout viewport when unavailable.

### Changed

- Popover positioning now clamps within the visual viewport (including its offset),
  so popovers stay fully on-screen when the visual and layout viewports differ.
- Recorder panel uses a fluid width (`min(width, 100vw - padding)`) with a scrollable
  max-height instead of a fixed width.
- Tour manager switches from a table to a stacked card layout below `768px`.

## [0.1.0] - 2026-07-17

### Added

- Shared UI theme (`TK_THEME_CSS`) with reusable control classes (`tk-input`, `tk-btn`, etc.)
  and themable `--tk-*` CSS variables.
- `TkSelectComponent` — dependency-free custom listbox select with keyboard navigation and
  ARIA support; exported from `ng-tourkit`.
- Unified control styling across the player popover, recorder panel, and tour manager.

### Changed

- Recorder selects (popover side, load tour) now use `tk-select` instead of native
  `<select>` elements for consistent option-list styling.

## [0.0.1] - 2026-07-16

### Changed

- Published package name is now `@mfontecchio/ng-tourkit` (npmjs.org org scope).

### Added

- Guided tour player for Angular 20.3+ (`TkTourService`, overlay, popover, stage path).
- Audience targeting and auto-launch after navigation.
- Visual recorder entry point (`ng-tourkit/recorder`) for click-to-author tours.
- Manage UI entry point (`ng-tourkit/manage`) for tour CRUD, audit, and import/export.
- LocalStorage persistence adapters, with hooks to swap in production backends.
- Robust element targeting via multi-candidate selectors and DOM fingerprint healing.
- Accessibility support: dialog pattern, focus trap, live announcements, reduced motion.
- Demo app and GitHub Pages deploy workflow.
