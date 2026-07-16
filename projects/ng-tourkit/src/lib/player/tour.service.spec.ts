import { TestBed } from '@angular/core/testing';
import { ApplicationRef, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TOUR_SCHEMA_VERSION, TourDefinition } from '../models/tour.models';
import { generateLocator } from '../locator/selector-generator';
import { provideTourKit } from '../persistence/provide-tour-kit';
import { TourAuditAdapter } from '../persistence/adapters';
import { TkTourService } from './tour.service';

function makeTarget(testId: string, text: string): HTMLElement {
  const btn = document.createElement('button');
  btn.setAttribute('data-testid', testId);
  btn.textContent = text;
  document.body.appendChild(btn);
  return btn;
}

function makeTour(steps: TourDefinition['steps']): TourDefinition {
  return {
    schemaVersion: TOUR_SCHEMA_VERSION,
    id: 'tour-1',
    version: 3,
    name: 'Test tour',
    status: 'published',
    steps,
    createdAt: '',
    updatedAt: '',
  };
}

describe('TkTourService', () => {
  let service: TkTourService;
  let audit: TourAuditAdapter;

  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideTourKit({ userId: () => 'tester' }),
      ],
    });
    service = TestBed.inject(TkTourService);
    audit = TestBed.inject(TourAuditAdapter);
  });

  it('starts, shows a step, highlights the target and records audit events', async () => {
    const el = makeTarget('save-btn', 'Save');
    const tour = makeTour([
      { id: 's1', title: 'Save here', body: 'Click save.', target: generateLocator(el) },
    ]);

    await service.start(tour);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(service.state()).toBe('showing');
    expect(service.currentStep()?.id).toBe('s1');
    expect(service.stage()).not.toBeNull();
    expect(document.querySelector('tk-tour-host')).not.toBeNull();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();

    const events = await audit.getEvents('tour-1');
    expect(events.map(e => e.type)).toEqual(['started', 'step_viewed']);
    expect(events[0].userId).toBe('tester');
    expect(events[0].tourVersion).toBe(3);
  });

  it('advances, completes and tears down', async () => {
    const a = makeTarget('a-btn', 'Alpha');
    const b = makeTarget('b-btn', 'Beta');
    const tour = makeTour([
      { id: 's1', title: 'A', body: '', target: generateLocator(a) },
      { id: 's2', title: 'B', body: '', target: generateLocator(b) },
    ]);

    await service.start(tour);
    await service.next();
    expect(service.stepIndex()).toBe(1);

    await service.next();
    expect(service.state()).toBe('idle');
    expect(document.querySelector('tk-tour-host')).toBeNull();

    const events = await audit.getEvents('tour-1');
    expect(events.map(e => e.type)).toEqual([
      'started',
      'step_viewed',
      'step_viewed',
      'completed',
    ]);
  });

  it('replays a click action on next', async () => {
    const el = makeTarget('act-btn', 'Do it');
    const clicked = vi.fn();
    el.addEventListener('click', clicked);
    const tour = makeTour([
      { id: 's1', title: 'A', body: '', target: generateLocator(el), action: { kind: 'click' } },
    ]);

    await service.start(tour);
    await service.next();
    expect(clicked).toHaveBeenCalledOnce();
  });

  it('skips a step whose target never resolves (skip policy)', async () => {
    const b = makeTarget('real-btn', 'Real');
    const ghost = makeTarget('ghost-btn', 'Ghost');
    const ghostLocator = generateLocator(ghost);
    ghost.remove();

    const tour = makeTour([
      { id: 's1', title: 'Ghost', body: '', target: ghostLocator },
      { id: 's2', title: 'Real', body: '', target: generateLocator(b) },
    ]);

    await service.start(tour, { timeoutMs: 100 });
    expect(service.state()).toBe('showing');
    expect(service.currentStep()?.id).toBe('s2');
  });

  it('aborts on unresolvable target with abort policy and audits dismissal', async () => {
    const ghost = makeTarget('ghost2-btn', 'Ghost');
    const locator = generateLocator(ghost);
    ghost.remove();

    const tour = makeTour([{ id: 's1', title: 'Ghost', body: '', target: locator }]);
    await service.start(tour, { timeoutMs: 100, onStepError: 'abort' });

    expect(service.state()).toBe('idle');
    const events = await audit.getEvents('tour-1');
    expect(events.map(e => e.type)).toEqual(['started', 'dismissed']);
  });

  it('dismiss records audit and prev goes back', async () => {
    const a = makeTarget('p-a', 'Alpha');
    const b = makeTarget('p-b', 'Beta');
    const tour = makeTour([
      { id: 's1', title: 'A', body: '', target: generateLocator(a) },
      { id: 's2', title: 'B', body: '', target: generateLocator(b) },
    ]);

    await service.start(tour);
    await service.next();
    await service.prev();
    expect(service.stepIndex()).toBe(0);

    service.dismiss();
    expect(service.state()).toBe('idle');
    const events = await audit.getEvents('tour-1');
    expect(events.at(-1)?.type).toBe('dismissed');
  });

  it('modal step (no target) shows with null stage', async () => {
    const tour = makeTour([{ id: 's1', title: 'Welcome', body: 'Hi!' }]);
    await service.start(tour);
    expect(service.state()).toBe('showing');
    expect(service.stage()).toBeNull();
    service.dismiss();
  });
});
