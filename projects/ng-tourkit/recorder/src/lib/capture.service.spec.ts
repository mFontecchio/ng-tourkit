import { DOCUMENT } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TkCaptureService } from './capture.service';

describe('TkCaptureService', () => {
  let service: TkCaptureService;

  beforeEach(() => {
    document.body.innerHTML = '';
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: DOCUMENT, useValue: document }],
    });
    service = TestBed.inject(TkCaptureService);
  });

  afterEach(() => {
    service.stop();
    document.body.innerHTML = '';
  });

  it('starts and stops document listeners', () => {
    const button = document.createElement('button');
    button.setAttribute('data-tour', 'save-button');
    document.body.appendChild(button);

    service.start();
    button.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    expect(service.hovered()).toBe(button);

    service.stop();
    button.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    expect(service.hovered()).toBeNull();
  });

  it('intercepts clicks in pick mode and records locator quality', () => {
    const button = document.createElement('button');
    button.setAttribute('data-tour', 'save-button');
    document.body.appendChild(button);
    let reachedApp = false;
    button.addEventListener('click', () => (reachedApp = true));

    service.start();
    service.mode.set('pick');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(reachedApp).toBe(false);
    expect(service.lastPicked()?.element).toBe(button);
    expect(service.lastPicked()?.quality).toBe('stable');
    expect(service.lastPicked()?.locator.candidates[0]?.selector).toContain('data-tour');
  });

  it('ignores recorder UI elements', () => {
    const recorder = document.createElement('div');
    const recorderButton = document.createElement('button');
    recorder.setAttribute('data-tk-recorder', '');
    recorder.appendChild(recorderButton);
    document.body.appendChild(recorder);

    service.start();
    service.mode.set('pick');
    recorderButton.dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    recorderButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(service.hovered()).toBeNull();
    expect(service.lastPicked()).toBeNull();
  });
});
