import { TOUR_SCHEMA_VERSION } from '@mfontecchio/ng-tourkit';
import { WORKFLOW_TOUR, WORKFLOW_TOUR_ID } from './workflow-tour';

describe('WORKFLOW_TOUR', () => {
  it('is a stable published auto-launch tour', () => {
    expect(WORKFLOW_TOUR.id).toBe(WORKFLOW_TOUR_ID);
    expect(WORKFLOW_TOUR.schemaVersion).toBe(TOUR_SCHEMA_VERSION);
    expect(WORKFLOW_TOUR.status).toBe('published');
    expect(WORKFLOW_TOUR.autoLaunch).toBe(true);
  });

  it('opens and closes with untargeted modal steps', () => {
    expect(WORKFLOW_TOUR.steps).toHaveLength(8);
    expect(WORKFLOW_TOUR.steps[0].target).toBeUndefined();
    expect(WORKFLOW_TOUR.steps.at(-1)?.target).toBeUndefined();
  });

  it('uses stable data-tour locators for targeted steps', () => {
    const targetedSteps = WORKFLOW_TOUR.steps.filter(step => step.target);

    expect(targetedSteps).not.toHaveLength(0);
    expect(
      targetedSteps.every(step =>
        step.target?.candidates[0]?.selector.startsWith('[data-tour="'),
      ),
    ).toBe(true);
  });

  it('demonstrates a tour across dashboard, manage, and settings routes', () => {
    expect(new Set(WORKFLOW_TOUR.steps.map(step => step.route).filter(Boolean))).toEqual(
      new Set(['/playground', '/playground/manage', '/playground/settings']),
    );
  });
});
