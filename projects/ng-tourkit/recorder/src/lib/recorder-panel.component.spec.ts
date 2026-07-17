import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTourKit, TourDefinition, TourStep, TourStorageAdapter } from 'ng-tourkit';
import { TkCaptureService } from './capture.service';
import { TkTourRecorderPanelComponent } from './recorder-panel.component';

describe('TkTourRecorderPanelComponent', () => {
  let storage: TourStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
    TestBed.configureTestingModule({
      imports: [TkTourRecorderPanelComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTourKit()],
    });
    storage = TestBed.inject(TourStorageAdapter);
  });

  afterEach(() => {
    TestBed.inject(TkCaptureService).stop();
    localStorage.clear();
    document.body.innerHTML = '';
  });

  it('adds a picked app element as a step', () => {
    const fixture = TestBed.createComponent(TkTourRecorderPanelComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const target = document.createElement('button');
    target.setAttribute('data-tour', 'billing-tab');
    document.body.appendChild(target);

    component.addStep();
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    component.patchForm({ title: 'Billing' });
    component.saveStep();

    expect(component.steps().length).toBe(1);
    expect(component.steps()[0]?.target?.candidates[0]?.selector).toContain('billing-tab');
  });

  it('shows a change target action when editing an element step', () => {
    const fixture = TestBed.createComponent(TkTourRecorderPanelComponent);
    const component = fixture.componentInstance;
    component.steps.set([validStep()]);

    component.editStep(0);
    fixture.detectChanges();

    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    expect(buttons.some(button => button.textContent?.includes('Change target'))).toBe(true);
  });

  it('retargets an edited step while preserving the rest of the form', () => {
    const fixture = TestBed.createComponent(TkTourRecorderPanelComponent);
    const component = fixture.componentInstance;
    const original = validStep({
      id: 'step-preserve',
      title: 'Original title',
      body: 'Original body',
      side: 'left',
      action: { kind: 'click' },
      route: '/old-route',
      waitFor: { timeoutMs: 1234 },
    });
    component.steps.set([original]);
    const replacement = document.createElement('button');
    replacement.setAttribute('data-tour', 'replacement-target');
    document.body.appendChild(replacement);

    component.editStep(0);
    component.changeTarget();
    replacement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(component.form()).toEqual(
      expect.objectContaining({
        index: 0,
        title: 'Original title',
        body: 'Original body',
        side: 'left',
        clickAction: true,
        waitTimeout: 1234,
        route: '/',
      }),
    );
    expect(component.form()?.target?.candidates[0]?.selector).toContain('replacement-target');
    expect(component.form()?.quality).toBe('stable');

    component.saveStep();

    expect(component.steps()).toHaveLength(1);
    expect(component.steps()[0]).toEqual(
      expect.objectContaining({
        id: 'step-preserve',
        title: 'Original title',
        body: 'Original body',
        side: 'left',
        action: { kind: 'click' },
        route: '/',
        waitFor: { timeoutMs: 1234 },
      }),
    );
    expect(component.steps()[0]?.target?.candidates[0]?.selector).toContain('replacement-target');
  });

  it('keeps the original target when retargeting is cancelled', () => {
    const fixture = TestBed.createComponent(TkTourRecorderPanelComponent);
    const component = fixture.componentInstance;
    const original = validStep({ id: 'step-cancel' });
    component.steps.set([original]);

    component.editStep(0);
    component.changeTarget();
    component.cancelTargetPick();

    expect(component.form()?.target).toBe(original.target);
    expect(component.capture.mode()).toBe('passthrough');
  });

  it('keeps the original target when retargeting is cancelled with Escape', () => {
    const fixture = TestBed.createComponent(TkTourRecorderPanelComponent);
    const component = fixture.componentInstance;
    const original = validStep({ id: 'step-escape' });
    component.steps.set([original]);

    component.editStep(0);
    component.changeTarget();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(component.form()?.target).toBe(original.target);
    expect(component.capture.mode()).toBe('passthrough');
  });

  it('blocks publish with an empty name', async () => {
    const fixture = TestBed.createComponent(TkTourRecorderPanelComponent);
    const component = fixture.componentInstance;
    component.name.set('');
    component.steps.set([validStep()]);

    await component.publish();

    expect(component.issues().some(issue => issue.path === 'name')).toBe(true);
    expect(await storage.listTours()).toEqual([]);
  });

  it('bumps version when publishing a loaded published tour', async () => {
    await storage.saveTour(validTour({ status: 'published', version: 2 }));
    const fixture = TestBed.createComponent(TkTourRecorderPanelComponent);
    const component = fixture.componentInstance;

    await component.loadTour('tour-existing');
    component.name.set('Existing edited');
    await component.publish();

    expect((await storage.getTour('tour-existing'))?.version).toBe(3);
  });

  it('saves drafts through TourStorageAdapter', async () => {
    const fixture = TestBed.createComponent(TkTourRecorderPanelComponent);
    const component = fixture.componentInstance;
    component.id.set('tour-save');
    component.name.set('Save me');
    component.steps.set([validStep()]);

    await component.saveDraft();

    expect((await storage.getTour('tour-save'))?.status).toBe('draft');
  });
});

function validStep(patch: Partial<TourStep> = {}): TourStep {
  const button = document.createElement('button');
  button.setAttribute('data-tour', `target-${Math.random().toString(36).slice(2)}`);
  document.body.appendChild(button);
  const capture = TestBed.inject(TkCaptureService);
  return {
    id: `step-${Math.random().toString(36).slice(2)}`,
    title: 'Valid step',
    body: '',
    target: capture.pick(button).locator,
    side: 'bottom' as const,
    ...patch,
  };
}

function validTour(patch: Partial<TourDefinition> = {}): TourDefinition {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    id: 'tour-existing',
    version: 1,
    name: 'Existing',
    status: 'draft',
    steps: [validStep()],
    createdAt: now,
    updatedAt: now,
    ...patch,
  };
}
