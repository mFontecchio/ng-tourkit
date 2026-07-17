# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Published package name is now `@mfontecchio/ng-tourkit` (npmjs.org org scope).

## [0.0.1] - 2026-07-16

### Added

- Guided tour player for Angular 20.3+ (`TkTourService`, overlay, popover, stage path).
- Audience targeting and auto-launch after navigation.
- Visual recorder entry point (`ng-tourkit/recorder`) for click-to-author tours.
- Manage UI entry point (`ng-tourkit/manage`) for tour CRUD, audit, and import/export.
- LocalStorage persistence adapters, with hooks to swap in production backends.
- Robust element targeting via multi-candidate selectors and DOM fingerprint healing.
- Accessibility support: dialog pattern, focus trap, live announcements, reduced motion.
- Demo app and GitHub Pages deploy workflow.
