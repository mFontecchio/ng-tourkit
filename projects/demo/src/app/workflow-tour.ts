import {
  ElementLocator,
  TOUR_SCHEMA_VERSION,
  TourDefinition,
} from '@mfontecchio/ng-tourkit';

export const WORKFLOW_TOUR_ID = 'ng-tourkit-workflow';

function dataTourLocator(value: string, tag: string, text = ''): ElementLocator {
  return {
    version: 1,
    candidates: [
      {
        selector: `[data-tour="${value}"]`,
        strategy: 'test-id',
        score: 0,
      },
    ],
    fingerprint: {
      tag,
      text,
      attributes: { 'data-tour': value },
      depth: 0,
      siblingIndex: 0,
      ancestry: [],
    },
  };
}

export const WORKFLOW_TOUR: TourDefinition = {
  schemaVersion: TOUR_SCHEMA_VERSION,
  id: WORKFLOW_TOUR_ID,
  version: 1,
  name: 'ng-tourkit Workflow',
  description: 'See how ng-tourkit tours are recorded, managed, and played.',
  status: 'published',
  autoLaunch: true,
  createdAt: '2026-07-17T00:00:00.000Z',
  updatedAt: '2026-07-17T00:00:00.000Z',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to ng-tourkit',
      body: 'This short tour follows the complete workflow: record an experience, manage its lifecycle, and play it for the right users.',
      route: '/',
    },
    {
      id: 'dashboard',
      title: 'Tours where users need them',
      body: 'The dashboard represents your product UI. Tour steps can highlight any stable element in your Angular application.',
      target: dataTourLocator('home-title', 'h1', 'Dashboard'),
      route: '/',
      side: 'bottom',
      align: 'start',
    },
    {
      id: 'play',
      title: 'Publish and play',
      body: 'Published, audience-eligible tours appear here. Users can launch them manually, while auto-launch can introduce timely guidance.',
      target: dataTourLocator('available-tours', 'div'),
      route: '/',
      side: 'left',
      align: 'start',
    },
    {
      id: 'record',
      title: 'Record visually',
      body: 'Open the recorder, click real UI elements, and add clear titles and instructions without hand-writing selectors.',
      target: dataTourLocator('record-button', 'button', 'Record'),
      route: '/',
      side: 'bottom',
      align: 'end',
    },
    {
      id: 'manage',
      title: 'Manage the lifecycle',
      body: 'Review drafts, edit recorded steps, publish versions, duplicate tours, and inspect engagement events from one place.',
      target: dataTourLocator('manage-title', 'h1', 'Manage Tours'),
      route: '/manage',
      side: 'bottom',
      align: 'start',
    },
    {
      id: 'multi-route',
      title: 'Guide users across routes',
      body: 'Each step can declare its Angular route. The player navigates first, waits for the target, and then positions the highlight.',
      target: dataTourLocator('settings-title', 'h1', 'Settings'),
      route: '/settings',
      side: 'bottom',
      align: 'start',
    },
    {
      id: 'rerun',
      title: 'Available whenever you need it',
      body: 'Auto-launch runs once per user and tour version. This persistent action lets anyone replay the workflow on demand.',
      target: dataTourLocator('workflow-tour-cta', 'section'),
      route: '/',
      side: 'bottom',
      align: 'start',
    },
    {
      id: 'complete',
      title: 'Record. Manage. Play.',
      body: 'That is the ng-tourkit workflow. Try recording a tour, then open Manage Tours to publish and inspect it.',
      route: '/',
    },
  ],
};
