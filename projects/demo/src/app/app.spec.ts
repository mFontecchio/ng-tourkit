import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTourKit } from '@mfontecchio/ng-tourkit';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideTourKit()],
    }).compileComponents();
  });

  it('should create the app and render nav', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).querySelector('nav')).toBeTruthy();
  });

  it('exposes stable tour anchors on the shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('[data-tour="record-button"]')).toBeTruthy();
    expect(host.querySelector('[data-tour="manage-tours-link"]')).toBeTruthy();
  });
});
